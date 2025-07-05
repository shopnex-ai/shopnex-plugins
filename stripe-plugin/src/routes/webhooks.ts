import type { Config as PayloadConfig, PayloadRequest } from "payload";

import Stripe from "stripe";

import type { StripePluginConfig } from "../types";
import { getTenantFromCookie } from "@shopnex/utils/helpers";

import { handleWebhooks } from "../webhooks/index";

export const stripeWebhooks = async (args: {
    config: PayloadConfig;
    pluginConfig: StripePluginConfig;
    req: PayloadRequest;
}): Promise<any> => {
    const { config, pluginConfig, req } = args;
    let returnStatus = 200;
    const shopId = getTenantFromCookie(req.headers);

    // Fetch a specific Payments document corresponding to the shopId
    const paymentsDocument = await req.payload.find({
        collection: "payments",
        where: {
            shopId: {
                equals: shopId,
            },
        },
    });

    const stripeBlock = paymentsDocument.docs[0]?.providers.find(
        (provider: any) => provider.blockType === "stripeProvider"
    );

    if (
        !stripeBlock ||
        !stripeBlock.secretKey ||
        !stripeBlock.webhooksEndpointSecret
    ) {
        req.payload.logger.error(
            `No Stripe settings found for shop: ${shopId}`
        );
        return Response.json(
            { error: "Invalid shop configuration" },
            { status: 400 }
        );
    }

    const { webhooks } = pluginConfig;
    const {
        secretKey: stripeSecretKey,
        webhooksEndpointSecret: stripeWebhooksEndpointSecret,
    } = stripeBlock;

    if (stripeWebhooksEndpointSecret) {
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2022-08-01",
            appInfo: {
                name: "Stripe Payload Plugin",
                url: "https://payloadcms.com",
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
                    stripeWebhooksEndpointSecret
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
                handleWebhooks({
                    config,
                    event,
                    payload: req.payload,
                    pluginConfig,
                    req,
                    stripe,
                });

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
