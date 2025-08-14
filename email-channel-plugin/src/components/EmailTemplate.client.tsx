"use client";

import {
    LoadingOverlay,
    RenderTitle,
    SetStepNav,
    toast,
    useTheme,
    Button,
} from "@payloadcms/ui";
import { PayloadSDK } from "@shopnex/payload-sdk";
import "./EmailTemplate.scss";
import React, { useCallback, useLayoutEffect } from "react";
import { emptyTemplate } from "./empty-template";

type EmailTemplateProps = {
    html: string;
    json: any;
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
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const iframeOrigin = "http://localhost:3040";
    const [iframeLoaded, setIframeLoaded] = React.useState(false);

    const sendDataToIframe = () => {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (iframeWindow) {
            if (identifier === "create") {
                console.log("Sending NEW_EMAIL_TEMPLATE data:", json);
                iframeWindow.postMessage(
                    {
                        type: "NEW_EMAIL_TEMPLATE",
                        payload: json,
                    },
                    iframeOrigin
                );
            } else {
                console.log("Sending CURRENT_EMAIL_TEMPLATE data:", json);
                iframeWindow.postMessage(
                    {
                        type: "CURRENT_EMAIL_TEMPLATE",
                        payload: json,
                    },
                    iframeOrigin
                );
            }
        }
    };

    const handleIframeLoad = () => {
        debugger;
        console.log("Iframe loaded successfully");
        setIframeLoaded(true);
    };

    const triggerIframeSave = () => {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (iframeWindow) {
            console.log("Triggering iframe save");
            iframeWindow.postMessage(
                {
                    type: "TRIGGER_SAVE",
                },
                iframeOrigin
            );
        }
    };

    // Remove automatic data sending - wait for EDITOR_READY message instead
    useLayoutEffect(() => {
        console.log(
            "Effect triggered - iframeLoaded:",
            iframeLoaded,
            "json:",
            json,
            "identifier:",
            identifier
        );
        // Data will be sent when EDITOR_READY message is received
    }, [json, iframeLoaded]);

    const handleSave = async (output: {
        html: string;
        json: any;
        name: string;
    }) => {
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
                toast.success("Email template saved successfully!");
                return;
            }
            await payloadSdk.update({
                id: identifier,
                collection: "email-templates",
                data: {
                    name: output.name,
                    html: output.html,
                    json: output.json,
                },
            });

            toast.success("Email template saved successfully!", {
                cancel: false,
            });
        } catch (error) {
            toast.error("Failed to save email template. Please try again.");
        }
    };

    const receiveDataFromIframe = useCallback(
        (event: MessageEvent) => {
            const expectedOrigin = "http://localhost:3040"; // Replace with your iframe origin

            if (event.origin !== expectedOrigin) {
                return; // Ignore the message if the origin does not match
            }

            if (event.data.type === "EDITOR_READY") {
                console.log("Editor is ready, sending template data");
                // Editor is ready, send template data
                setTimeout(() => {
                    sendDataToIframe();
                }, 100);
                return;
            }

            if (event.data.type === "EMAIL_TEMPLATE_SAVE") {
                // Process the payload as needed
                const emailTemplateData = event.data.payload;

                // Example: Pass data to a save handler
                handleSave({
                    json: emailTemplateData,
                    name: emailTemplateData.subject,
                    html: "",
                });
            }
        },
        [handleSave, sendDataToIframe]
    );

    useLayoutEffect(() => {
        window.addEventListener("message", receiveDataFromIframe);

        return () => {
            window.removeEventListener("message", receiveDataFromIframe);
        };
    }, [receiveDataFromIframe]);

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
        <div className="email-template">
            <SetStepNav nav={navItems} />
            <div className="header">
                <RenderTitle title={templateName || "Create New"} />
                <Button onClick={triggerIframeSave}>Save</Button>
            </div>
            <iframe
                ref={iframeRef}
                src={iframeOrigin}
                className="email-template-iframe"
                onLoad={handleIframeLoad}
                onLoadedData={handleIframeLoad}
                onLoadedDataCapture={handleIframeLoad}
            ></iframe>
        </div>
    );
};
