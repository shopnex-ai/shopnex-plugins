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

import path, { dirname, join } from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { cjSdk } from "../sdk/cj-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const streamPipeline = promisify(pipeline);

interface Product {
    description: TypedEditorState<DefaultNodeTypes>;
    pid: string;
    title: string;
    source: "manual" | "cj";
    variants?: Array<{
        imageUrl?: string;
        options?: Array<{ option: string; value: string }>;
        price?: number;
        vid: string;
    }>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mapMockProductToSchema(
    product: ProductDetails,
    editorConfig: any,
    payload: BasePayload
) {
    debugger;
    for (const variant of product.variants || []) {
        const imageData = await payload.create({
            collection: "media",
            data: {
                alt: variant.variantNameEn || "Variant Image",
                url: variant.variantImage,
            },
        });
        debugger;
    }
    return {
        description: convertHTMLToLexical({
            editorConfig,
            html: product.description || "",
            JSDOM,
            // uploadImage: async (src: string) => {
            //     return uploadImageToPayload(src, payload);
            // },
        }),
        source: "cj",
        pid: product.pid,
        title: product.productNameEn,
        variants: product.variants?.map((variant) => ({
            imageUrl: variant.variantImage, // Map image URL to 'id' if using media collection
            gallery: [],
            options: variant.variantKey?.split("-").map((key, index) => ({
                option: index === 0 ? "Color" : "Size", // Assuming 'Color' and 'Size', adjust keys if needed
                value: key,
            })),
            price: new decimal(variant.variantSellPrice || 0)
                .mul(rate)
                .toNumber()
                .toFixed(2),
            vid: variant.vid,
        })),
    };
}

const findProductById = async (productId: string) => {
    const accessToken = "134";
    const sdk = cjSdk({ accessToken });
    const result = await sdk.products.getProductDetails({
        pid: productId,
    });

    return result.data;
};

const createOrUpdateProduct = async (
    product: Omit<Product, "createdAt" | "id" | "updatedAt">,
    payload: BasePayload,
    shopId?: string
) => {
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

export const fetchExchangeRates = async () => {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();

    return data;
};

export const syncProducts = async (
    productIds: string[],
    payload: BasePayload,
    shopId?: string
) => {
    const editorConfig = await editorConfigFactory.default({
        config: payload.config,
    });
    const products: ProductDetails[] = [];
    for (const productId of productIds) {
        const product = await findProductById(productId);
        if (!product) {
            continue;
        }
        products.push(product);
        await delay(1010);
    }
    const mappedProducts = products.map((product) => {
        return mapMockProductToSchema(product, editorConfig, payload);
    });

    await Promise.all(
        mappedProducts.map((product) =>
            createOrUpdateProduct(product as any, payload, shopId)
        )
    );

    return products;
};
