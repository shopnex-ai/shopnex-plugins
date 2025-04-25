import type { CollectionConfig, Payload, PayloadRequest } from "payload";

export type PayPalPluginConfig = {
    isTestMode?: boolean;
    logs?: boolean;
    /** @default false */
    rest?: boolean;
    clientId: string;
    clientSecret: string;
    webhooks?: PayPalWebhookHandler | PayPalWebhookHandlers;
    collectionOverrides?: {
        access: CollectionConfig["access"];
    };
    /**
     * The collection slug for the payments collection
     */
    paymentCollectionSlug?: string;
};

export type SanitizedPayPalPluginConfig = PayPalPluginConfig;

export type PayPalWebhookHandler<T = any> = (args: {
    config: PayloadConfig;
    event: T;
    payload: Payload;
    pluginConfig?: PayPalPluginConfig;
    req: PayloadRequest;
}) => Promise<void> | void;

export type PayPalWebhookHandlers = {
    [webhookName: string]: PayPalWebhookHandler;
};

export type PayPalProxy = (args: {
    paypalArgs: any[];
    paypalMethod: string;
    clientId: string;
    clientSecret: string;
}) => Promise<{
    data?: any;
    message?: string;
    status: number;
}>;

export interface PaypalOptions {
    /**
     * Indicate if it should run as sandbox, default false
     */
    sandbox?: boolean;
    clientId: string;
    clientSecret: string;
    authWebhookId: string;
    capture?: boolean;

    /**
     * Backward compatibility options below
     */

    /**
     * @deprecated use clientId instead
     */
    client_id: string;
    /**
     * @deprecated use clientSecret instead
     */
    client_secret: string;
    /**
     * @deprecated use authWebhookId instead
     */
    auth_webhook_id: string;
}

export type PaypalOrder = {
    status: keyof typeof PaypalOrderStatus;
    invoice_id: string;
};

export type PurchaseUnits = {
    payments: {
        captures: { id: string }[];
        authorizations: { id: string }[];
    };
    amount: {
        currency_code: string;
        value: string;
    };
}[];

export const PaypalOrderStatus = {
    CREATED: "CREATED",
    COMPLETED: "COMPLETED",
    SAVED: "SAVED",
    APPROVED: "APPROVED",
    PAYER_ACTION_REQUIRED: "PAYER_ACTION_REQUIRED",
    VOIDED: "VOIDED",
};
