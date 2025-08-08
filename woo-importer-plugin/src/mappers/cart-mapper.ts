import { Cart, Product } from "@shopnex/types";
import { WooOrder } from "../types";

function findProductId(products: Product[], wooProductId: number): number {
    return products.find((p) => p.pid === wooProductId.toString())?.id || 0;
}

function findVariantId(products: Product[], wooVariantId: number): string {
    return (
        products
            .flatMap((p) => p.variants)
            .find((v) => v.vid === wooVariantId.toString())?.id || "0"
    );
}

export function mapWooCart(
    order: WooOrder,
    products: Product[]
): Omit<Cart, "id"> {
    return {
        cartItems: order.line_items.map((item) => ({
            variantId: findVariantId(products, item.variation_id),
            product: findProductId(products, item.product_id),
            quantity: item.quantity,
        })),
        completed: Boolean(order.date_completed),
        updatedAt: order.date_modified,
        createdAt: order.date_created,
    };
}
