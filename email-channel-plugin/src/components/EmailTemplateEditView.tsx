import React from "react";
import { EmailTemplate } from "./EmailTemplate.client";

const EMPTY_EMAIL_MESSAGE = {
    root: {
        type: "EmailLayout",
        data: {
            backdropColor: "#F5F5F5",
            canvasColor: "#FFFFFF",
            textColor: "#262626",
            fontFamily: "MODERN_SANS",
            childrenIds: [],
        },
    },
};

export const EmailTemplateEditView = ({
    doc,
    payload,
    routeSegments,
    ...rest
}: any) => {
    const identifier = routeSegments?.at(-1);
    return (
        <>
            <EmailTemplate
                html={doc?.html || ""}
                json={doc?.json || EMPTY_EMAIL_MESSAGE}
                serverURL={payload.config.serverURL}
                templateName={doc?.name || ""}
                identifier={identifier}
            />
        </>
    );
};
