"use client";

import { getTranslation } from "@payloadcms/translations";
import { PopupList, useConfig, useDocumentDrawer, useTheme, useTranslation } from "@payloadcms/ui";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CSVImporter } from "csv-import-react";
import useThemeEnforcer from "./useThemeEnforcer";
import { importColumns } from "./importColumns";
import dynamic from "next/dynamic";

const baseClass = "export-list-menu-item";

const CSVImporterDynamic = dynamic(
    () => import("csv-import-react").then((mod) => mod.CSVImporter),
    {
        ssr: false,
    },
);

export const ImportListMenuItem = ({ collectionSlug, customColumns }) => {
    const { getEntityConfig } = useConfig();
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    useThemeEnforcer(theme);
    const {
        config: {
            routes: { api },
            serverURL,
        },
    } = useConfig();

    const currentCollectionConfig = getEntityConfig({ collectionSlug });

    return (
        <>
            <PopupList.Button className={baseClass} onClick={() => setIsOpen(true)}>
                Import {getTranslation(currentCollectionConfig.labels.plural, i18n)}
            </PopupList.Button>
            <CSVImporterDynamic
                darkMode={theme === "dark"}
                modalCloseOnOutsideClick
                modalIsOpen={isOpen}
                modalOnCloseTriggered={() => setIsOpen(false)}
                onComplete={async (data) => {
                    const response = await fetch(`${serverURL}${api}/${collectionSlug}/import`, {
                        body: JSON.stringify({
                            collectionSlug,
                            data,
                        }),
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                    });
                }}
                customStyles={{
                    "color-primary": "var(--color-success-500)",
                    "color-primary-hover": "var(--color-success-600)",
                    "border-radius": "var(--style-radius-m)",
                    "font-size": "13px",
                    "color-background": "var(--external-colors-white)",
                    "color-background-modal": "var(--external-colors-white)",
                }}
                template={{
                    columns: customColumns || importColumns[collectionSlug],
                }}
            />
        </>
    );
};
