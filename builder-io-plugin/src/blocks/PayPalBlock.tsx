import { Block } from "payload";

export const BuilderIoBlock: Block = {
    slug: "paypal",
    fields: [
        {
            type: "row",
            fields: [
                {
                    name: "builderIoPublicKey",
                    type: "text",
                    required: true,
                },
                {
                    name: "paypalClientSecret",
                    type: "text",
                    required: true,
                },
            ],
        },
        {
            name: "paypalAuthWebhookId",
            type: "text",
            label: "PayPal Auth Webhook ID",
            required: true,
            admin: {
                description:
                    "The Webhook ID configured in your PayPal Developer Dashboard for signature verification.",
            },
        },
    ],
    imageURL: "https://cdn.shopnex.ai/shopnex-images/media/image.png", // Optional: Provide a valid image URL
};
