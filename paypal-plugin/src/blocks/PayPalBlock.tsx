import { Block } from "payload";

export const PayPalBlock: Block = {
    slug: "paypal",
    fields: [
        {
            name: "paypalSandboxMode",
            type: "checkbox",
            label: "PayPal Sandbox Mode",
            defaultValue: true, // Default to sandbox for safety
        },
        {
            type: "row",
            fields: [
                {
                    name: "paypalClientId",
                    type: "text",
                    label: "PayPal Client ID",
                    required: true,
                    admin: {
                        width: "50%",
                    },
                },
                {
                    name: "paypalClientSecret",
                    type: "text",
                    label: "PayPal Client Secret",
                    required: true,
                    admin: {
                        width: "50%",
                    },
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
    labels: {
        plural: "PayPal Providers",
        singular: "PayPal Provider",
    },
};

// Helper type for block data
export interface PayPalBlockData {
    blockType: "paypal";
    paypalSandboxMode?: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    paypalAuthWebhookId: string;
}
