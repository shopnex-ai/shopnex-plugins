import { EncryptedField } from "@shopnex/utils";
import { Block } from "payload";

export const StripeBlock: Block = {
    slug: "stripe",
    admin: {
        disableBlockName: true,
    },
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
        },
        {
            name: "methodType",
            type: "select",
            admin: {
                readOnly: true,
            },
            options: [
                {
                    label: "Credit Card",
                    value: "card",
                },
                {
                    label: "Bank Transfer (ACH)",
                    value: "ach",
                },
                {
                    label: "Let Customer Choose (All Available)",
                    value: "auto",
                },
            ],
            defaultValue: "auto",
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
