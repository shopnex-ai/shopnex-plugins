import type {
    PaginatedDocs,
    Config as PayloadConfig,
    PayloadRequest,
} from "payload";

import Stripe from "stripe";

import type { StripePluginConfig } from "../types";
import { getTenantFromCookie } from "@shopnex/utils/helpers";
import { getStripeBlock } from "../utilities/get-stripe-block";

export const stripeWebhooks = async (args: {
    config: PayloadConfig;
    pluginConfig: StripePluginConfig;
    req: PayloadRequest;
}): Promise<any> => {
    const { config, pluginConfig, req } = args;
    let returnStatus = 200;
    const shopId = getTenantFromCookie(req.headers);

    if (!shopId) {
        return Response.json(
            { error: "Invalid shop configuration" },
            { status: 400 }
        );
    }
    const stripeBlock = await getStripeBlock({ req, shopId });

    if (!stripeBlock) {
        req.payload.logger.error(
            `No Stripe settings found for shop: ${shopId}`
        );
        return Response.json(
            { error: "Invalid shop configuration" },
            { status: 400 }
        );
    }

    const { webhooks } = pluginConfig;
    const { stripeSecretKey, stripeWebhooksEndpointSecret } = stripeBlock;

    if (stripeWebhooksEndpointSecret) {
        const stripe = new Stripe(stripeSecretKey as string, {
            apiVersion: "2022-08-01",
            appInfo: {
                name: "ShopNex Stripe Plugin",
                url: "https://shopnex.ai",
            },
        });

        const body = await req.text?.();
        const stripeSignature = req.headers.get("stripe-signature");

        if (stripeSignature) {
            let event: Stripe.Event | undefined;

            try {
                event = stripe.webhooks.constructEvent(
                    body!,
                    stripeSignature,
                    stripeWebhooksEndpointSecret as string
                );
            } catch (err: unknown) {
                const msg: string =
                    err instanceof Error ? err.message : JSON.stringify(err);
                req.payload.logger.error(
                    `Error constructing Stripe event: ${msg}`
                );
                returnStatus = 400;
            }

            if (event) {
                // Fire external webhook handlers if they exist
                if (typeof webhooks === "function") {
                    webhooks({
                        config,
                        event,
                        payload: req.payload,
                        pluginConfig,
                        req,
                        stripe,
                    });
                }

                if (typeof webhooks === "object") {
                    const webhookEventHandler = webhooks[event.type];
                    if (typeof webhookEventHandler === "function") {
                        webhookEventHandler({
                            config,
                            event,
                            payload: req.payload,
                            pluginConfig,
                            req,
                            stripe,
                        });
                    }
                }
            }
        }
    }

    return Response.json(
        { received: true },
        {
            status: returnStatus,
        }
    );
};
