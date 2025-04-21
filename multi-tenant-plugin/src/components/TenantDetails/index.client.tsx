"use client";

import { Link } from "@payloadcms/ui";
import { useTenantSelection } from "../../providers/TenantSelectionProvider/index.client";
import "./index.scss";
import { useMemo } from "react";

export const TenantDetails = ({ label: selectedTenantName }: { label: string }) => {
    const data = useTenantSelection();

    const avatarText = useMemo(() => {
        return selectedTenantName?.slice(0, 2).toUpperCase() || "SN";
    }, [selectedTenantName]);

    const tenantDomain = useMemo(() => {
        return `https://${data.selectedTenantSlug ? data.selectedTenantSlug + "." : ""}shopnex.ai`;
    }, [data.selectedTenantSlug]);

    return (
        <div className="store-preview">
            <div className="store-avatar">{avatarText}</div>
            <div className="store-info">
                <div className="store-name">{selectedTenantName || "ShopNex"}</div>
                <Link target="_blank" href={tenantDomain} className="store-domain">
                    {tenantDomain.replace("https://", "")}
                </Link>
            </div>
        </div>
    );
};
