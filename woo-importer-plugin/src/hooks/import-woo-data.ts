import { CollectionBeforeChangeHook } from "payload";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import {
    WooCoupon,
    WooCustomer,
    WooOrder,
    WooProduct,
    WooResult,
    WooTag,
    WooVariation,
} from "../types";
import { mapWooProduct } from "../mappers/product-mapper";
import { mapWooCustomer } from "../mappers/customer-mapper";
import { mapWooOrder } from "../mappers/order-mapper";
import { getShopId } from "@shopnex/utils/helpers";
import { Product } from "@shopnex/types";
import { mapWooCart } from "../mappers/cart-mapper";
import { mapWooTag } from "../mappers/tag-mapper";
import { mapWooGiftCard } from "../mappers/gift-card-mapper";

export const importWooData: CollectionBeforeChangeHook = async ({
    operation,
    req,
    data,
}) => {
    const { url, consumerKey, consumerSecret } = data;

    if (!url || !consumerKey || !consumerSecret) {
        throw new Error("Missing Woo Importer credentials");
    }

    const shopId = getShopId(req);

    const api = new WooCommerceRestApi({
        url,
        consumerKey,
        consumerSecret,
        version: "wc/v3",
    });

    try {
        // Fetch data from WooCommerce
        const productsRes: WooResult<WooProduct> = await api.get("products");
        const ordersRes: WooResult<WooOrder> = await api.get("orders");
        const customersRes: WooResult<WooCustomer> = await api.get("customers");
        const tagsRes: WooResult<WooTag> = await api.get("products/tags");
        const couponsRes: WooResult<WooCoupon> = await api.get("coupons");
        // const categoriesRes: WooResult<WooCategory> = await api.get(
        //     "products/categories"
        // );

        const products = productsRes.data;
        const orders = ordersRes.data;
        const customers = customersRes.data;
        const tags = tagsRes.data;
        const coupons = couponsRes.data;

        let productsResult: Product[] = [];

        // Sync products
        for (const wooProduct of products) {
            let wooVariants: WooVariation = [];
            if (wooProduct.type === "variable") {
                const variationsRes = await api.get(
                    `products/${wooProduct.id}/variations`
                );
                wooVariants = variationsRes.data;
            }
            const mappedProduct = mapWooProduct(wooProduct, wooVariants);
            const product = await req.payload.create({
                collection: "products",
                data: { ...mappedProduct, shop: shopId },
                req,
            });
            productsResult.push(product);
        }

        // Sync customers
        for (const wooCustomer of customers) {
            const mappedCustomer = mapWooCustomer(wooCustomer);
            await req.payload.create({
                collection: "customers",
                data: { ...mappedCustomer, shop: shopId },
                req,
            });
        }

        // Sync orders
        for (const wooOrder of orders) {
            const mappedCart = mapWooCart(wooOrder, productsResult);
            const cartRes = await req.payload.create({
                collection: "carts",
                data: { ...mappedCart, shop: shopId },
                req,
            });
            const mappedOrder = mapWooOrder(wooOrder);
            await req.payload.create({
                collection: "orders",
                data: {
                    ...mappedOrder,
                    shop: shopId,
                    cart: cartRes.id, // link created cart
                },
                req,
            });
        }

        // Sync tags
        for (const wooTag of tags) {
            const mappedTag = mapWooTag(wooTag);
            await req.payload.create({
                collection: "collections",
                data: { ...mappedTag, shop: shopId },
                req,
            });
        }

        // Sync coupons
        for (const wooCoupon of coupons) {
            const mappedCoupon = mapWooGiftCard(wooCoupon);
            await req.payload.create({
                collection: "gift-cards",
                data: { ...mappedCoupon, shop: shopId },
                req,
            });
        }
    } catch (error) {
        console.error("Error during WooCommerce import:", error);
        throw new Error("WooCommerce import failed");
    }
};
