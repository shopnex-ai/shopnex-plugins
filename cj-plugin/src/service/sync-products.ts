import type { BasePayload, Where } from "payload";
import { Product } from "@shopnex/types";
import {
    convertHTMLToLexical,
    editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import decimal from "decimal.js";
import { JSDOM } from "jsdom";

import type { ProductDetails } from "../sdk/products/product-types";

import { CjSdk, cjSdk } from "../sdk/cj-sdk";
import { CjData } from "../CjCollection";
import { retrieveAccessToken } from "./access-token";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const upsertImage = async ({
    payload,
    imageUrl,
    filename,
    alt,
    shopId,
}: {
    payload: BasePayload;
    imageUrl: string;
    filename: string;
    alt: string;
    shopId?: number;
}) => {
    const whereClause: Where = {
        filename: {
            equals: filename,
        },
    };

    if (shopId !== undefined) {
        whereClause.shop = {
            equals: shopId,
        };
    }

    const imageData = await payload.find({
        collection: "media",
        where: whereClause,
        limit: 1,
    });
    if (imageData.totalDocs === 0) {
        return payload.create({
            collection: "media",
            data: {
                alt,
                filename,
                thumbnailURL: imageUrl,
                url: imageUrl,
                shop: shopId,
            },
        });
    }
    return imageData.docs[0];
};

async function mapMockProductToSchema({
    product,
    payload,
    shopId,
    sdk,
}: {
    product: ProductDetails;
    payload: BasePayload;
    shopId?: number;
    sdk: CjSdk;
}) {
    const variants: Product["variants"] = [];

    for (const variant of product.variants || []) {
        const filename = `${shopId}-${variant?.variantImage?.split("/").pop()}`;
        if (!filename || !variant.variantImage) {
            continue;
        }
        const alt = filename.split(".")[0];
        const imageUrl = variant.variantImage;
        const imageData = await upsertImage({
            payload,
            imageUrl,
            filename,
            alt,
            shopId,
        });

        const imageId = imageData.id;

        const data = await sdk.products.getProductStockByVid({
            vid: variant.vid,
        });
        if (!data.data) {
            throw new Error("Failed to fetch stock information");
        }
        const cjInventoryNum = data.data.reduce(
            (sum, item) => sum + (item?.cjInventoryNum || 0),
            0
        );

        variants.push({
            gallery: [imageId],
            options: variant.variantKey?.split("-").map((key, index) => ({
                option: index === 0 ? "Color" : "Size",
                value: key,
            })),
            price: Number(
                new decimal(variant.variantSellPrice || 0).toNumber().toFixed(2)
            ),
            vid: variant.vid,
            stockCount: cjInventoryNum,
        });
    }

    const cleanHtml = product.description?.replace(/<img[^>]*>/g, "");

    return {
        description: convertHTMLToLexical({
            editorConfig: await editorConfigFactory.default({
                config: payload.config, // Your Payload Config
            }),
            html: cleanHtml || "<p></p>",
            JSDOM, // Pass in the JSDOM import; it's not bundled to keep package size small
        }) as any,
        source: "cj" as any,
        pid: product.pid,
        title: product.productNameEn,
        variants,
    };
}

const findProductById = async (productId: string, sdk: any) => {
    const result = await sdk.products.getProductDetails({
        pid: productId,
    });

    return result.data;
};

const createOrUpdateProduct = async ({
    product,
    payload,
    shopId,
}: {
    product: Omit<Product, "createdAt" | "id" | "updatedAt">;
    payload: BasePayload;
    shopId?: number;
}) => {
    const { totalDocs } = await payload.count({
        collection: "products" as any,
        where: {
            pid: {
                equals: product.pid,
            },
            ...(shopId && {
                shop: {
                    equals: shopId,
                },
            }),
        },
    });

    if (totalDocs === 0) {
        return payload.create({
            collection: "products" as any,
            data: {
                ...product,
                shop: shopId,
            } as any,
        });
    }
};

export const syncProducts = async ({
    productIds,
    payload,
    shopId,
    data,
}: {
    productIds: string[];
    payload: BasePayload;
    shopId?: number;
    data: Partial<CjData>;
}) => {
    const accessToken = await retrieveAccessToken(data);
    const sdk = cjSdk({ accessToken });

    const fetchedProducts: ProductDetails[] = [];

    for (const productId of productIds) {
        const product = await findProductById(productId, sdk);
        if (product) {
            fetchedProducts.push(product);
        }
        await delay(1010); // throttle CJ API requests
    }

    // Wait for all async mapping to resolve
    const mappedProducts = await Promise.all(
        fetchedProducts.map((product) =>
            mapMockProductToSchema({ product, payload, shopId, sdk })
        )
    );

    // Create or update each mapped product
    await Promise.all(
        mappedProducts.map((product) =>
            createOrUpdateProduct({ product, payload, shopId })
        )
    );

    return fetchedProducts;
};
