import { Block } from "payload";

export const StripeBlock: Block = {
    slug: "stripe",
    fields: [
        {
            type: "row",
            fields: [
                {
                    name: "stripeSecretKey",
                    type: "text",
                    label: "Stripe Secret Key",
                    required: true,
                    admin: {
                        components: {
                            Field: "@shopnex/stripe-plugin/client#ApiToken",
                        },
                    },
                },
                {
                    name: "stripeWebhooksEndpointSecret",
                    type: "text",
                    label: "Stripe Webhooks Endpoint Secret",
                    required: true,
                    admin: {
                        components: {
                            Field: "@shopnex/stripe-plugin/client#ApiToken",
                        },
                    },
                },
            ],
        },
        {
            name: "publishableKey",
            type: "text",
            label: "Publishable Key",
            required: true,
            admin: {
                components: {
                    Field: "@shopnex/stripe-plugin/client#ApiToken",
                },
            },
        },
    ],
    imageURL: "https://cdn.shopnex.ai/shopnex-images/media/stripe.png",
    labels: {
        plural: "Stripe Providers",
        singular: "Stripe Provider",
    },
};
