import { CollectionConfig, deepMergeWithCombinedArrays } from "payload";
import { EncryptedField } from "@shopnex/utils";
import { importWooData } from "../hooks/import-woo-data";

export type WooImporterProps = {
    overrides?: Partial<CollectionConfig>;
};

export const WooImporter = ({
    overrides = {},
}: WooImporterProps): CollectionConfig => {
    const baseConfig: CollectionConfig = {
        slug: "woo-importer",
        admin: {
            group: "Plugins",
            components: {
                edit: {
                    SaveButton: {
                        path: "@shopnex/woo-importer-plugin/client#SaveButton",
                    },
                },
            },
        },
        hooks: {
            beforeChange: [importWooData],
        },
        labels: {
            singular: "Woo Importer",
            plural: "Woo Importer",
        },
        fields: [
            {
                label: "Credentials",
                type: "collapsible",
                fields: [
                    {
                        name: "url",
                        type: "text",
                        admin: {
                            description:
                                "Your Store URL, example: https://woo.dev",
                        },
                    },
                    {
                        type: "row",
                        fields: [
                            EncryptedField({
                                admin: {
                                    description:
                                        "Your WooCommerce API consumer key",
                                },
                                name: "consumerKey",
                                label: "Consumer Key",
                                type: "text",
                            }),
                            EncryptedField({
                                admin: {
                                    description:
                                        "Your WooCommerce API consumer secret",
                                },
                                name: "consumerSecret",
                                label: "Consumer Secret",
                                type: "text",
                                required: true,
                            }),
                        ],
                    },
                ],
            },
        ],
    };
    return deepMergeWithCombinedArrays(baseConfig, overrides);
};
