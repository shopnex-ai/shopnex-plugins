// src/plugins/paypal/index.ts
import type { Config } from "payload";
import type { CollectionConfig, Field } from "payload";
import payload from "payload"; // Import payload instance for endpoint access
import { getPayPalClient } from "./paypal-client"; // We will create this helper
import { createOrder } from "./endpoints/create-order"; // We will create this
import { captureOrder } from "./endpoints/capture-order"; // We will create this
import { handleWebhook } from "./endpoints/webhook"; // We will create this
import { PayPalBlock } from "./blocks/PayPalBlock";

// Define Plugin Configuration Interface
interface PayPalPluginConfig {
    /**
     * Slug of the collection where payments are stored.
     * This collection MUST have a 'blocks' field named 'provider'.
     */
    paymentCollectionSlug: string;
    /**
     * Optional: Enable the plugin. Defaults to true.
     */
    enabled?: boolean;
}

export const paypalPlugin =
    (pluginConfig: PayPalPluginConfig) =>
    (incomingConfig: Config): Config => {
        const { paymentCollectionSlug, enabled = true } = pluginConfig;

        if (!enabled) {
            console.log("PayPal Plugin is disabled.");
            return incomingConfig;
        }

        // --- Validate incoming config ---
        if (!paymentCollectionSlug) {
            throw new Error("PayPal Plugin requires `paymentCollectionSlug` in configuration.");
        }

        const config: Config = {
            ...incomingConfig,
            collections:
                incomingConfig.collections?.map((collection) => {
                    if (collection.slug === paymentCollectionSlug) {
                        // (Block injection logic remains the same)
                        const providerField = collection.fields.find(
                            (field): field is Field & { name: string; type: "blocks" } =>
                                "name" in field &&
                                field.name === "provider" &&
                                field.type === "blocks",
                        );

                        if (!providerField) {
                            throw new Error(
                                `PayPal Plugin: Collection '${paymentCollectionSlug}' must have a 'blocks' field named 'provider'.`,
                            );
                        }
                        if (!Array.isArray(providerField.blocks)) {
                            providerField.blocks = [];
                        }
                        if (
                            !providerField.blocks.some((block) => block.slug === PayPalBlock.slug)
                        ) {
                            console.log(
                                `PayPal Plugin: Injecting PayPalBlock into '${paymentCollectionSlug}' collection.`,
                            );
                            providerField.blocks.push(PayPalBlock);
                        }
                    }
                    return collection;
                }) || [],

            // --- Add Custom API Endpoints ---
            endpoints: [
                ...(incomingConfig.endpoints || []),
                {
                    path: `/api/paypal/create-order/:paymentId`, // Ensure path matches routeParams access
                    method: "post",
                    // Assign the handler directly
                    handler: createOrder,
                },
                {
                    path: `/api/paypal/capture-order/:paymentId`, // Ensure path matches routeParams access
                    method: "post",
                    // Assign the handler directly
                    handler: captureOrder,
                },
                {
                    path: `/api/paypal/webhook`,
                    method: "post",
                    // Assign the handler directly
                    handler: handleWebhook,
                },
            ],
        };

        // --- Final validation: Check if the target collection exists ---
        const paymentCollectionExists = config.collections?.some(
            (c) => c.slug === paymentCollectionSlug,
        );
        if (!paymentCollectionExists) {
            console.warn(
                `PayPal Plugin Warning: Collection with slug '${paymentCollectionSlug}' not found in Payload config.`,
            );
        } else {
            // Verify again that the provider field was modified successfully (optional sanity check)
            const targetCollection = config.collections?.find(
                (c) => c.slug === paymentCollectionSlug,
            ) as CollectionConfig;
            const providerField = targetCollection.fields.find(
                (f) => "name" in f && f.name === "provider",
            ) as any; // Type assertion for simplicity
            if (
                !providerField?.blocks?.some((b: { slug: string }) => b.slug === PayPalBlock.slug)
            ) {
                console.error(
                    `PayPal Plugin Error: Failed to add PayPalBlock to collection '${paymentCollectionSlug}'. Check field configuration.`,
                );
            }
        }

        return config;
    };
