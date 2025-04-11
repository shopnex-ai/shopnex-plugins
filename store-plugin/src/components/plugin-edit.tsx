"use client";

import React from "react";
import { Gutter, LoadingOverlay, RenderTitle, TextareaInput, TextInput } from "@payloadcms/ui";
import { useParams } from "next/navigation";
import "./plugin-edit.scss";
import Markdown from "react-markdown";
import { Puzzle } from "lucide-react";
import Image from "next/image";
import { getPlugin } from "../actions/actions";
import './markdown-styles.scss'

const baseClass = "plugin-edit-view";

export function PluginEditView() {
    const { segments } = useParams();
    const pluginId = segments?.at(-1);

    const [plugin, setPlugin] = React.useState<any>(null);

    React.useEffect(() => {
        (async () => {
            const data = await getPlugin(pluginId as string);
            const packageInfo = data.customFields?.find(field => {
                return field.name === 'packageName'
            })
            if (!packageInfo?.packageName) return;
            const readmeResult = await fetch(
                `https://cdn.jsdelivr.net/npm/${packageInfo.packageName}@latest/README.md`,
            );
            const readme = await readmeResult.text();

            setPlugin({
                ...data,
                ...packageInfo,
                description: readme
            });
        })();
    }, [pluginId]);

    const imageUrl = plugin?.variants[0]?.gallery?.[0]?.url || "";

    if (!plugin) {
        return <LoadingOverlay />;
    }

    return (
        <Gutter className={baseClass}>
            <div className={`${baseClass}__header`}>
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={plugin.title}
                        width={60}
                        height={60}
                        className={`${baseClass}__image`}
                        style={{
                            maxHeight: "75px",
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                    />
                ) : (
                    <Puzzle className={`${baseClass}__image`} width={40} height={40} />
                )}
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
                    value={plugin?.packageVersion || "1.0.0"}
                    className={`${baseClass}__input`}
                    readOnly
                />
            </div>
            <div className={`${baseClass}__textarea`}>
                <Markdown>{plugin.description}</Markdown>
            </div>
        </Gutter>
    );
}
