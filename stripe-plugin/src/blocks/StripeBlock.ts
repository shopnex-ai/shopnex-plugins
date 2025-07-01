import { EncryptedField } from "@shopnex/utils";
import { Block } from "payload";

export const StripeBlock: Block = {
    slug: "stripe",
    fields: [
        {
            name: "providerName",
            type: "text",
            defaultValue: "Stripe",
            required: true,
        },
        {
            name: "testMode",
            type: "checkbox",
            admin: {
                position: "sidebar",
            },
        },
        {
            type: "row",
            fields: [
                EncryptedField({
                    name: "stripeSecretKey",
                    type: "text",
                    required: true,
                }),
                EncryptedField({
                    name: "stripeWebhooksEndpointSecret",
                    type: "text",
                    required: true,
                }),
            ],
        },
        EncryptedField({
            name: "publishableKey",
            type: "text",
            required: true,
        }),
    ],
    imageURL: "https://cdn.shopnex.ai/shopnex-images/media/stripe.png",
    labels: {
        plural: "Stripe Providers",
        singular: "Stripe Provider",
    },
};
