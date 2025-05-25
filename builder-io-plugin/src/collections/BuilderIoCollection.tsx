import { CollectionConfig, deepMergeWithCombinedArrays } from "payload";
import { encryptedField } from "@shopnex/utils";

export type BuilderIoCollectionProps = {
    overrides?: Partial<CollectionConfig>;
};

export const BuilderIoCollection = ({
    overrides = {},
}: BuilderIoCollectionProps): CollectionConfig => {
    const baseConfig: CollectionConfig = {
        slug: "builder-io",
        labels: {
            singular: "Builder.io",
            plural: "Builder.io",
        },
        admin: {
            group: "Plugins",
            useAsTitle: "builderIoPublicKey",
        },
        fields: [
            {
                type: "row",
                fields: [
                    {
                        name: "builderIoPublicKey",
                        type: "text",
                        required: true,
                    },
                    encryptedField({
                        required: true,
                        name: "builderIoPrivateKey",
                        type: "text",
                    }),
                ],
            },
        ],
    };

    return deepMergeWithCombinedArrays(baseConfig, overrides);
};
