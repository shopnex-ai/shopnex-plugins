import { Order } from "@shopnex/types";
import { WooOrder } from "../types";

export function mapWooOrder(order: WooOrder): Omit<Order, "id"> {
    return {
        orderId: order.order_key, // Mapping to use order_key as unique identifier
        totalAmount: parseFloat(order.total),
        source: "wc",
        currency: order.currency,
        paymentStatus: mapPaymentStatus(order.status),
        orderStatus: mapOrderStatus(order.status),
        createdAt: order.date_created,
        updatedAt: order.date_modified,

        billingAddress: {
            name: `${order.billing.first_name} ${order.billing.last_name}`,
            address: {
                line1: order.billing.address_1,
                line2: order.billing.address_2,
                city: order.billing.city,
                state: order.billing.state,
                country: order.billing.country,
                postal_code: order.billing.postcode,
            },
            email: order.billing.email,
            phone: order.billing.phone,
        },

        shippingAddress: {
            name: `${order.shipping.first_name} ${order.shipping.last_name}`,
            address: {
                line1: order.shipping.address_1,
                line2: order.shipping.address_2,
                city: order.shipping.city,
                state: order.shipping.state,
                country: order.shipping.country,
                postal_code: order.shipping.postcode,
            },
            phone: order.shipping.phone,
        },

        paymentMethod: order.payment_method,
        metadata: order.meta_data.reduce(
            (acc, meta) => {
                acc[meta.key] = meta.value;
                return acc;
            },
            {} as Record<string, unknown>
        ),
    };
}

function mapPaymentStatus(
    status: string
): "pending" | "paid" | "failed" | "refunded" {
    switch (status) {
        case "completed":
            return "paid";
        case "pending":
            return "pending";
        case "failed":
            return "failed";
        case "refunded":
            return "refunded";
        default:
            return "pending"; // Default handling
    }
}

function mapOrderStatus(status: string): Order["orderStatus"] {
    switch (status) {
        case "completed":
            return "delivered";
        case "processing":
            return "processing";
        case "on-hold":
            return "on_hold";
        case "pending":
            return "pending";
        case "refunded":
            return "refunded"; // Assuming refunded might map to canceled
        case "cancelled":
            return "canceled";
        default:
            return "pending"; // Default handling
    }
}
