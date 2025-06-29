import React from "react";
import "./ThemeList.scss";
import "./ThemeList.scss";
import Image from "next/image";
import { ThemeActions } from "./ThemeActions";

const themes = [
    {
        id: 1,
        name: "furniro",
        dateAdded: "Added by Shopnex",
        version: "15.3.0",
        availableUpdate: true,
        preview: "/furniro-theme-preview.png",
    },
    {
        id: 2,
        name: "freebie",
        dateAdded: "Added by Shopnex",
        version: "15.3.0",
        availableUpdate: false,
        preview: "/freebie-theme-preview.png",
    },
];

export const ThemeList = ({ data }: any) => {
    const isKeysDefined = data?.editorMode?.some(
        (type: any) => type.builderIoPublicKey && type.builderIoPrivateKey
    );

    return isKeysDefined ? (
        <div className="builder-theme-list">
            {themes.map((theme) => (
                <div className="theme-card" key={theme.id}>
                    <Image
                        src={theme.preview}
                        alt={theme.name}
                        className="theme-preview"
                        width={500}
                        height={500}
                    />
                    <div className="theme-info">
                        <h2>{theme.name}</h2>
                        <p className="date">{theme.dateAdded}</p>
                    </div>
                    <ThemeActions theme={theme} themeId={data.id} />
                </div>
            ))}
        </div>
    ) : null;
};
