import {
    confirmOrder,
    createOrder,
    deleteOrder,
    listOrders,
    queryOrder,
} from "./orders/orders";
import {
    getProductCategory,
    getProductDetails,
    getProductList,
    getProductStockByVid,
} from "./products/products";
import { getSettings } from "./settings/settings-api";

export type CjSdk = ReturnType<typeof cjSdk>;

export function cjSdk({ accessToken }: { accessToken: string }) {
    return {
        orders: {
            confirmOrder: (params: any) =>
                confirmOrder({ ...params, accessToken }),
            createOrder: (params: any) =>
                createOrder({ ...params, accessToken }),
            deleteOrder: (params: any) =>
                deleteOrder({ ...params, accessToken }),
            listOrders: (params: any) => listOrders({ ...params, accessToken }),
            queryOrder: (params: any) => queryOrder({ ...params, accessToken }),
        },
        products: {
            // getProductCategory: (params) =>
            //     getProductCategory({ ...params, accessToken }),
            getProductDetails: (params: any) =>
                getProductDetails({ ...params, accessToken }),
            // getProductList: (params) =>
            //     getProductList({ ...params, accessToken }),
            getProductStockByVid: (params: any) =>
                getProductStockByVid({ ...params, accessToken }),
        },
        // settings: {
        //     getSettings: () => getSettings({ accessToken }),
        // },
    };
}
