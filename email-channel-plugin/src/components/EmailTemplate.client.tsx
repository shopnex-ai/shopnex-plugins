"use client";

import { LoadingOverlay, SetStepNav, toast, useTheme } from "@payloadcms/ui";
import { EmailEditorProps } from "@shopnex/editor-sample";
import { useEffect, useState } from "react";
import { PayloadSDK } from "@shopnex/payload-sdk";

type EmailTemplateProps = {
    html: string;
    json: EmailEditorProps["configuration"];
    serverURL: string;
    templateName: string;
    identifier: string;
};

export const EmailTemplate = ({
    html,
    json,
    serverURL,
    templateName,
    identifier,
}: EmailTemplateProps) => {
    const payloadSdk = new PayloadSDK({
        baseURL: `${serverURL}/api`,
    });
    const { theme } = useTheme();
    const [EmailEditorComp, setEmailEditorComp] =
        useState<React.ComponentType<any> | null>(null);
    useEffect(() => {
        import("@shopnex/editor-sample").then((mod) => {
            // @ts-ignore
            setEmailEditorComp(() => mod.default);
        });
    }, []);

    if (!EmailEditorComp) {
        return <LoadingOverlay />;
    }
    const handleSave = async (output: {
        html: string;
        json: EmailEditorProps["configuration"];
        name: string;
    }) => {
        setTimeout(() => {}, 100);
        toast.loading("Email template saving...", {
            cancel: false,
        });

        try {
            if (identifier === "create") {
                await payloadSdk.create({
                    collection: "email-templates",
                    data: {
                        name: output.name,
                        html: output.html,
                        json: output.json,
                    },
                });
            } else {
                await payloadSdk.update({
                    id: identifier,
                    collection: "email-templates",
                    data: {
                        name: output.name,
                        html: output.html,
                        json: output.json,
                    },
                });
            }
            toast.success("Email template saved successfully!", {
                cancel: false,
            });
        } catch (error) {
            toast.error("Failed to save email template. Please try again.");
        }
    };
    const handleChange: EmailEditorProps["onChange"] = ({ html, json }) => {};

    const navItems = [
        {
            label: "Email Templates",
            url: "/admin/collections/email-templates",
        },
        {
            label: templateName || "Create New",
            url: `/admin/collections/email-templates/${identifier}`,
        },
    ];

    return (
        <>
            <SetStepNav nav={navItems} />
            <EmailEditorComp
                configuration={json}
                onChange={handleChange}
                onSave={handleSave}
                theme={theme}
                templateName={templateName}
            />
        </>
    );
};
