// GlobalViewRedirect.tsx (Server Component)

import { CollectionSlug, ServerProps, ViewTypes } from "payload";
import { getGlobalViewRedirect } from "../../utilities/getGlobalViewRedirect";
import { GlobalRedirectClient } from "./GlobalRedirectClient";
import { headers as getHeaders } from "next/headers";

type Args = {
    basePath?: string;
    collectionSlug: CollectionSlug;
    docID?: number | string;
    globalSlugs: string[];
    tenantFieldName: string;
    tenantsCollectionSlug: string;
    useAsTitle: string;
    viewType: ViewTypes;
} & ServerProps;

export async function GlobalViewRedirect(props: Args) {
    const {
        collectionSlug,
        globalSlugs,
        basePath,
        docID,
        tenantFieldName,
        tenantsCollectionSlug,
        useAsTitle,
        viewType,
        payload,
        user,
    } = props;

    if (!collectionSlug || !globalSlugs.includes(collectionSlug)) {
        return null;
    }

    const headers = await getHeaders();
    const redirectTo = await getGlobalViewRedirect({
        slug: collectionSlug,
        basePath,
        docID,
        headers,
        payload,
        tenantFieldName,
        tenantsCollectionSlug,
        useAsTitle,
        user: user as any,
        view: viewType,
    });

    if (!redirectTo) return null;

    return <GlobalRedirectClient to={redirectTo} />;
}
