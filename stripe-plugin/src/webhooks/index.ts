import type { StripeWebhookHandler } from "../types";

export const handleWebhooks: StripeWebhookHandler = (args) => {
    const { event, payload, pluginConfig } = args;

    if (pluginConfig?.logs) {
        payload.logger.info(
            `🪝 Received Stripe '${event.type}' webhook event with ID: '${event.id}'.`
        );
    }

    // could also traverse into event.data.object.object to get the type, but that seems unreliable
};
