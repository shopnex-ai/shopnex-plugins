import type { BlocksField, Config, Endpoint } from "payload";

import type { SanitizedStripePluginConfig, StripePluginConfig } from "./types";

import { getFields } from "./fields/getFields";
import { createNewInStripe } from "./hooks/createNewInStripe";
import { deleteFromStripe } from "./hooks/deleteFromStripe";
import { syncExistingWithStripe } from "./hooks/syncExistingWithStripe";
import { stripeREST } from "./routes/rest";
import { stripeWebhooks } from "./routes/webhooks";
import { setTenantCredentials } from "./utilities/stripeConfig";
import { StripeConfig } from "./collections/StripeConfig";
import { StripeBlock } from "./blocks/StripeBlock";

export { stripeProxy } from "./utilities/stripeProxy";

export const stripePlugin =
    (incomingStripeConfig: StripePluginConfig) =>
    (config: Config): Config => {
        const { collections } = config;

        // set config defaults here
        const pluginConfig: SanitizedStripePluginConfig = {
            ...incomingStripeConfig,
            rest: incomingStripeConfig?.rest ?? false,
            sync: incomingStripeConfig?.sync || [],
        };

        // NOTE: env variables are never passed to the client, but we need to know if `stripeSecretKey` is a test key
        // unfortunately we must set the 'isTestKey' property on the config instead of using the following code:
        // const isTestKey = stripeConfig.stripeSecretKey?.startsWith('sk_test_');

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

        if (incomingStripeConfig?.rest) {
            endpoints.push({
                handler: async (req) => {
                    const res = await stripeREST({
                        pluginConfig,
                        req,
                    });

                    return res;
                },
                method: "post" as Endpoint["method"],
                path: "/stripe/rest",
            });
        }

        for (const collection of collections as any) {
            const { hooks: existingHooks } = collection;

            const syncConfig = pluginConfig.sync?.find(
                (sync) => sync.collection === collection.slug
            );

            if (!syncConfig) {
                continue;
            }
            const fields = getFields({
                collection,
                pluginConfig,
                syncConfig,
            });
            collection.fields = fields;

            if (!collection.hooks) {
                collection.hooks = {};
            }

            collection.hooks.afterDelete = [
                ...(existingHooks?.afterDelete || []),
                (args: any) =>
                    deleteFromStripe({
                        ...args,
                        collection,
                        pluginConfig,
                    }),
            ];
            collection.hooks.beforeChange = [
                ...(existingHooks?.beforeChange || []),
                (args: any) =>
                    syncExistingWithStripe({
                        ...args,
                        collection,
                        pluginConfig,
                    }),
            ];
            collection.hooks.beforeValidate = [
                ...(existingHooks?.beforeValidate || []),
                (args: any) =>
                    createNewInStripe({
                        ...args,
                        collection,
                        pluginConfig,
                    }),
            ];
        }

        config.endpoints = endpoints;

        const paymentsCollection = collections?.find(
            (c) => c.slug === incomingStripeConfig?.paymentCollectionSlug
        );

        if (paymentsCollection) {
            const providerField = paymentsCollection.fields.find(
                (f: any) => f.name === "providers"
            ) as BlocksField;
            providerField.blocks.push(StripeBlock);
        }

        // collections?.push(StripeConfig({ overrides: pluginConfig.collectionOverrides }));

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
            // const stripeSettings = await payload.find({
            //     collection: "stripe-settings",
            // });
            // stripeSettings.docs.forEach((config: any) => {
            //     setTenantCredentials(config?.shop?.slug || "default", {
            //         secretKey: config.secretKey,
            //         webhooksEndpointSecret: config.webhooksEndpointSecret,
            //         publishableKey: config.publishableKey,
            //     });
            // });
        };

        return config;
    };
