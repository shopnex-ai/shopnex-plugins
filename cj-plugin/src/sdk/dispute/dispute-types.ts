// disputes-types.ts
export interface CreateDisputeRequest {
    businessDisputeId: string;
    disputeReasonId: number;
    expectType: number;
    imageUrl?: string[];
    messageText: string;
    orderId: string;
    productInfoList: {
        lineItemId: string;
        price?: number; // If necessary
        quantity: number;
    }[];
    refundType: number;
    videoUrl?: string[];
}

export interface DisputeAPIResponse {
    code: number;
    data: any; // Adjust based on the actual structure
    message: string;
    redirectUri?: string;
    requestId?: string;
    result: boolean;
}

// dispute-types.ts
export interface ConfirmDisputeRequest {
    orderId: string;
    productInfoList: {
        lineItemId: string;
        price?: number; // If necessary
        quantity: number;
    }[];
}

export interface ConfirmDisputeResponse {
    code: number;
    data: {
        disputeReasonList: {
            disputeReasonId: number;
            reasonName: string;
        }[];
        expectResultOptionList: string[];
        maxAmount: number;
        maxIossHandTaxAmount: number;
        maxIossTaxAmount: number;
        maxPostage: number;
        maxProductPrice: number;
        orderId: string;
        orderNumber: string;
        productInfoList: {
            canChoose: boolean;
            cjImage: string;
            cjProductId: string;
            cjProductName: string;
            cjVariantId: string;
            lineItemId: string;
            price: number;
            quantity: number;
            sku: string;
            supplierName: string;
        }[];
    };
    message: string;
    requestId: string;
    result: boolean;
    success: boolean;
}
