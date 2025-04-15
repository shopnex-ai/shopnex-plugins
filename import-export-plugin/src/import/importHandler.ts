import type { PayloadHandler } from "payload";
import { APIError } from "payload";
import { unflatten } from "flat";
import { parse as parseCookie } from "cookie";

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

    const createdDocs = await Promise.all(
        documents.map((doc: any) =>
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
