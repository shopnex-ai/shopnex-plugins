"use client";

import { SetStepNav } from "@payloadcms/ui";
import "./EmailTemplate.scss";
import React, { useLayoutEffect } from "react";
import { emptyTemplate } from "./templates/empty-template";
import { useIframeMessaging } from "../hooks/useIframeMessaging";
import { useTemplateSave } from "../hooks/useTemplateSave";
import { EmailTemplateHeader } from "./ui/EmailTemplateHeader";
import { EmailTemplateIframe } from "./ui/EmailTemplateIframe";
import { createNavigationItems, isCreateMode } from "../utils/message-handlers";
import { EmailTemplateProps } from "../types/email-template.types";

export const EmailTemplate = ({
    html,
    json,
    serverURL,
    templateName,
    identifier,
    iframeOrigin,
}: EmailTemplateProps) => {
    const {
        iframeRef,
        iframeLoaded,
        handleIframeLoad,
        sendTemplateData,
        triggerSave,
        setEditorReadyHandler,
        setSaveRequestHandler,
    } = useIframeMessaging(iframeOrigin);

    const { handleSave } = useTemplateSave(serverURL, identifier);

    useLayoutEffect(() => {
        setEditorReadyHandler(() => {
            setTimeout(() => {
                sendTemplateData(json, isCreateMode(identifier));
            }, 100);
        });

        setSaveRequestHandler(handleSave);
    }, [
        json,
        identifier,
        sendTemplateData,
        handleSave,
        setEditorReadyHandler,
        setSaveRequestHandler,
    ]);

    const navItems = createNavigationItems(templateName, identifier);

    return (
        <div className="email-template">
            <SetStepNav nav={navItems} />
            <EmailTemplateHeader
                templateName={templateName}
                onSave={triggerSave}
            />
            <EmailTemplateIframe
                iframeOrigin={iframeOrigin}
                iframeRef={iframeRef}
                onLoad={handleIframeLoad}
            />
        </div>
    );
};
