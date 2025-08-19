import { PayloadRequest } from "payload";

interface CartItem {
    id: string;
    quantity: number;
}

export const getVariants = async ({
    variantIds,
    req,
}: {
    variantIds: string[];
    req: PayloadRequest;
}) => {
    const products = await req.payload.find({
        collection: "products",
        where: {
            "variants.id": {
                in: variantIds,
            },
        },
    });

    const variantsMap = new Map<string, any>();

    for (const product of products.docs) {
        for (const variant of product.variants) {
            if (variantIds.includes(variant.id || "")) {
                // Ensure gallery exists and defaults to product images if empty
                const variantGallery =
                    variant.gallery?.map((img: any) => img.url) || [];
                const firstVariantGallery =
                    product.variants[0]?.gallery?.map((img: any) => img.url) ||
                    [];

                variantsMap.set(variant.id || "", {
                    ...variant,
                    gallery:
                        variantGallery.length > 0
                            ? variantGallery
                            : firstVariantGallery,
                    product: product.id,
                });
            }
        }
    }

    return variantIds.map((id) => variantsMap.get(id)).filter(Boolean);
};

export const validateCartItems = async ({
    cartItems,
    req,
}: {
    cartItems: CartItem[];
    req: PayloadRequest;
}) => {
    const variantIds = cartItems.map((item) => item.id);
    const variants = await getVariants({ variantIds, req });

    if (!variants.length) {
        req.payload.logger.error("No valid variants found for checkout");
        throw new Error("Invalid product variants.");
    }

    return variants.map((variant) => ({
        ...variant,
        quantity:
            cartItems.find((item) => item.id === variant.id)?.quantity || 0,
    }));
};
