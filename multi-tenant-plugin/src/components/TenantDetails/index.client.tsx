"use client";

import { Link } from "@payloadcms/ui";
import { useTenantSelection } from "../../providers/TenantSelectionProvider/index.client";
import "./index.scss";
import { useMemo } from "react";

const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("");
};

export const TenantDetails = () => {
    const data = useTenantSelection();

    const selectedTenantName = useMemo(
        () =>
            data.options.find(
                (option) => option.value === data.selectedTenantID
            )?.label,
        [data.selectedTenantID, data.options]
    ) as string;

    const avatarText = useMemo(() => {
        return getInitials(selectedTenantName) || "SN";
    }, [selectedTenantName]);

    const tenantDomain = useMemo(() => {
        return `https://${data.selectedTenantSlug ? data.selectedTenantSlug + "." : ""}shopnex.ai`;
    }, [data.selectedTenantSlug]);

    return (
        <div className="store-preview">
            <div className="store-avatar">{avatarText}</div>
            <div className="store-info">
                <div className="store-name">
                    {selectedTenantName || "ShopNex"}
                </div>
                <Link
                    target="_blank"
                    href={tenantDomain}
                    className="store-domain"
                >
                    {tenantDomain.replace("https://", "")}
                </Link>
            </div>
        </div>
    );
};
