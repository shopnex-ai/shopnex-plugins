export interface EmailTemplateData {
    name: string;
    html: string;
    json: any;
}

export interface EmailTemplateProps {
    html: string;
    json: any;
    serverURL: string;
    templateName: string;
    identifier: string;
    iframeOrigin: string;
}

export interface SaveOutput {
    html: string;
    json: any;
    name: string;
}

export interface IframeMessageEvent {
    origin: string;
    data: {
        type: string;
        payload?: any;
    };
}

export type MessageType =
    | "NEW_EMAIL_TEMPLATE"
    | "CURRENT_EMAIL_TEMPLATE"
    | "EDITOR_READY"
    | "EMAIL_TEMPLATE_SAVE"
    | "TRIGGER_SAVE";

export interface MessagePayload {
    type: MessageType;
    payload?: any;
}
