import type { CollectionConfig, Field, GlobalConfig } from "payload";
import { syncProducts } from "./service/sync-products";

// Collection Config
export type CjCollectionProps = {
    overrides?: Partial<CollectionConfig>;
};

export type CjGlobalProps = {
    overrides?: Partial<GlobalConfig>;
};

// Shared fields definition
const sharedFields: Field[] = [
    // {
    //     label: "Credentials",
    //     type: "collapsible",
    //     fields: [
    //         {
    //             type: "row",
    //             fields: [
    //                 {
    //                     name: "emailAddress",
    //                     type: "text",
    //                 },
    //                 {
    //                     name: "apiToken",
    //                     type: "text",
    //                     admin: {
    //                         components: {
    //                             Field: "@shopnex/cj-plugin/rsc#ApiToken",
    //                         },
    //                     },
    //                 },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: "Logo Area POD",
    //     name: "pod",
    //     type: "upload",
    //     relationTo: "media",
    // },
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
];

// Shared hooks definition
const sharedHooks = {
    afterChange: [
        async ({ doc, req }) => {
            console.log("afterChange", doc);
            const productIds = doc.items.map((item: any) => {
                const match = item.productUrl.match(/(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/);
                return match ? match[0] : null;
            });
            const shopId = req.user?.shops?.[0]?.shop?.id;
            await syncProducts(productIds, req.payload, shopId);
        },
    ],
};

// Global Config
export const CjSettings = ({ overrides }: CjGlobalProps): GlobalConfig => ({
    slug: "cj-settings",
    access: {
        ...overrides?.access,
    },
    admin: {
        group: "Plugins",
        ...overrides?.admin,
    },
    fields: sharedFields,
    hooks: sharedHooks,
    label: "CJ Dropshipping",
    ...(overrides || {}),
});

export const CjConfigCollection = ({ overrides }: CjCollectionProps): CollectionConfig => ({
    slug: "cj-settings",
    access: {
        ...overrides?.access,
    },
    admin: {
        group: "Plugins",
        ...overrides?.admin,
    },
    fields: sharedFields,
    hooks: sharedHooks,
    labels: {
        singular: "CJ Dropshipping",
        plural: "CJ Configs",
    },
    ...(overrides || {}),
});
