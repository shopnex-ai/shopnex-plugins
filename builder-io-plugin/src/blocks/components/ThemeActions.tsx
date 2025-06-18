"use client";

import { Button } from "@payloadcms/ui";
import Link from "next/link";
import { Upload, Wand } from "lucide-react";

export const ThemeActions = ({ theme, themeId }: any) => {
    const handleUpload = async (themeName: string) => {
        const response = await fetch("/api/themes/upload-theme/" + themeId, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                themeName,
            }),
        });

        const json = await response.json();
        console.log(json);
    };
    return (
        <div className="theme-actions">
            <Button
                buttonStyle="secondary"
                onClick={() => handleUpload(theme.name)}
            >
                <Upload size={16} /> Upload
            </Button>
            <Link
                href="https://builder.io/content?model=df5b38c2b5654e40992591f0a34434f0"
                target="_blank"
                style={{ textDecoration: "none" }}
            >
                <Button buttonStyle="secondary">
                    <Wand size={16} /> Customize
                </Button>
            </Link>
        </div>
    );
};
