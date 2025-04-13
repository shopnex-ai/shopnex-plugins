import { CollectionConfig } from "payload";
import { decryptToken, encryptToken } from "./util/manage-tokens";

export type StripConfigProps = {
    overrides?: {
        access: CollectionConfig["access"];
    };
};

export const StripeConfig = ({ overrides }: StripConfigProps): CollectionConfig => ({
    slug: "stripe-settings",
    access: {
        ...overrides?.access,
    },
    admin: {
        group: "Plugins",
    },
    fields: [
        {
            label: "Credentials",
            type: "collapsible",
            fields: [
                {
                    type: "row",
                    fields: [
                        {
                            label: "Stripe Secret Key",
                            name: "secretKey",
                            type: "text",
                            admin: {
                                components: {
                                    Field: "@shopnex/stripe-plugin/client#ApiToken",
                                },
                            },
                        },
                        {
                            label: "Stripe Webhooks Endpoint Secret",
                            name: "webhooksEndpointSecret",
                            type: "text",
                            admin: {
                                components: {
                                    Field: "@shopnex/stripe-plugin/client#ApiToken",
                                },
                            },
                        },
                    ],
                },
                {
                    label: "Stripe Publishable Key",
                    name: "publishableKey",
                    type: "text",
                    admin: {
                        components: {
                            Field: "@shopnex/stripe-plugin/client#ApiToken",
                        },
                    },
                },
            ],
        },
    ],
    hooks: {
        beforeChange: [
            ({ data }) => {
                const tokens = {
                    secretKey: data.secretKey,
                    webhooksEndpointSecret: data.webhooksEndpointSecret,
                    publishableKey: data.publishableKey,
                };
                for (const [field, value] of Object.entries(tokens)) {
                    const tokenToEncrypt = value;
                    const encryptedToken = encryptToken(tokenToEncrypt);
                    data[field] = encryptedToken;
                }
            },
        ],
        beforeRead: [
            ({ doc }) => {
                const tokens = {
                    secretKey: doc.secretKey,
                    webhooksEndpointSecret: doc.webhooksEndpointSecret,
                    publishableKey: doc.publishableKey,
                };
                for (const [field, value] of Object.entries(tokens)) {
                    doc[field] = doc?.[field] && decryptToken(doc[field]);
                }
            },
        ],

        afterChange: [
            ({ doc }) => {
                const tokens = {
                    secretKey: doc.secretKey,
                    webhooksEndpointSecret: doc.webhooksEndpointSecret,
                    publishableKey: doc.publishableKey,
                };
                for (const [field, value] of Object.entries(tokens)) {
                    doc[field] = doc[field] && decryptToken(doc[field]);
                }
            },
        ],
    },
});
