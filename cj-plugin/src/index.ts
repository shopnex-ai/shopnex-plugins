import type { Config, SelectField } from "payload";
import { setTenantCredentials } from "./sdk/access-token";
import { createOrderHook } from "./service/create-order.hook";
import { CjCollectionProps, CjConfigCollection, CjGlobalProps, CjSettings } from "./cj-settings";

interface PluginOptions {
    isEnabled?: boolean;
    cjApiKey: string;
    cjEmailAddress: string;
    cjRefreshToken?: string;
    isGlobal?: boolean;
    collectionOverrides?: CjCollectionProps["overrides"];
    globalOverrides?: CjGlobalProps["overrides"];
    orderCollectionSlug?: string;
}

export const cjPlugin =
    (pluginOptions: PluginOptions) =>
    (config: Config): Config => {
        const isGlobal = pluginOptions.isGlobal ?? true;

        const isEnabled = pluginOptions.isEnabled ?? true;

        const ordersCollection = config.collections?.find(
            (collection) => collection.slug === (pluginOptions.orderCollectionSlug || "orders"),
        );

        if (!ordersCollection) {
            throw new Error("No orders collection found");
        }

        if (!ordersCollection.hooks) {
            ordersCollection.hooks = {};
        }

        if (!ordersCollection.hooks?.afterChange?.length) {
            ordersCollection.hooks.afterChange = [];
        }

        if (isGlobal) {
            config.globals?.push(CjSettings({ overrides: pluginOptions.globalOverrides }));
        } else {
            config.collections?.push(
                CjConfigCollection({ overrides: pluginOptions.collectionOverrides }),
            );
        }
        const productCollection = config.collections?.find(
            (collection) => collection.slug === "products",
        );

        const sourceField = productCollection?.fields?.find(
            (field) => (field as SelectField).name === "source",
        ) as SelectField;

        sourceField.options.push({
            label: "CJ",
            value: "cj",
        });

        if (!isEnabled) {
            return config;
        }
        if (ordersCollection.hooks?.afterChange) {
            ordersCollection.hooks.afterChange.push(createOrderHook);
        }

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }

            const cjSettingsDocs: any = [];

            if (isGlobal) {
                setTenantCredentials("1", {
                    emailAddress: pluginOptions.cjEmailAddress,
                    password: pluginOptions.cjApiKey,
                    refreshToken: pluginOptions.cjRefreshToken,
                });
                return;
            } else {
                const cjSettings = await payload.find({
                    collection: "cj-settings" as any,
                });

                cjSettingsDocs.push(...cjSettings?.docs);
            }

            cjSettingsDocs.forEach((config: any) => {
                setTenantCredentials(config?.shop?.slug || "1", {
                    emailAddress: config.email || process.env.CJ_EMAIL_ADDRESS,
                    password: config.apiToken || process.env.CJ_PASSWORD,
                });
            });
        };

        return config;
    };
