import type { Cart, Payment, Shipping, Shop } from "@shopnex/types";
import { createCheckoutSession } from "../utilities/create-checkout-session";
import { mapToStripeLineItems } from "../utilities/map-to-stripe";

import { PayloadRequest } from "payload";

type StripeCheckoutProps = {
    req: PayloadRequest;
    cart: Cart;
    payment: Payment;
    shipping: Shipping;
    shop: Shop;
    total: number;
    orderId: string;
};

export async function stripeCheckout({
    req,
    cart,
    payment,
    shipping,
    shop,
    total,
    orderId,
}: StripeCheckoutProps) {
    const shopUrl = req.payload.config?.custom?.shopUrl;
    const order = await req.payload.create({
        collection: "orders",
        data: {
            cart: cart.id,
            currency: "usd",
            orderId,
            orderStatus: "pending",
            paymentMethod: "stripe",
            payment: payment?.id,
            shipping: shipping?.id,
            paymentStatus: "pending",
            totalAmount: total,
            shop: typeof shop === "object" ? shop?.id : shop,
        },
        req,
    });

    const cancelUrl = `${shopUrl}/cart?canceled=true`;
    const successUrl = `${shopUrl}/order/confirmed/{CHECKOUT_SESSION_ID}`;
    if (!cart.cartItems?.length) {
        return {
            redirectUrl: null,
        };
    }
    const lineItems = mapToStripeLineItems(cart.cartItems);

    const session = await createCheckoutSession({
        lineItems,
        orderId,
        cancelUrl,
        successUrl,
    });

    // Update order with session info
    await req.payload.update({
        collection: "orders",
        id: order.id,
        data: {
            sessionId: session.id,
            sessionUrl: session.url,
        },
        req,
    });

    return {
        redirectUrl: session.url,
    };
}
