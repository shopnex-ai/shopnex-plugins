import type { BlocksField, Config, Endpoint } from "payload";

import type { SanitizedStripePluginConfig, StripePluginConfig } from "./types";

import { stripeWebhooks } from "./routes/webhooks";
import { StripeBlock } from "./blocks/StripeBlock";
import { stripeSessionCheckout } from "./hooks/stripe-session-checkout";

export const stripePlugin =
    (incomingStripeConfig: StripePluginConfig) =>
    (config: Config): Config => {
        const { collections } = config;

        // set config defaults here
        const pluginConfig: SanitizedStripePluginConfig = {
            ...incomingStripeConfig,
        };

        const endpoints: Endpoint[] = [
            ...(config?.endpoints || []),
            {
                handler: async (req) => {
                    const res = await stripeWebhooks({
                        config,
                        pluginConfig,
                        req,
                    });

                    return res;
                },
                method: "post",
                path: "/stripe/webhooks",
            },
        ];

        config.endpoints = endpoints;

        const paymentsCollection = collections?.find(
            (c) => c.slug === incomingStripeConfig?.paymentCollectionSlug
        );

        if (paymentsCollection) {
            const providerField = paymentsCollection.fields.find(
                (f: any) => f.name === "providers"
            ) as BlocksField;
            providerField.blocks.push(
                StripeBlock({ secretAccess: pluginConfig.secretAccess })
            );
        }
        const ordersCollection = collections?.find(
            (c) =>
                c.slug ===
                (incomingStripeConfig?.ordersCollectionSlug || "orders")
        );

        if (ordersCollection) {
            ordersCollection.hooks = {
                ...(ordersCollection.hooks || {}),
                beforeChange: [
                    ...(ordersCollection.hooks?.beforeChange || []),
                    stripeSessionCheckout,
                ],
            };
        }

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
        };

        return config;
    };
