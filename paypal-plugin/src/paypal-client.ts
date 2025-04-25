// src/plugins/paypal/paypalClient.ts
import * as paypal from "@paypal/checkout-server-sdk";
import { PayPalBlockData } from "./blocks/PayPalBlock";

/**
 * Creates a PayPal HTTP client configured with credentials
 * from a specific payment's provider block data.
 */
export const getPayPalClient = (providerData: PayPalBlockData) => {
    if (providerData.blockType !== "paypal") {
        throw new Error('Invalid provider data: blockType is not "paypal".');
    }

    const { paypalClientId, paypalClientSecret, paypalSandboxMode } = providerData;

    if (!paypalClientId || !paypalClientSecret) {
        throw new Error("PayPal Client ID or Client Secret missing in provider data.");
    }

    const environment = paypalSandboxMode
        ? new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret)
        : new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret);

    const client = new paypal.core.PayPalHttpClient(environment);

    return client;
};
