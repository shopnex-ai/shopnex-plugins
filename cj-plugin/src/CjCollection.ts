import {
    deepMergeWithCombinedArrays,
    type CollectionBeforeChangeHook,
    type CollectionConfig,
} from "payload";
import { syncProducts } from "./service/sync-products";
import { EncryptedField } from "@shopnex/utils";
import { getTenantFromCookie } from "@shopnex/utils/helpers";
import { getProductId } from "./util/get-product-id";

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

export const CjCollection = ({
    overrides = {},
}: CjCollectionProps): CollectionConfig => {
    const baseConfig: CollectionConfig = {
        slug: "cj-settings",
        access: {}, // will be deep-merged
        admin: {
            group: "Plugins",
            useAsTitle: "emailAddress",
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
                                type: "email",
                            },
                            EncryptedField({
                                name: "apiToken",
                                type: "text",
                            }),
                        ],
                    },
                    {
                        type: "row",
                        fields: [
                            EncryptedField({
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
                            EncryptedField({
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
                    const productIds = data.items
                        ?.map((item: any) => {
                            const productId = getProductId(item.productUrl);
                            return productId;
                        })
                        .filter((productId) => typeof productId === "string");

                    if (!productIds) return;

                    const shopId = getTenantFromCookie(req.headers, "number");

                    if (productIds.length > 0) {
                        await syncProducts({
                            productIds,
                            payload: req.payload,
                            shopId: shopId as number,
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
    };

    return deepMergeWithCombinedArrays(baseConfig, overrides);
};
