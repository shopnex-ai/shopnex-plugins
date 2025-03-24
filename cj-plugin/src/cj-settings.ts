import type { GlobalConfig } from "payload";

import { syncProducts } from "./service/sync-products";

export const CjSettings: GlobalConfig = {
    slug: "cj-settings",
    access: {
        read: () => true,
        update: ({ req }) => !!req.user?.roles?.includes("admin"),
    },
    admin: {
        group: "Plugins",
    },
    fields: [
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
        afterChange: [
            async ({ doc, req: { payload } }) => {
                const productIds = doc.items.map((item: any) => {
                    const match = item.productUrl.match(/(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/);
                    return match ? match[0] : null;
                });
                await syncProducts(productIds, payload);
            },
        ],
    },
    label: "CJ Dropshipping",
};
