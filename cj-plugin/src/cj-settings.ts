import type {
    CollectionBeforeChangeHook,
    CollectionConfig,
    Field,
    GlobalConfig,
} from "payload";
import { syncProducts } from "./service/sync-products";
import { encryptedField } from "@shopnex/utils";

// Collection Config
export type CjCollectionProps = {
    overrides?: Partial<CollectionConfig>;
};

export type CjData = {
    id: string;
    emailAddress?: string;
    apiToken?: string;
    refreshToken?: string;
    refreshTokenExpiry?: string | Date;
    accessToken?: string;
    accessTokenExpiry?: string | Date;
    pod?: {
        id: string;
        relationTo: "media";
    };
    items: {
        productUrl: string;
    }[];
};

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
                        encryptedField({
                            name: "apiToken",
                            type: "text",
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
                description:
                    "A list of product URLs to sync with CJ Dropshipping",
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
            async ({ data, req }) => {
                const productIds = data.items?.map((item: any) => {
                    const match = item.productUrl.match(
                        /(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/
                    );
                    return match ? match[0] : null;
                });
                if (!productIds) {
                    return;
                }
                const shopId = (req.user?.shops as any)?.[0]?.shop?.id;
                if (productIds.length > 0) {
                    await syncProducts({
                        productIds,
                        payload: req.payload,
                        shopId,
                        data,
                    });
                }
            },
        ] as CollectionBeforeChangeHook<CjData>[],
    },
    labels: {
        singular: "CJ Dropshipping",
        plural: "CJ Dropshipping",
    },
    ...(overrides || {}),
});
