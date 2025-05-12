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
    },
    fields: [
        {
            type: "row",
            fields: [
                encryptedField({
                    required: true,
                    name: "builderIoPrivateKey",
                    type: "text",
                }),
                {
                    name: "builderIoPublicKey",
                    type: "text",
                    required: true,
                },
            ],
        },
    ],
};
