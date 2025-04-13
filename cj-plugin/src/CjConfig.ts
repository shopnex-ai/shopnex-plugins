import { CollectionConfig } from "payload";
import { decryptToken, encryptToken } from "./util/manage-tokens";
import { syncProducts } from "./service/sync-products";

export type CjCollectionProps = {
    overrides?: {
        access: CollectionConfig["access"];
    };
};

export const CjConfigCollection = ({ overrides }: CjCollectionProps): CollectionConfig => ({
    slug: "cj-settings",
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
                            name: "emailAddress",
                            type: "text",
                        },
                        {
                            name: "apiToken",
                            type: "text",
                            admin: {
                                components: {
                                    Field: "@shopnex/cj-plugin/rsc#ApiToken",
                                },
                            },
                        },
                    ],
                },
            ],
        },
        {
            label: "Logo Area POD",
            name: "pod",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "items",
            type: "array",
            admin: {
                description: "A list of product URLs to sync with CJ Dropshipping",
            },
            fields: [
                {
                    name: "productUrl",
                    type: "text",
                },
            ],
            label: "Products",
            labels: {
                plural: "Product URLs",
                singular: "Product URL",
            },
        },
    ],
    hooks: {
        beforeChange: [
            ({ data }) => {
                const tokenToEncrypt = data.apiToken;
                const encryptedToken = encryptToken(tokenToEncrypt);
                data.apiToken = encryptedToken;
            },
        ],
        beforeRead: [
            ({ doc }) => {
                doc.apiToken = doc?.apiToken && decryptToken(doc.apiToken);
            },
        ],
        afterChange: [
            async ({ doc, req: { payload } }) => {
                const productIds = doc.items.map((item: any) => {
                    const match = item.productUrl.match(/(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/);
                    return match ? match[0] : null;
                });
                await syncProducts(productIds, payload);
            },
            ({ doc }) => {
                doc.apiToken = doc.apiToken && decryptToken(doc.apiToken);
            },
        ],
    },
    labels: {
        singular: "CJ Dropshipping",
        plural: "CJ Configs",
    },
});
