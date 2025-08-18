import { toast } from "@payloadcms/ui";
import { SaveOutput, EmailTemplateData } from '../types/email-template.types';

export type SaveSuccessHandler = (data: EmailTemplateData) => void;
export type SaveErrorHandler = (error: Error) => void;

export class SaveEventManager {
    private onSaveSuccess?: SaveSuccessHandler;
    private onSaveError?: SaveErrorHandler;

    setSaveSuccessHandler(handler: SaveSuccessHandler): void {
        this.onSaveSuccess = handler;
    }

    setSaveErrorHandler(handler: SaveErrorHandler): void {
        this.onSaveError = handler;
    }

    async handleSaveSuccess(savedData: EmailTemplateData): Promise<void> {
        toast.success("Email template saved successfully!");
        this.onSaveSuccess?.(savedData);
    }

    async handleSaveError(error: Error): Promise<void> {
        console.error("Save failed:", error);
        toast.error("Failed to save email template. Please try again.");
        this.onSaveError?.(error);
    }

    validateSaveData(output: SaveOutput): boolean {
        if (!output.name?.trim()) {
            toast.error("Template name is required");
            return false;
        }

        if (!output.json) {
            toast.error("Template content is required");
            return false;
        }

        return true;
    }
}