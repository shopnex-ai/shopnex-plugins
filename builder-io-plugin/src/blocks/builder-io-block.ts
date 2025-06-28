import { Block } from "payload";
import { EncryptedField } from "@shopnex/utils";

export const BuilderIoBlock: Block = {
    slug: "builder-io",
    labels: {
        singular: "Builder.io",
        plural: "Builder.io",
    },
    imageURL: "/builder-io-logo.webp",
    admin: {
        disableBlockName: true,
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
                EncryptedField({
                    required: true,
                    name: "builderIoPrivateKey",
                    type: "text",
                }),
            ],
        },
    ],
};
