import type { PaginatedDocs, Payload, User } from "payload";

type Args = {
    limit: number;
    payload: Payload;
    tenantsCollectionSlug: string;
    useAsTitle: string;
    user?: User;
};
export const findTenantOptions = async ({
    limit,
    payload,
    tenantsCollectionSlug,
    useAsTitle,
    user,
}: Args): Promise<PaginatedDocs> => {
    return payload.find({
        collection: tenantsCollectionSlug as any,
        depth: 0,
        limit,
        overrideAccess: false,
        select: {
            [useAsTitle]: true,
            handle: true,
        },
        sort: useAsTitle,
        user,
    });
};
