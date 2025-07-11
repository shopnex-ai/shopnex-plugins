import { Order } from "@shopnex/types";
import { CollectionBeforeChangeHook } from "payload";
import { mapToStripeLineItems } from "../utilities/map-to-stripe";
import { createCheckoutSession } from "../utilities/create-checkout-session";

export const stripeSessionCheckout: CollectionBeforeChangeHook<Order> = async ({
    data,
    operation,
    req,
}) => {
    if (
        operation !== "create" ||
        data.orderStatus !== "pending" ||
        data.paymentGateway !== "stripe"
    ) {
        return data;
    }
    const serverUrl = req.payload.config.serverURL;
    const cancelUrl = `${serverUrl}/cart?canceled=true`;
    const successUrl = `${serverUrl}/order/confirmed/{CHECKOUT_SESSION_ID}`;
    const cart = await req.payload.find({
        collection: "carts",
        where: {
            id: {
                equals: data.cart,
            },
        },
        req,
    });
    if (!cart.docs?.[0].cartItems?.length) {
        return data;
    }
    const lineItems = mapToStripeLineItems(cart.docs[0].cartItems);

    const session = await createCheckoutSession({
        lineItems,
        orderId: data.orderId!,
        cancelUrl,
        successUrl,
    });
    data.sessionId = session.id;
    data.sessionUrl = session.url;
    return data;
};
