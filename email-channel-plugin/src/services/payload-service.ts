import { PayloadSDK } from "@shopnex/payload-sdk";
import { EmailTemplateData } from '../types/email-template.types';
import { COLLECTION_SLUG, API_BASE_PATH } from '../utils/constants';

export class PayloadService {
    private sdk: PayloadSDK;

    constructor(serverURL: string) {
        this.sdk = new PayloadSDK({
            baseURL: `${serverURL}${API_BASE_PATH}`,
        });
    }

    async createTemplate(data: EmailTemplateData): Promise<EmailTemplateData> {
        const result = await this.sdk.create({
            collection: COLLECTION_SLUG,
            data
        });
        return result as unknown as EmailTemplateData;
    }

    async updateTemplate(id: string, data: EmailTemplateData): Promise<EmailTemplateData> {
        const result = await this.sdk.update({
            id,
            collection: COLLECTION_SLUG,
            data
        });
        return result as unknown as EmailTemplateData;
    }

    async saveTemplate(identifier: string, data: EmailTemplateData): Promise<EmailTemplateData> {
        if (identifier === "create") {
            return this.createTemplate(data);
        }
        return this.updateTemplate(identifier, data);
    }

    async getTemplate(id: string): Promise<EmailTemplateData> {
        const result = await this.sdk.findByID({
            collection: COLLECTION_SLUG,
            id
        });
        return result as unknown as EmailTemplateData;
    }

    async deleteTemplate(id: string): Promise<void> {
        await this.sdk.delete({
            collection: COLLECTION_SLUG,
            id
        });
    }
}