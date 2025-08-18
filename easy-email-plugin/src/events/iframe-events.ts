import { MESSAGE_TYPES } from "../utils/constants";
import { MessagePayload } from "../types/email-template.types";

export class IframeEventManager {
    private iframeRef: React.RefObject<HTMLIFrameElement | null>;
    private iframeOrigin: string;

    constructor(
        iframeRef: React.RefObject<HTMLIFrameElement | null>,
        iframeOrigin: string
    ) {
        this.iframeRef = iframeRef;
        this.iframeOrigin = iframeOrigin;
    }

    sendMessage(payload: MessagePayload): void {
        const iframeWindow = this.iframeRef.current?.contentWindow;
        if (iframeWindow) {
            console.log(`Sending ${payload.type} message:`, payload.payload);
            iframeWindow.postMessage(payload, this.iframeOrigin);
        }
    }

    sendNewTemplate(templateData: any): void {
        this.sendMessage({
            type: MESSAGE_TYPES.NEW_EMAIL_TEMPLATE,
            payload: templateData,
        });
    }

    sendCurrentTemplate(templateData: any): void {
        this.sendMessage({
            type: MESSAGE_TYPES.CURRENT_EMAIL_TEMPLATE,
            payload: templateData,
        });
    }

    triggerSave(): void {
        this.sendMessage({
            type: MESSAGE_TYPES.TRIGGER_SAVE,
        });
    }

    isValidOrigin(origin: string): boolean {
        return origin === this.iframeOrigin;
    }
}
