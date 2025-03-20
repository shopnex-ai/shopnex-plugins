export interface OrderProduct {
  quantity: number
  vid: string
}

export interface CreateOrderPayload {
  consigneeID?: string
  email?: string
  fromCountryCode: string
  houseNumber?: string
  iossNumber?: string
  iossType?: number
  logisticName: string
  orderNumber: string
  payType: number
  platform?: string
  products: OrderProduct[]
  remark?: string
  shippingAddress: string
  shippingAddress2?: string
  shippingCity: string
  shippingCountry: string
  shippingCountryCode: string
  shippingCounty?: string
  shippingCustomerName: string
  shippingPhone: string
  shippingProvince: string
  shippingZip: string
  shopAmount?: string
  taxId?: string
}

interface ProductInfo {
  isGroup: boolean
  lineItemId: string
  quantity: number
  subOrderProducts: {
    lineItemId: string
    quantity: number
    variantId: string
  }[]
  variantId: string
}

// Define the order interception reasons structure
interface InterceptOrderReason {
  code: number
  message: string
}

export interface CreateOrderResponse {
  actualPayment?: number
  cjPayUrl?: string
  interceptOrderReasons: InterceptOrderReason[]
  iossAmount?: number
  iossTaxHandlingFee?: number
  logisticsMiss?: boolean
  orderAmount?: number
  orderId: string
  orderNumber: string
  orderOriginalAmount?: number
  orderStatus: string
  postageAmount?: number
  postageDiscountAmount?: number
  postageOriginalAmount?: number
  productAmount?: number
  productDiscountAmount?: number
  productInfoList: ProductInfo[]
  productOriginalAmount?: number
  shipmentOrderId: string
  totalDiscountAmount?: number
}

export interface Order {
  cjOrderId: null | string
  createDate: string
  logisticName?: string
  orderAmount?: number
  orderId: string
  orderNum: string
  orderStatus: string
  orderWeight: number
  paymentDate?: string
  postageAmount?: number
  productAmount: number
  productList?: any[] // You may replace `any` with a more specific type if known
  remark?: string
  shippingAddress: string
  shippingCity: string
  shippingCountryCode: string
  shippingCustomerName: string
  shippingPhone: string
  shippingProvince: string
  trackNumber?: string
}

export interface ListOrderResponse {
  list: Order[]
  pageNum: number
  pageSize: number
  total: number
}

export interface QueryOrderParams {
  orderId?: string
  orderNum?: string
}

export interface ProductListEntry {
  quantity: number
  sellPrice: number
  vid: string
}

export interface QueryOrderResponse {
  cjOrderId: null | string
  createDate: string
  isComplete: number
  logisticName?: string
  orderAmount: number
  orderId: string
  orderNum: string
  orderStatus: string
  orderWeight: number
  paymentDate?: string
  postageAmount: number
  productAmount: number
  productList: ProductListEntry[]
  remark?: string
  shippingAddress: string
  shippingCity: string
  shippingCountryCode: string
  shippingCustomerName: string
  shippingPhone: string
  shippingProvince: string
  trackNumber?: string
}
