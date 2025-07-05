import type {
    CollectionConfig,
    CollectionSlug,
    Payload,
    Config as PayloadConfig,
    PayloadRequest,
} from "payload";
import type Stripe from "stripe";
import { SecretAccess } from "./blocks/StripeBlock";

export type StripeWebhookHandler<T = any> = (args: {
    config: PayloadConfig;
    event: T;
    payload: Payload;
    pluginConfig?: StripePluginConfig;
    req: PayloadRequest;
    stripe: Stripe;
}) => Promise<void> | void;

export type StripeWebhookHandlers = {
    [webhookName: string]: StripeWebhookHandler;
};

export type FieldSyncConfig = {
    fieldPath: string;
    stripeProperty: string;
};

export type SyncConfig = {
    collection: CollectionSlug;
    fields: FieldSyncConfig[];
    stripeResourceType: "customers" | "products"; // TODO: get this from Stripe types
    stripeResourceTypeSingular: "customer" | "product"; // TODO: there must be a better way to do this
};

export type StripePluginConfig = {
    isTestKey?: boolean;
    logs?: boolean;
    /** @default false */
    rest?: boolean;
    stripeSecretKey: string;
    stripeWebhooksEndpointSecret?: string;
    sync?: SyncConfig[];
    webhooks?: StripeWebhookHandler | StripeWebhookHandlers;
    collectionOverrides?: {
        access: CollectionConfig["access"];
    };
    /**
     * The collection slug for the payments collection
     */
    paymentCollectionSlug?: string;
    secretAccess?: SecretAccess;
};

export type SanitizedStripePluginConfig = {
    sync: SyncConfig[]; // convert to required
} & StripePluginConfig;

export type StripeProxy = (args: {
    stripeArgs: any[];
    stripeMethod: string;
    stripeSecretKey: string;
}) => Promise<{
    data?: any;
    message?: string;
    status: number;
}>;
