import type { PayloadRequest, Where } from "payload";

import { getCollectionIDType } from "../utilities/getCollectionIDType";
import { getTenantFromCookie } from "../utilities/getTenantFromCookie";

type Args = {
    req: PayloadRequest;
    tenantFieldName: string;
    tenantsCollectionSlug: string;
    userHasAccessToAllTenants: (user: any) => boolean;
};
export const filterDocumentsBySelectedTenant = ({
    req,
    tenantFieldName,
    tenantsCollectionSlug,
    userHasAccessToAllTenants,
}: Args): null | Where => {
    const idType = getCollectionIDType({
        collectionSlug: tenantsCollectionSlug as any,
        payload: req.payload,
    });

    const selectedTenant = getTenantFromCookie(req.headers, idType);
    const isSuperAdmin = userHasAccessToAllTenants(req.user);

    if (isSuperAdmin) {
        return {};
    }

    if (selectedTenant) {
        return {
            [tenantFieldName]: {
                equals: selectedTenant,
            },
        };
    }
    return {
        [tenantFieldName]: {
            equals: null,
        },
    };
};
