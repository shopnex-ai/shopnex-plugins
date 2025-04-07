import type { Payload, User, ViewTypes } from "payload";

import { SELECT_ALL } from "../constants";
import { findTenantOptions } from "../queries/findTenantOptions";
import { getCollectionIDType } from "./getCollectionIDType";
import { getTenantFromCookie } from "./getTenantFromCookie";

type Args = {
    docID?: number | string;
    headers: Headers;
    payload: Payload;
    slug: string;
    tenantFieldName: string;
    tenantsCollectionSlug: string;
    useAsTitle: string;
    user?: User;
    view: ViewTypes;
};
export async function getGlobalViewRedirect({
    slug,
    docID,
    headers,
    payload,
    tenantFieldName,
    tenantsCollectionSlug,
    useAsTitle,
    user,
    view,
}: Args): Promise<string | void> {
    const idType = getCollectionIDType({
        collectionSlug: tenantsCollectionSlug as any,
        payload,
    });
    let tenant = getTenantFromCookie(headers, idType);
    let redirectRoute;

    if (!tenant || tenant === SELECT_ALL) {
        const tenantsQuery = await findTenantOptions({
            limit: 1,
            payload,
            tenantsCollectionSlug,
            useAsTitle,
            user,
        });

        tenant = tenantsQuery.docs[0]?.id || null;
    }

    try {
        const { docs } = await payload.find({
            collection: slug as any,
            depth: 0,
            limit: 1,
            overrideAccess: false,
            pagination: false,
            user,
            where: {
                [tenantFieldName]: {
                    equals: tenant,
                },
            },
        });

        const tenantDocID = docs?.[0]?.id;

        if (view === "document") {
            if (docID && !tenantDocID) {
                // viewing a document with an id but does not match the selected tenant, redirect to create route
                redirectRoute = `${payload.config.routes.admin}/collections/${slug}/create`;
            } else if (tenantDocID && docID !== tenantDocID) {
                // tenant document already exists but does not match current route doc ID, redirect to matching tenant doc
                redirectRoute = `${payload.config.routes.admin}/collections/${slug}/${tenantDocID}`;
            }
        } else if (view === "list") {
            if (tenantDocID) {
                // tenant document exists, redirect to edit view
                redirectRoute = `${payload.config.routes.admin}/collections/${slug}/${tenantDocID}`;
            } else {
                // tenant document does not exist, redirect to create route
                redirectRoute = `${payload.config.routes.admin}/collections/${slug}/create`;
            }
        }
    } catch (e: unknown) {
        payload.logger.error(
            e,
            `${typeof e === "object" && e && "message" in e ? `e?.message - ` : ""}Multi Tenant Redirect Error`,
        );
    }
    return redirectRoute;
}
