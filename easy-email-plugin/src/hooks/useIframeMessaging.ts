import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { IframeEventManager } from "../events/iframe-events";
import { TemplateEventProcessor } from "../events/template-events";
import { IframeMessageEvent } from "../types/email-template.types";

export const useIframeMessaging = (iframeOrigin: string) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const eventManager = useRef(
        new IframeEventManager(iframeRef, iframeOrigin)
    );
    const eventProcessor = useRef(new TemplateEventProcessor());

    const handleIframeLoad = useCallback(() => {
        console.log("Iframe loaded successfully");
        setIframeLoaded(true);
    }, []);

    const sendTemplateData = useCallback(
        (templateData: any, isCreate: boolean) => {
            if (isCreate) {
                eventManager.current.sendNewTemplate(templateData);
            } else {
                eventManager.current.sendCurrentTemplate(templateData);
            }
        },
        []
    );

    const triggerSave = useCallback(() => {
        eventManager.current.triggerSave();
    }, []);

    const receiveMessage = useCallback((event: MessageEvent) => {
        if (!eventManager.current.isValidOrigin(event.origin)) {
            return;
        }

        eventProcessor.current.processMessage(event as IframeMessageEvent);
    }, []);

    const setEditorReadyHandler = useCallback(
        (handler: (data: any) => void) => {
            eventProcessor.current.setEditorReadyHandler(handler);
        },
        []
    );

    const setSaveRequestHandler = useCallback(
        (handler: (data: any) => void) => {
            eventProcessor.current.setSaveRequestHandler(handler);
        },
        []
    );

    useLayoutEffect(() => {
        window.addEventListener("message", receiveMessage);
        return () => {
            window.removeEventListener("message", receiveMessage);
        };
    }, [receiveMessage]);

    return {
        iframeRef,
        iframeLoaded,
        handleIframeLoad,
        sendTemplateData,
        triggerSave,
        setEditorReadyHandler,
        setSaveRequestHandler,
    };
};
