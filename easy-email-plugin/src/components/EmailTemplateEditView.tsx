import React, { Suspense } from "react";
import { EmailTemplate } from "./EmailTemplate.client";
import { emptyTemplate } from "./templates/empty-template";

export const EmailTemplateEditView = ({
    doc,
    payload,
    routeSegments,
    user,
    ...rest
}: any) => {
    const identifier = routeSegments?.at(-1);
    const token = payload.encrypt(JSON.stringify(user));

    // Use existing template data for edit mode, empty template for create mode
    const templateJson =
        identifier === "create" ? emptyTemplate : doc?.json || emptyTemplate;

    return (
        <EmailTemplate
            html={doc?.html || ""}
            json={templateJson}
            serverURL={payload.config.serverURL}
            templateName={doc?.name || ""}
            identifier={identifier}
            token={token}
            iframeOrigin={
                process.env.EASY_EMAIL_IFRAME_ORIGIN || "http://localhost:3040"
            }
        />
    );
};
