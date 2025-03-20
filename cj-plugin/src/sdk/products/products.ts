import type { APIResponse } from '../../error-types'
import type {
  CategoryFirstLevel,
  CategoryListResponse,
  Product,
  ProductDetails,
  ProductListResponse,
} from './product-types.ts'

import { cjApiClient } from '../../api-client'
import { getCurrentAccessToken } from '../access-token'

export async function getProductCategory(
  accessToken: string,
  params: any,
): Promise<APIResponse<CategoryFirstLevel[]>> {
  try {
    const response = await cjApiClient.get<CategoryListResponse>('/product/getCategory', {
      headers: { 'CJ-Access-Token': accessToken },
      params,
    })

    const data = response.data.data
    if (!data) {
      return { error: 'No categories found' }
    }

    return { data }
  } catch (error: any) {
    console.error(`Error fetching categories [${error.code}]: ${error.message}`)
    return { error: error.message || 'Failed to fetch categories' }
  }
}

export async function getProductList(
  params: Record<string, any> = {},
): Promise<APIResponse<Product[]>> {
  const defaultParams = {
    pageNum: 1,
    pageSize: 20,
  }
  const query = { ...defaultParams, ...params }

  try {
    const accessToken = await getCurrentAccessToken()
    const response = await cjApiClient.get<ProductListResponse>(
      'https://developers.cjdropshipping.com/api2.0/v1/product/list',
      {
        headers: {
          'CJ-Access-Token': accessToken,
        },
        params: query,
      },
    )

    const data = response.data

    if (!data.result) {
      return { error: data.message || 'Failed to fetch product list' }
    }

    if (!data.data?.list) {
      return { error: 'No products found' }
    }

    return { data: data.data.list }
  } catch (error: any) {
    console.error(`Error fetching product list [${error.code}]: ${error.message}`)
    return { error: error.message || 'Failed to fetch product list' }
  }
}

export async function getProductDetails(queryParams: {
  pid?: string
  productSku?: string
  variantSku?: string
}): Promise<APIResponse<ProductDetails>> {
  const { pid, productSku, variantSku } = queryParams
  if (!pid && !productSku && !variantSku) {
    return {
      error: 'One of pid, productSku, or variantSku must be provided.',
    }
  }

  try {
    const accessToken = await getCurrentAccessToken()
    const response = await cjApiClient.get<{
      code: number
      data: ProductDetails
      message: string
      result: boolean
    }>('https://developers.cjdropshipping.com/api2.0/v1/product/query', {
      headers: {
        'CJ-Access-Token': accessToken,
      },
      params: queryParams,
    })

    if (!response.data.result) {
      return {
        error: response.data.message || 'Failed to fetch product details',
      }
    }

    return { data: response.data.data }
  } catch (error: any) {
    console.error(`Error fetching product details [${error.code}]: ${error.message}`)
    return { error: error.message || 'Failed to fetch product details' }
  }
}
