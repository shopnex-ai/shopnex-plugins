import type { CJApiResponse } from "../../types";

/**
 * API Request Parameters for CJ Dropshipping Product List
 */
export interface ProductListParams {
    /** Brand ID filter */
    brandOpenId?: number;
    /** Category ID for filtering */
    categoryId?: string;
    /** Country code, e.g., CN, US */
    countryCode?: string;
    /** Start creation time, format: yyyy-MM-dd hh:mm:ss */
    createTimeFrom?: string;
    /** End creation time, format: yyyy-MM-dd hh:mm:ss */
    createTimeTo?: string;
    /** Delivery time in hours, values: 24, 48, 72 */
    deliveryTime?: string;
    /** Maximum inventory filter */
    endInventory?: number;
    /** Maximum listed number */
    maxListedNum?: number;
    /** Maximum price filter */
    maxPrice?: number;
    /** Minimum listed number */
    minListedNum?: number;
    /** Minimum price filter */
    minPrice?: number;
    /** Sort field: createAt/listedNum, default is createAt */
    orderBy?: string;
    /** Page number
     * @default 1
     * @example 1
     */
    pageNum?: number;
    /** Quantity of results on each page, default is 20 */
    pageSize?: number;
    /** Product ID for specific lookup */
    pid?: string;
    /** Product name for search */
    productName?: string;
    /** Product name in English */
    productNameEn?: string;
    /** Product SKU for specific lookup */
    productSku?: string;
    /** Product type, values: ORDINARY_PRODUCT, SUPPLIER_PRODUCT */
    productType?: string;
    /** Search type: 0 = All, 2 = Trending, 21 = Trending View More */
    searchType?: number;
    /** Sort order: asc/desc, default is desc */
    sort?: string;
    /** Minimum inventory filter */
    startInventory?: number;
    /** Verified inventory type: 1 = Verified, 2 = Unverified */
    verifiedWarehouse?: number;
}

/**
 * Product Data Structure
 */
export interface Product {
    addMarkStatus?: boolean;
    categoryId: string;
    categoryName: string;
    createTime?: string;
    isVideo?: number;
    listedNum?: number;
    listingCount?: number;
    pid: string;
    productImage: string;
    productName: string[];
    productNameEn: string;
    productSku: string;
    productType: null | string;
    productUnit: string;
    productWeight: number;
    saleStatus?: number;
    sellPrice: number;
    sourceFrom?: string;
    supplierId?: string;
    supplierName?: string;
}

/**
 * Parameters for querying product details.
 */
export interface ProductQueryParams {
    /** Product ID
     * @example "000B9312-456A-4D31-94BD-B083E2A198E8"
     */
    pid?: string;

    /** Product SKU
     * @example "CJJJJTJT05843"
     */
    productSku?: string;

    /** Variant SKU
     * @example "CJJJJTJT05843-Black"
     */
    variantSku?: string;
}

/**
 * Variant details of a product.
 */
export interface ProductVariant {
    createTime?: string;
    pid: string;
    variantHeight?: number;
    variantImage?: string;
    variantKey?: string;
    variantLength?: number;
    variantName?: string;
    variantNameEn: string;
    variantProperty?: string;
    variantSellPrice?: number;
    variantSku: string;
    variantStandard?: string;
    variantSugSellPrice?: number;
    variantUnit?: string;
    variantVolume?: number;
    variantWeight?: number;
    variantWidth?: number;
    vid: string;
}

/**
 * Product details.
 */
export interface ProductDetails {
    categoryId: string;
    categoryName: string;
    createrTime?: string;
    description?: string;
    entryCode?: string;
    entryName?: string;
    entryNameEn?: string;
    listedNum: number;
    materialKey?: string[];
    materialName?: string[];
    materialNameEn?: string[];
    packingKey?: string[];
    packingName?: string[];
    packingNameEn?: string[];
    packingWeight?: number;
    pid: string;
    productImage: string;
    productKey?: string[];
    productKeyEn?: string;
    productName: string[];
    productNameEn: string;
    productSku: string;
    productType:
        | "ORDINARY_PRODUCT"
        | "PACKAGING_PRODUCT"
        | "SERVICE_PRODUCT"
        | "SUPPLIER_PRODUCT"
        | "SUPPLIER_SHIPPED_PRODUCT";
    productUnit: string;
    productWeight: number;
    sellPrice: number;
    status: "0" | "1" | "2" | "3" | "4" | "5" | "6";
    suggestSellPrice?: string;
    supplierId?: string;
    supplierName?: string;
    variants?: ProductVariant[];
}

export interface CategoryThirdLevel {
    categoryId: string;
    categoryName: string;
}

interface CategorySecondLevel {
    categorySecondList: CategoryThirdLevel[];
    categorySecondName: string;
}

export interface CategoryFirstLevel {
    categoryFirstList: CategorySecondLevel[];
    categoryFirstName: string;
}
/**
 * API Response Structure for CJ Dropshipping Category List
 */
export type CategoryListResponse = CJApiResponse<CategoryFirstLevel[]>;

/**
 * API Response Structure for CJ Dropshipping Product List
 */
export type ProductListResponse = CJApiResponse<{
    list: Product[];
    pageNum: number;
    pageSize: number;
    total: number;
}>;

/**
 * API response format for product query.
 */
export type ProductQueryResponse = CJApiResponse<ProductDetails>;

export interface StockInfo {
    vid?: string;
    areaId: number;
    areaEn: string;
    countryCode: string;
    countryNameEn?: string;
    storageNum?: number;
    totalInventoryNum: number;
    cjInventoryNum: number;
    factoryInventoryNum: number;
}
