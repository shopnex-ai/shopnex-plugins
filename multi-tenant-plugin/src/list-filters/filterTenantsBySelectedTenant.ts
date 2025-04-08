import type { PayloadRequest, Where } from "payload";

import { getCollectionIDType } from "../utilities/getCollectionIDType";
import { getTenantFromCookie } from "../utilities/getTenantFromCookie";

type Args = {
    req: PayloadRequest;
    tenantsCollectionSlug: string;
};
export const filterTenantsBySelectedTenant = ({
    req,
    tenantsCollectionSlug,
}: Args): null | Where => {
    const idType = getCollectionIDType({
        collectionSlug: tenantsCollectionSlug as any,
        payload: req.payload,
    });
    const selectedTenant = getTenantFromCookie(req.headers, idType);

    if (selectedTenant) {
        return {
            id: {
                equals: selectedTenant,
            },
        };
    }

    return {};
};
