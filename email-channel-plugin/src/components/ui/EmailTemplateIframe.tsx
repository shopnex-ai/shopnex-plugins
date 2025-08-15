import React from "react";

interface EmailTemplateIframeProps {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    onLoad: () => void;
    iframeOrigin: string;
}

export const EmailTemplateIframe: React.FC<EmailTemplateIframeProps> = ({
    iframeRef,
    onLoad,
    iframeOrigin,
}) => {
    return (
        <iframe
            ref={iframeRef}
            src={iframeOrigin}
            className="email-template-iframe"
            onLoad={onLoad}
            onLoadedData={onLoad}
            onLoadedDataCapture={onLoad}
        />
    );
};
