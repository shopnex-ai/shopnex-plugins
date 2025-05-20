import type { APIResponse } from "../../error-types";
import type { CJApiResponse } from "../../types";
import type {
    CreateOrderPayload,
    CreateOrderResponse,
    ListOrderResponse,
    QueryOrderParams,
    QueryOrderResponse,
} from "./order-types.ts";

import { cjApiClient } from "../../api-client";
import { getCurrentAccessToken } from "../access-token";

interface ListOrderParams {
    orderIds?: string[];
    pageNum?: number;
    pageSize?: number;
    status?: string;
}

export async function createOrder(
    orderData: CreateOrderPayload
): Promise<APIResponse<CreateOrderResponse>> {
    try {
        const accessToken = await getCurrentAccessToken();
        const response = await cjApiClient.post<
            CJApiResponse<CreateOrderResponse>
        >("shopping/order/createOrderV2", orderData, {
            headers: {
                "CJ-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        if (!response.data.result) {
            return {
                error: response.data.message || "Failed to create order",
            };
        }

        if (!response.data.data) {
            return { error: "No order created" };
        }

        return { data: response.data.data };
    } catch (error: any) {
        console.error(`Error creating order [${error.code}]: ${error.message}`);
        return { error: error.message || "An unknown error occurred" };
    }
}

export async function listOrders(
    accessToken: string,
    params: ListOrderParams = {}
): Promise<APIResponse<ListOrderResponse>> {
    try {
        const response = await cjApiClient.get<
            CJApiResponse<ListOrderResponse>
        >("shopping/order/list", {
            headers: {
                "CJ-Access-Token": accessToken,
            },
            params,
        });

        if (!response.data.result) {
            return {
                error: response.data.message || "Failed to retrieve orders",
            };
        }

        if (!response.data.data) {
            return { error: "No orders found" };
        }

        return { data: response.data.data };
    } catch (error: any) {
        console.error(`Error listing orders [${error.code}]: ${error.message}`);
        return { error: error.message || "An unknown error occurred" };
    }
}

export async function queryOrder(
    params: QueryOrderParams
): Promise<APIResponse<QueryOrderResponse>> {
    if (!params.orderId && !params.orderNum) {
        return { error: "Either orderId or orderNum must be provided." };
    }

    try {
        const accessToken = await getCurrentAccessToken();
        const response = await cjApiClient.get<
            CJApiResponse<QueryOrderResponse>
        >("shopping/order/getOrderDetail", {
            headers: {
                "CJ-Access-Token": accessToken,
            },
            params,
        });

        if (!response.data.result) {
            return {
                error:
                    response.data.message || "Failed to retrieve order details",
            };
        }

        if (!response.data.data) {
            return { error: "No order details found" };
        }

        return { data: response.data.data };
    } catch (error: any) {
        console.error(`Error querying order [${error.code}]: ${error.message}`);
        return { error: error.message || "An unknown error occurred" };
    }
}

export async function deleteOrder(
    orderId: string
): Promise<APIResponse<{ data: string }>> {
    if (!orderId) {
        return { error: "orderId must be provided." };
    }

    try {
        const accessToken = await getCurrentAccessToken();
        const response = await cjApiClient.delete<
            CJApiResponse<{ data: string }>
        >("shopping/order/deleteOrder", {
            headers: {
                "CJ-Access-Token": accessToken,
            },
            params: { orderId },
        });

        if (!response.data.result) {
            return {
                error: response.data.message || "Failed to delete order",
            };
        }

        if (!response.data.data) {
            return { error: "Order deletion not confirmed, no data returned" };
        }

        return { data: response.data.data };
    } catch (error: any) {
        console.error(`Error deleting order [${error.code}]: ${error.message}`);
        return { error: error.message || "An unknown error occurred" };
    }
}

export async function confirmOrder(
    orderId: string
): Promise<APIResponse<string>> {
    if (!orderId) {
        return { error: "orderId must be provided." };
    }

    try {
        const accessToken = await getCurrentAccessToken();
        const response = await cjApiClient.patch<CJApiResponse<string>>(
            "shopping/order/confirmOrder",
            { orderId },
            {
                headers: {
                    "CJ-Access-Token": accessToken,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data.result) {
            return {
                error: response.data.message || "Failed to confirm order",
            };
        }

        if (!response.data.data) {
            return {
                error: "Order confirmation not confirmed, no data returned",
            };
        }

        return { data: response.data.data };
    } catch (error: any) {
        console.error(
            `Error confirming order [${error.code}]: ${error.message}`
        );
        return { error: error.message || "An unknown error occurred" };
    }
}
