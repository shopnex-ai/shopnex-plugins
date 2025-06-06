import type { PayloadHandler } from "payload";
import { APIError } from "payload";
import { unflatten } from "flat";
import { parse as parseCookie } from "cookie";

// Normalize prices if there are variants
function normalizePrices(documents: any[]) {
    return documents.map((doc) => {
        if (Array.isArray(doc.variants)) {
            return {
                ...doc,
                variants: doc.variants.map((variant: any) => ({
                    ...variant,
                    price: Number(variant.price),
                })),
            };
        }
        return doc;
    });
}

// Merge by handle if exists
function mergeByHandle(documents: any[]) {
    const mergedMap = new Map();

    for (const doc of documents) {
        const { handle, variants } = doc;

        if (handle && Array.isArray(variants)) {
            if (mergedMap.has(handle)) {
                const existing = mergedMap.get(handle);
                existing.variants.push(...variants);
            } else {
                mergedMap.set(handle, { ...doc, variants: [...variants] });
            }
        } else {
            // No handle or variants? Just push as-is with a unique key
            mergedMap.set(Symbol(), doc);
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
        `Import request received for collection: ${body.collectionSlug} from tenant ${shopId}`
    );

    const user = req.user;

    const documents = body.data.rows.map((row: any) => {
        const normalizedValue: Record<string, any> = {};
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
    const finalDocuments = mergeByHandle(normalized);

    const createdDocs = await Promise.all(
        finalDocuments.map((doc: any) =>
            req.payload.create({
                collection: body.collectionSlug,
                data: doc,
                user,
            })
        )
    );

    return Response.json({
        data: createdDocs,
        status: 200,
    });
};
