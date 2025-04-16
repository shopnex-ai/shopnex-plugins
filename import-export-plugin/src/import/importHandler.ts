import type { PayloadHandler } from "payload";
import { APIError } from "payload";
import { unflatten } from "flat";
import { parse as parseCookie } from "cookie";

function normalizePrices(products) {
    return products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
            ...variant,
            price: Number(variant.price),
        })),
    }));
}

function mergeProductsByHandle(products) {
    const mergedMap = new Map();

    for (const product of products) {
        const { handle, variants } = product;

        if (mergedMap.has(handle)) {
            const existing = mergedMap.get(handle);
            existing.variants.push(...variants);
        } else {
            mergedMap.set(handle, { ...product, variants: [...variants] });
        }
    }
    return Array.from(mergedMap.values());
}

export const importHandler: PayloadHandler = async (req) => {
    const body = await req.json?.();

    if (!body?.data?.rows || !Array.isArray(body.data.rows)) {
        throw new APIError("Request data with 'rows' is required.");
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parseCookie(cookieHeader);

    const shopId = cookies["payload-tenant"];

    if (!body.collectionSlug) {
        throw new APIError("Missing 'collectionSlug' in body.");
    }

    req.payload.logger.info(
        `Import request received for collection: ${body.collectionSlug} from tenant ${shopId}`,
    );

    const user = req.user;

    const documents = body.data.rows.map((row: any) => {
        const normalizedValue = {};
        for (const key in row.values) {
            const normalizedKey = key.replace(/\[/g, ".").replace(/\]/g, "");
            normalizedValue[normalizedKey] = row.values[key];
        }

        const data: any = unflatten(normalizedValue);
        return {
            ...data,
            ...(shopId && { shop: shopId }),
        };
    });

    const normalized = normalizePrices(documents);
    const products = mergeProductsByHandle(normalized);

    const createdDocs = await Promise.all(
        products.map((doc: any) =>
            req.payload.create({
                collection: body.collectionSlug,
                data: doc,
                user,
            }),
        ),
    );

    return Response.json({
        data: createdDocs,
        status: 200,
    });
};
