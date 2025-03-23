"use client";

import React from "react";
import { Gutter, LoadingOverlay, RenderTitle, TextareaInput, TextInput } from "@payloadcms/ui";
import { useParams } from "next/navigation";
import "./plugin-edit.scss";

const baseClass = "plugin-edit-view";

export function PluginEditView() {
    const { segments } = useParams();
    const pluginId = segments?.at(-1);

    const [plugin, setPlugin] = React.useState<any>(null);

    React.useEffect(() => {
        fetch(`https://shopnex-studio.onrender.com/api/products/${pluginId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setPlugin(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [pluginId]);

    if (!plugin) {
        return <LoadingOverlay />;
    }

    return (
        <Gutter className={baseClass}>
            <div className={`${baseClass}__header`}>
                <img
                    src={plugin?.variants?.[0]?.gallery?.[0]?.url || ""}
                    alt={plugin.title}
                    className={`${baseClass}__image`}
                    style={{
                        maxHeight: "75px",
                        objectFit: "cover",
                        borderRadius: "8px",
                    }}
                />
                <div className={`${baseClass}__block`}>
                    <RenderTitle className={`${baseClass}__title`} title={plugin?.title} />
                    <div className={`${baseClass}__info`}>
                        <div className={`${baseClass}__author`}>
                            By {plugin?.authorName || "Unknown"}
                        </div>{" "}
                        |
                        <div className={`${baseClass}__price`}>
                            {plugin?.variants[0]?.price === 0
                                ? "Free"
                                : `From $${plugin?.variants[0]?.price}`}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${baseClass}__inputs`}>
                <TextInput
                    path="installPlugin"
                    label="Install Plugin"
                    readOnly
                    className={`${baseClass}__input`}
                    value={`pnpm install ${plugin?.packageName}`}
                />
                <TextInput
                    label="Plugin Version"
                    path="pluginVersion"
                    value={plugin?.version || "0.0.1"}
                    className={`${baseClass}__input`}
                    readOnly
                />
            </div>
            <TextareaInput
                label="Plugin Description"
                path="pluginDescription"
                value={""}
                className={`${baseClass}__textarea`}
                readOnly
            />
        </Gutter>
    );
}
