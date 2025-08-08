import { WooProduct, WooVariation } from "../types";
import { Product } from "@shopnex/types";

function mapDescription(description: string): { root: any } {
    return {
        root: {
            type: "doc",
            children: [
                {
                    type: "paragraph",
                    version: 1,
                    text: description,
                },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
        },
    };
}

export function mapWooProduct(
    product: WooProduct,
    variations: WooVariation
): Omit<Product, "id"> {
    const hasVariations = variations.length > 0;

    return {
        pid: `${product.id}`,
        title: product.name,
        description: product.description
            ? mapDescription(product.description)
            : null,
        variants: hasVariations
            ? variations.map((variation) => ({
                  vid: `${variation.id}`,
                  sku: variation.sku,
                  price: parseFloat(variation.price || "0"),
                  originalPrice: parseFloat(variation.regular_price || "0"),
                  stockCount: variation.stock_quantity,
                  options: variation.attributes.map((attr) => ({
                      option: attr.name,
                      value: attr.option,
                  })),
              }))
            : [
                  {
                      vid: String(product.id),
                      sku: product.sku || null,
                      price: parseFloat(product.price || "0"),
                      originalPrice: parseFloat(product.regular_price || "0"),
                      stockCount: product.stock_quantity || 0,
                      options: [],
                  },
              ],
        updatedAt: product.date_modified,
        createdAt: product.date_created,
        handle: product.slug,
        source: "wc",
        salesChannels:
            product.catalog_visibility === "visible" ? ["all"] : null,
    };
}
