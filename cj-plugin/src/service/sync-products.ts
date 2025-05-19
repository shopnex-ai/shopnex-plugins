import type {
    DefaultNodeTypes,
    TypedEditorState,
} from "@payloadcms/richtext-lexical";
import type { BasePayload } from "payload";

import {
    convertHTMLToLexical,
    editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import decimal from "decimal.js";
import { JSDOM } from "jsdom";

import type { ProductDetails } from "../sdk/products/product-types";

import { cjSdk } from "../sdk/cj-sdk";
import { CjData } from "../cj-settings";
import { retrieveAccessToken } from "./access-token";

interface Product {
    description: TypedEditorState<DefaultNodeTypes>;
    pid: string;
    title: string;
    source: "manual" | "cj";
    variants?: Array<{
        gallery?: (string | number)[];
        imageUrl?: string;
        options?: Array<{ option: string; value: string }>;
        price?: number;
        vid: string;
    }>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mapMockProductToSchema({
    product,
    payload,
    shopId,
}: {
    product: ProductDetails;
    payload: BasePayload;
    shopId?: string;
}) {
    const variants: Product["variants"] = [];

    for (const variant of product.variants || []) {
        // let imageData;
        // const filename = variant.variantImage?.split("/").pop();
        // const alt = filename?.split(".")[0];
        // try {
        //     imageData = await payload.create({
        //         collection: "media",
        //         data: {
        //             alt,
        //             filename,
        //             thumbnailURL: variant.variantImage,
        //             url: variant.variantImage,
        //             width: 1024,
        //             shop: shopId,
        //         },
        //     });
        // } catch (error) {
        //     console.error("Error creating media:", error);
        // }

        // const imageId = imageData?.id;

        variants.push({
            imageUrl: variant.variantImage,
            options: variant.variantKey?.split("-").map((key, index) => ({
                option: index === 0 ? "Color" : "Size",
                value: key,
            })),
            price: Number(
                new decimal(variant.variantSellPrice || 0).toNumber().toFixed(2)
            ),
            vid: variant.vid,
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
        }),
        source: "cj" as any,
        pid: product.pid,
        title: product.productNameEn,
        variants,
    };
}

const findProductById = async (productId: string, accessToken: string) => {
    const sdk = cjSdk({ accessToken });
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
    shopId?: string;
}) => {
    const { totalDocs } = await payload.count({
        collection: "products" as any,
        where: {
            pid: {
                equals: product.pid,
            },
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
    shopId?: string;
    data: Partial<CjData>;
}) => {
    const accessToken = await retrieveAccessToken(data);

    const fetchedProducts: ProductDetails[] = [];

    for (const productId of productIds) {
        const product = await findProductById(productId, accessToken);
        if (product) {
            fetchedProducts.push(product);
        }
        await delay(1010); // throttle CJ API requests
    }

    // Wait for all async mapping to resolve
    const mappedProducts: Product[] = await Promise.all(
        fetchedProducts.map((product) =>
            mapMockProductToSchema({ product, payload, shopId })
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
