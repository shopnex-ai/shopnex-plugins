import React from "react";

interface EmailTemplateIframeProps {
    iframeOrigin: string;
}

export const EmailTemplateIframe: React.FC<EmailTemplateIframeProps> = ({
    iframeOrigin,
}) => {
    return <iframe src={iframeOrigin} className="email-template-iframe" />;
};
