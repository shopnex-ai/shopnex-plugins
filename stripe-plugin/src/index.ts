import type { BlocksField, Config, Endpoint } from "payload";

import type { SanitizedStripePluginConfig, StripePluginConfig } from "./types";

import { stripeWebhooks } from "./routes/webhooks";
import { StripeBlock } from "./blocks/StripeBlock";

export { stripeCheckout } from "./services/stripe-checkout";
import pkg from "../package.json";

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

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
            await config.custom?.syncPlugin?.(payload, {
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                license: pkg.license,
                author: pkg.author,
                icon: pkg.icon,
                category: pkg.category,
            });
        };

        return config;
    };
