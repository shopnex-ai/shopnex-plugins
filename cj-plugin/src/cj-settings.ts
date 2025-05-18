import type { CollectionConfig, Field, GlobalConfig } from "payload";
import { syncProducts } from "./service/sync-products";
import { encryptedField } from "@shopnex/utils";
import { BeforeChangeHook } from "node_modules/payload/dist/globals/config/types";

// Collection Config
export type CjCollectionProps = {
    overrides?: Partial<CollectionConfig>;
};

export type CjGlobalProps = {
    overrides?: Partial<GlobalConfig>;
};

// Shared fields definition
const sharedFields: Field[] = [
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
                        required: true,
                    },
                    encryptedField({
                        name: "apiToken",
                        type: "text",
                        required: true,
                    }),
                ],
            },
            {
                type: "row",
                fields: [
                    encryptedField({
                        name: "refreshToken",
                        type: "text",
                    }),
                    {
                        name: "refreshTokenExpiry",
                        type: "date",
                    },
                ],
            },
            {
                type: "row",
                fields: [
                    encryptedField({
                        name: "accessToken",
                        type: "text",
                    }),
                    {
                        name: "accessTokenExpiry",
                        type: "date",
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
];

// Shared hooks definition
const sharedHooks = {
    beforeChange: [
        async ({ data, req }) => {
            const productIds = data.items.map((item: any) => {
                const match = item.productUrl.match(
                    /(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/
                );
                return match ? match[0] : null;
            });
            const shopId = (req.user?.shops as any)?.[0]?.shop?.id;
            if (productIds.length > 0) {
                await syncProducts(productIds, req.payload, shopId);
            }
        },
    ] as BeforeChangeHook[],
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

export const CjConfigCollection = ({
    overrides,
}: CjCollectionProps): CollectionConfig => ({
    slug: "cj-settings",
    access: {
        ...overrides?.access,
    },
    admin: {
        group: "Plugins",
        useAsTitle: "emailAddress",
        ...overrides?.admin,
    },
    fields: sharedFields,
    hooks: sharedHooks as any,
    labels: {
        singular: "CJ Dropshipping",
        plural: "CJ Configs",
    },
    ...(overrides || {}),
});
