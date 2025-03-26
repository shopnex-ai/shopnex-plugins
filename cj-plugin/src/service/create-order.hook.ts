import type { BasePayload, CollectionAfterChangeHook, Document } from "payload";

import * as cjSdk from "../sdk/cj-sdk";

export interface Orders extends Document {
    id: string;
    items: Array<{
        productUrl: string;
        quantity: number;
        variant: {
            variantId: string;
        };
    }>;
}

export const createOrderHook: CollectionAfterChangeHook<Orders> = async ({ doc, req }) => {
    if (doc.orderStatus !== "processing") {
        return;
    }
    const payload: BasePayload = req.payload;
    const cjSettings = await payload.findGlobal({
        slug: "cj-settings",
    });
    const podProperties = cjSettings?.pod?.url
        ? [
              {
                  areaName: "LogoArea",
                  links: [cjSettings?.pod?.url],
                  type: "1",
                  layer: [],
              },
          ]
        : [];
    const result = await cjSdk.createOrder({
        consigneeID: doc.billingAddress?.name || "",
        email: doc.billingAddress?.email || "",
        fromCountryCode: "CN",
        houseNumber: doc.shippingAddress?.address?.line2 || "",
        iossType: 1,
        logisticName: "CJPacket Liquid US",
        orderNumber: doc.orderId,
        payType: 2,
        products: doc.items.map((item) => ({
            quantity: item.quantity,
            vid: item.variant.variantId,
        })),
        podProperties,
        remark: "",
        shippingAddress: doc.shippingAddress?.address?.line1 || "",
        shippingAddress2: doc.shippingAddress?.address?.line2 || "",
        shippingCity: doc.shippingAddress?.address?.city || "",
        shippingCountry: doc.shippingAddress?.address?.country || "",
        shippingCountryCode: doc.shippingAddress?.address?.country || "",
        shippingCounty: doc.shippingAddress?.address?.city || "",
        shippingCustomerName: doc.shippingAddress?.name || "",
        shippingPhone: doc.shippingAddress?.phone || "+9999999999",
        shippingProvince: doc.shippingAddress?.address?.state || "",
        shippingZip: doc.shippingAddress?.address?.postal_code || "",
        taxId: "",
    });

    const orderResult = await payload.update({
        collection: "orders",
        data: {
            orderStatus: "shipped",
        },
        where: {
            id: {
                equals: doc.orderId,
            },
        },
    });

    return {
        cjResult: result,
        orderResult,
    };
};
