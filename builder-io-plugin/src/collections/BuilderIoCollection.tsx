import { CollectionConfig } from "payload";
import { encryptedField } from "@shopnex/utils";

export const BuilderIoCollection: CollectionConfig = {
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
