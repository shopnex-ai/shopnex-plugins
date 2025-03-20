
export interface CJApiResponse<T> {
    code: number;
    result: boolean;
    message: string;
    data: T | null;
    requestId: string;
}

export interface AccessTokenResponse {
    code: number;
    result: boolean;
    message: string;
    data: {
        accessToken: string;
        accessTokenExpiryDate: string | Date;
        refreshToken: string;
        refreshTokenExpiryDate: string | Date;
        createDate: string;
    } | null;
    requestId: string;
}



export interface Variant {
    vid: string;
    pid: string;
    variantName: string | null;
    variantNameEn: string | null;
    variantSku: string;
    variantImage: string | null;
    variantStandard: string | null;
    variantUnit: string | null;
    variantProperty: string | null;
    variantKey: string;
    variantLength: number;
    variantWidth: number;
    variantHeight: number;
    variantVolume: number;
    variantWeight: number;
    variantSellPrice: number;
    variantSugSellPrice: number;
    createTime: string;
}

export interface ProductDetailResponseData {
    pid: string;
    productName: string[];
    productNameEn: string;
    productSku: string;
    productImage: string;
    productWeight: number;
    productUnit: string;
    productType: string;
    categoryId: string;
    categoryName: string;
    entryCode: string;
    entryName: string;
    entryNameEn: string;
    materialName: string[];
    materialNameEn: string[];
    materialKey: string[];
    packingWeight: number;
    packingName: string[];
    packingNameEn: string[];
    packingKey: string[];
    productKey: string[];
    productKeyEn: string;
    sellPrice: number;
    sourceFrom: number;
    description: string;
    suggestSellPrice: string;
    listedNum: number;
    status: string;
    supplierName: string;
    supplierId: string;
    variants: Variant[];
    createrTime: string;
}

