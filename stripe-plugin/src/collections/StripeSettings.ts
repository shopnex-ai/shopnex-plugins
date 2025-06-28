import { CollectionConfig, deepMergeWithCombinedArrays } from "payload";
import { EncryptedField } from "@shopnex/utils";

export type StripConfigProps = {
    overrides?: Partial<CollectionConfig>;
};

export const StripeSettings = ({
    overrides = {},
}: StripConfigProps): CollectionConfig => {
    const baseConfig: CollectionConfig = {
        slug: "stripe-settings",
        access: {
            ...overrides?.access,
        },
        admin: {
            group: "Plugins",
        },
        fields: [
            {
                type: "checkbox",
                name: "testMode",
                admin: {
                    position: "sidebar",
                },
            },
            {
                label: "Credentials",
                type: "collapsible",
                fields: [
                    {
                        type: "row",
                        fields: [
                            EncryptedField({
                                name: "secretKey",
                                type: "text",
                            }),
                            EncryptedField({
                                name: "webhooksEndpointSecret",
                                type: "text",
                            }),
                        ],
                    },
                    EncryptedField({
                        name: "publishableKey",
                        type: "text",
                    }),
                ],
            },
        ],
    };

    return deepMergeWithCombinedArrays(baseConfig, overrides);
};
