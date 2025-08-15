import { MESSAGE_TYPES } from '../utils/constants';
import { IframeMessageEvent, SaveOutput } from '../types/email-template.types';

export type TemplateEventHandler = (data: any) => void;
export type SaveEventHandler = (data: SaveOutput) => void;

export class TemplateEventProcessor {
    private onEditorReady?: TemplateEventHandler;
    private onSaveRequest?: SaveEventHandler;

    setEditorReadyHandler(handler: TemplateEventHandler): void {
        this.onEditorReady = handler;
    }

    setSaveRequestHandler(handler: SaveEventHandler): void {
        this.onSaveRequest = handler;
    }

    processMessage(event: IframeMessageEvent): void {
        const { type, payload } = event.data;

        switch (type) {
            case MESSAGE_TYPES.EDITOR_READY:
                console.log("Editor is ready, processing...");
                this.onEditorReady?.(payload);
                break;

            case MESSAGE_TYPES.EMAIL_TEMPLATE_SAVE:
                console.log("Processing save request:", payload);
                if (this.onSaveRequest && payload) {
                    this.onSaveRequest({
                        json: payload,
                        name: payload.subject || 'Untitled Template',
                        html: ''
                    });
                }
                break;

            default:
                console.log(`Unhandled message type: ${type}`);
        }
    }
}