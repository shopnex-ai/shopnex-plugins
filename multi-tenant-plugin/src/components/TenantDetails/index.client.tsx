"use client";

import { Link } from "@payloadcms/ui";
import { useTenantSelection } from "../../providers/TenantSelectionProvider/index.client";
import "./index.scss";

export const TenantDetails = () => {
    const data = useTenantSelection();
    const selectedTenantName = data.options.find((option) => option.value === data.selectedTenantID)
        ?.label as string;

    const avatarText = selectedTenantName?.slice(0, 2).toUpperCase() || "SN";

    const tenantDomain = `${data.selectedTenantSlug ? data.selectedTenantSlug + "." : ""}shopnexai.com`;

    return (
        <div className="store-preview">
            <div className="store-avatar">{avatarText}</div>
            <div className="store-info">
                <div className="store-name">{selectedTenantName || "ShopNex"}</div>
                <Link target="_blank" href={tenantDomain} className="store-domain">
                    {tenantDomain}
                </Link>
            </div>
        </div>
    );
};
