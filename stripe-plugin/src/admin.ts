import type { Config } from "payload";

import type { SanitizedStripePluginConfig, StripePluginConfig } from "./types";

export const stripePlugin =
    (incomingPluginConfig: StripePluginConfig) =>
    (config: Config): Config => {
        const { collections } = config;

        // set config defaults here
        const pluginConfig: SanitizedStripePluginConfig = {
            ...incomingPluginConfig,
        };

        // NOTE: env variables are never passed to the client, but we need to know if `stripeSecretKey` is a test key
        // unfortunately we must set the 'isTestKey' property on the config instead of using the following code:
        // const isTestKey = stripeConfig.stripeSecretKey?.startsWith('sk_test_');

        return {
            ...config,
        };
    };
