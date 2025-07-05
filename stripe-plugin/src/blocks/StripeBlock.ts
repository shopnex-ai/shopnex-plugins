import { EncryptedField } from "@shopnex/utils";
import { Block, FieldAccess } from "payload";

export type SecretAccess = {
    create?: FieldAccess;
    read?: FieldAccess;
    update?: FieldAccess;
};

export const StripeBlock = ({
    secretAccess,
}: {
    secretAccess?: SecretAccess;
}): Block => ({
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
                    access: secretAccess,
                }),
                EncryptedField({
                    name: "stripeWebhooksEndpointSecret",
                    type: "text",
                    required: true,
                    access: secretAccess,
                }),
            ],
        },
        EncryptedField({
            name: "publishableKey",
            type: "text",
            required: true,
            access: secretAccess,
        }),
    ],
    imageURL: "https://cdn.shopnex.ai/shopnex-images/media/stripe.png",
    labels: {
        plural: "Stripe Providers",
        singular: "Stripe Provider",
    },
});
