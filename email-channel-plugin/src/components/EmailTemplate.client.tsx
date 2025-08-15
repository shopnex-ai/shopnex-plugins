"use client";

import { SetStepNav } from "@payloadcms/ui";
import "./EmailTemplate.scss";
import React from "react";
import { EmailTemplateIframe } from "./ui/EmailTemplateIframe";
import { createNavigationItems, isCreateMode } from "../utils/message-handlers";
import { EmailTemplateProps } from "../types/email-template.types";

export const EmailTemplate = ({
    identifier,
    iframeOrigin,
    token,
    templateName,
}: EmailTemplateProps) => {
    const navItems = createNavigationItems(templateName, identifier);

    return (
        <div className="email-template">
            <SetStepNav nav={navItems} />
            <EmailTemplateIframe
                iframeOrigin={`${iframeOrigin}?id=${identifier}&templateName=${templateName}&token=${token}`}
            />
        </div>
    );
};
