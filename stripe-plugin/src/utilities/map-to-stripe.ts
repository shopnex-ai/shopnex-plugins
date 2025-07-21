import Stripe from "stripe";
import Decimal from "decimal.js";
import { Cart } from "@shopnex/types";

export const mapToStripeLineItems = (
    cartItems: NonNullable<Cart["cartItems"]>
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
    return cartItems.map((item) => {
        const variants =
            typeof item.product === "object" ? item.product.variants : [];
        const variant = variants.find(
            (variant) => variant.id === item.variantId
        );
        // const imageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${variant?.gallery?.[0]}`;
        return {
            price_data: {
                currency: "usd", // Adjust if needed
                product_data: {
                    name: `Product ${item.variantId}`, // Modify if you have actual product names
                    description: variant?.options
                        ?.map((opt) => `${opt.option}: ${opt.value}`)
                        .join(", "),
                    images: variant?.gallery?.length ? [] : [],
                },
                unit_amount: +new Decimal(variant?.price || 0)
                    .times(100)
                    .toFixed(0),
            },
            quantity: new Decimal(item.quantity).toNumber(),
        };
    });
};
