import type { CollectionConfig, Config, SelectField } from "payload";
import { WooImporter } from "./collections/WooImporter";

type WooImporterPluginConfig = {
    enabled?: boolean;
    collectionOverrides?: Partial<CollectionConfig>;
};

export const wooImporterPlugin = (
    pluginConfig: WooImporterPluginConfig = {}
) => {
    return (config: Config): Config => {
        config.collections!.push(
            WooImporter({
                overrides: pluginConfig.collectionOverrides,
            })
        );
        const productCollection = config.collections?.find(
            (c) => c.slug === "products"
        );
        const orderCollection = config.collections?.find(
            (c) => c.slug === "orders"
        );
        const sourceProductField = productCollection?.fields?.find(
            (field) => (field as SelectField).name === "source"
        ) as SelectField;

        const sourceOrderField = orderCollection?.fields?.find(
            (field) => (field as SelectField).name === "source"
        ) as SelectField;

        sourceProductField.options.push({
            label: "WooCommerce",
            value: "wc",
        });

        sourceOrderField.options.push({
            label: "WooCommerce",
            value: "wc",
        });
        return config;
    };
};

export default wooImporterPlugin;
