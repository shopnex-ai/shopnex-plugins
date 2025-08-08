import { GiftCard } from "@shopnex/types";
import { WooCoupon } from "../types";

export function mapWooGiftCard(coupon: WooCoupon): GiftCard {
    // Only map value if discount_type is fixed amount
    const value =
        coupon.discount_type === "fixed_cart" ||
        coupon.discount_type === "fixed_product"
            ? parseFloat(coupon.amount)
            : 0;

    return {
        id: coupon.id,
        code: coupon.code,
        value,
        // If you want to map a customer, you can customize this, but WooCoupon used_by is array of emails, not IDs
        // customer: coupon.used_by.length > 0 ? parseInt(coupon.used_by[0]) : null,
        expiryDate: coupon.date_expires ? coupon.date_expires : null,
        updatedAt: coupon.date_modified,
        createdAt: coupon.date_created,
    };
}
