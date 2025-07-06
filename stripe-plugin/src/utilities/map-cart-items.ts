import { Cart } from "@shopnex/types";

export const mapCartItems = (cartItems: Cart["cartItems"]) => {
    return cartItems?.map((item) => {
        return {
            id: item.variantId,
            quantity: item.quantity,
        };
    });
};
