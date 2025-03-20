import type { DefaultNodeTypes, TypedEditorState } from '@payloadcms/richtext-lexical'
import type { BasePayload } from 'payload'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import decimal from 'decimal.js'
import { JSDOM } from 'jsdom'

import type { ProductDetails } from '../sdk/products/product-types'

import * as cjSdk from '../sdk/cj-sdk'

interface Product {
  description: TypedEditorState<DefaultNodeTypes>
  pid: string
  title: string
  variants?: Array<{
    imageUrl?: string
    options?: Array<{ option: string; value: string }>
    price?: number
    vid: string
  }>
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mapMockProductToSchema(product: ProductDetails, editorConfig: any, rate: number) {
  return {
    description: convertHTMLToLexical({
      editorConfig,
      html: product.description || '',
      JSDOM,
    }),
    pid: product.pid,
    title: product.productNameEn,
    variants: product.variants?.map((variant) => ({
      imageUrl: variant.variantImage, // Map image URL to 'id' if using media collection
      options: variant.variantKey?.split('-').map((key, index) => ({
        option: index === 0 ? 'Color' : 'Size', // Assuming 'Color' and 'Size', adjust keys if needed
        value: key,
      })),
      price: new decimal(variant.variantSellPrice || 0).mul(rate).toNumber().toFixed(2),
      vid: variant.vid,
    })),
  }
}

const findProductById = async (productId: string) => {
  const result = await cjSdk.getProductDetails({
    pid: productId,
  })
  return result.data
}

const createOrUpdateProduct = async (
  product: Omit<Product, 'createdAt' | 'id' | 'updatedAt'>,
  payload: BasePayload,
) => {
  const { totalDocs } = await payload.count({
    collection: 'products',
    where: {
      pid: {
        equals: product.pid,
      },
    },
  })

  if (totalDocs === 0) {
    return payload.create({
      collection: 'products',
      data: { ...product },
    })
  }
}

export const fetchExchangeRates = async () => {
  const response = await fetch('https://open.er-api.com/v6/latest/USD')
  const data = await response.json()

  return data
}

export const syncProducts = async (productIds: string[], payload: BasePayload) => {
  const exchangeRates = await fetchExchangeRates()
  const storeSettings = await payload.findGlobal({
    slug: 'store-settings',
  })
  const rate = exchangeRates.rates[storeSettings.currency || 'USD']

  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  })
  const products: ProductDetails[] = []
  for (const productId of productIds) {
    const product = await findProductById(productId)
    if (!product) {
      continue
    }
    products.push(product)
    await delay(1010)
  }
  const mappedProducts = products.map((product) => {
    return mapMockProductToSchema(product, editorConfig, rate)
  })

  await Promise.all(mappedProducts.map((product) => createOrUpdateProduct(product as any, payload)))

  return products
}
