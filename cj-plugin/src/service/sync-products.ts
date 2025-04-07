import type { DefaultNodeTypes, TypedEditorState } from "@payloadcms/richtext-lexical";
import type { BasePayload } from "payload";

import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import decimal from "decimal.js";
import { JSDOM } from "jsdom";

import type { ProductDetails } from "../sdk/products/product-types";

import * as cjSdk from "../sdk/cj-sdk";
import { customConvertHTMLToLexical } from "./convert-html-to-lexical";
import path, { dirname, join } from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const streamPipeline = promisify(pipeline);

interface Product {
    description: TypedEditorState<DefaultNodeTypes>;
    pid: string;
    title: string;
    variants?: Array<{
        imageUrl?: string;
        options?: Array<{ option: string; value: string }>;
        price?: number;
        vid: string;
    }>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const download = async (uri: string, filename: string): Promise<void> => {
    try {
        const response = await fetch(uri);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${uri}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");

        console.log("content-type:", contentType);
        console.log("content-length:", contentLength);

        const buffer = Buffer.from(await response.arrayBuffer());

        await writeFile(filename, buffer);

        console.log("Download complete:", filename);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
};


async function uploadImageToPayload(src: string, payload: BasePayload): Promise<any | null> {
    const tempFilePath = path.join(__dirname, "temp-image.jpg");

    try {
        // Fetch the image
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        // Stream the response body to a temporary file
        await download(src, tempFilePath);

        // Upload the image using Payload's Local API
        const uploadedImage = await payload.create({
            collection: "media",
            data: {
                alt: "Some alt text",
            },

            filePath: tempFilePath,
        });

        console.log("Uploaded media document:", uploadedImage);

        // Clean up: delete the temporary file
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
        });

        return {
            id: uploadedImage.id,
            alt: uploadedImage.alt || "",
            prefix: "media",
            updatedAt: uploadedImage.updatedAt,
            createdAt: uploadedImage.createdAt,
            url: uploadedImage.url,
            thumbnailURL: uploadedImage.thumbnailURL || null,
            filename: uploadedImage.filename,
            mimeType: uploadedImage.mimeType,
            filesize: uploadedImage.filesize,
            width: uploadedImage.width,
            height: uploadedImage.height,
            focalX: 50,
            focalY: 50,
        };
    } catch (error) {
        console.error("Error uploading image:", error);
    }
}
function mapMockProductToSchema(
    product: ProductDetails,
    editorConfig: any,
    rate: number,
    payload: BasePayload,
) {
    return {
        description: customConvertHTMLToLexical({
            editorConfig,
            html: product.description || "",
            JSDOM,
            uploadImage: async (src: string) => {
                return uploadImageToPayload(src, payload);
            },
        }),
        pid: product.pid,
        title: product.productNameEn,
        variants: product.variants?.map((variant) => ({
            imageUrl: variant.variantImage, // Map image URL to 'id' if using media collection
            options: variant.variantKey?.split("-").map((key, index) => ({
                option: index === 0 ? "Color" : "Size", // Assuming 'Color' and 'Size', adjust keys if needed
                value: key,
            })),
            price: new decimal(variant.variantSellPrice || 0).mul(rate).toNumber().toFixed(2),
            vid: variant.vid,
        })),
    };
}

const findProductById = async (productId: string) => {
    const result = await cjSdk.getProductDetails({
        pid: productId,
    });
    return result.data;
};

const createOrUpdateProduct = async (
    product: Omit<Product, "createdAt" | "id" | "updatedAt">,
    payload: BasePayload,
) => {
    const { totalDocs } = await payload.count({
        collection: "products",
        where: {
            pid: {
                equals: product.pid,
            },
        },
    });

    if (totalDocs === 0) {
        return payload.create({
            collection: "products",
            data: { ...product } as any,
        });
    }
};

export const fetchExchangeRates = async () => {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();

    return data;
};

export const syncProducts = async (productIds: string[], payload: BasePayload) => {
    const exchangeRates = await fetchExchangeRates();
    const storeSettings = await payload.findGlobal({
        slug: "store-settings",
    });
    const rate = exchangeRates.rates[storeSettings.currency || "USD"];

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
        return mapMockProductToSchema(product, editorConfig, rate, payload);
    });

    await Promise.all(
        mappedProducts.map((product) => createOrUpdateProduct(product as any, payload)),
    );

    return products;
};
