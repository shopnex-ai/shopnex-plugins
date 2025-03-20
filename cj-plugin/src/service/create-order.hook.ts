import type { CollectionAfterChangeHook, Document, Payload } from 'payload'

import * as cjSdk from '../sdk/cj-sdk'

export interface Orders extends Document {
  // Define your order fields here
  id: string
  items: Array<{
    productUrl: string
    quantity: number
    variant: {
      variantId: string
    }
  }>
}

export const createOrderHook: CollectionAfterChangeHook<Orders> = async ({ doc, req }) => {
  const payload: Payload = req.payload
  if (doc.orderStatus !== 'processing') {
    return
  }
  const result = await cjSdk.createOrder({
    consigneeID: doc.billingAddress?.name || '',
    email: doc.billingAddress?.email || '',
    fromCountryCode: 'CN',
    houseNumber: doc.shippingAddress?.address?.line2 || '',
    iossType: 1,
    logisticName: 'CJPacket Liquid US',
    orderNumber: doc.orderId,
    payType: 1,
    products: doc.items.map((item) => ({
      quantity: item.quantity,
      vid: item.variant.variantId,
    })),
    remark: '',
    shippingAddress: doc.shippingAddress?.address?.line1 || '',
    shippingAddress2: doc.shippingAddress?.address?.line2 || '',
    shippingCity: doc.shippingAddress?.address?.city || '',
    shippingCountry: doc.shippingAddress?.address?.country || '',
    shippingCountryCode: doc.shippingAddress?.address?.country || '',
    shippingCounty: doc.shippingAddress?.address?.city || '',
    shippingCustomerName: doc.shippingAddress?.name || '',
    shippingPhone: doc.shippingAddress?.phone || '+9999999999',
    shippingProvince: doc.shippingAddress?.address?.state || '',
    shippingZip: doc.shippingAddress?.address?.postal_code || '',
    taxId: '',
  })

  const orderResult = await payload.update({
    collection: 'orders',
    data: {
      orderStatus: 'completed',
    },
    where: {
      id: {
        equals: doc.orderId,
      },
    },
  })

  return {
    cjResult: result,
    orderResult,
  }
}
