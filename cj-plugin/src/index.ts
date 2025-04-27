import type { CollectionConfig, Config, FieldBase, SelectField } from "payload";
import { setTenantCredentials } from "./sdk/access-token";
import { createOrderHook } from "./service/create-order.hook";
import { CjConfigCollection, CjCollectionProps } from "./CjConfig";

interface PluginOptions {
    cjApiKey: string;
    cjEmailAddress: string;
    cjRefreshToken?: string;
    asCollection?: boolean;
    collectionOverrides?: CjCollectionProps["overrides"];
}

const updateCollection = (collection: CollectionConfig) => {
    if (collection.slug === "orders") {
        return {
            ...collection,
            hooks: {
                ...collection.hooks,
                afterChange: [...(collection.hooks?.afterChange || []), createOrderHook],
            },
        };
    }
    return collection;
};

export const cjPlugin =
    (pluginOptions: PluginOptions) =>
    (config: Config): Config => {
        const updatedCollections = config.collections?.map(updateCollection) || [];

        if (pluginOptions.asCollection) {
            updatedCollections.push(
                CjConfigCollection({ overrides: pluginOptions.collectionOverrides }),
            );
        }

        const productCollection = updatedCollections.find(
            (collection) => collection.slug === "products",
        );

        const sourceField = productCollection?.fields?.find(
            (field) => (field as SelectField).name === "source",
        ) as SelectField;

        sourceField.options.push({
            label: "CJ",
            value: "cj",
        });

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
            const cjSettings = await payload.find({
                collection: "cj-settings",
            });
            cjSettings.docs.forEach((config: any) => {
                setTenantCredentials(config?.shop?.slug || "default", {
                    emailAddress: config.email,
                    password: config.apiToken,
                });
            });
        };

        return {
            ...config,
            collections: updatedCollections,
            globals: [...(config.globals || [])],
        };
    };
