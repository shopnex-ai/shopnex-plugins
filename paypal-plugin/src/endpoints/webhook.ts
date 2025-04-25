// src/plugins/paypal/endpoints/webhook.ts
import type { PayloadRequest } from "payload";
import { PayPalBlockData } from "../blocks/PayPalBlock";

interface PayPalPluginConfig {
    paymentCollectionSlug: string;
}

interface PaymentDocForWebhook {
    id: string;
    status: string;
    provider: PayPalBlockData[];
    paypalWebhookEvents?: any[];
}

// Updated handler signature
export const handleWebhook = async (req: PayloadRequest): Promise<Response> => {
    const { payload, headers } = req; // Destructure payload and headers

    let rawBody: string;
    let webhookEvent: any;

    try {
        // --- Read raw body first for verification ---
        // This consumes the body stream.
        rawBody = await req.text();
        // --- Then parse the JSON from the raw string ---
        webhookEvent = JSON.parse(rawBody);
    } catch (e) {
        console.error("PayPal Webhook Error: Could not read or parse request body.", e);
        // Use new Response for non-JSON body
        return new Response("Invalid request body.", { status: 400, headers });
    }

    // --- Get Headers for Verification ---
    const transmissionId = headers.get("paypal-transmission-id");
    const transmissionTime = headers.get("paypal-transmission-time");
    const certUrl = headers.get("paypal-cert-url");
    const authAlgo = headers.get("paypal-auth-algo");
    const transmissionSig = headers.get("paypal-transmission-sig");

    if (
        !transmissionId ||
        !transmissionTime ||
        !certUrl ||
        !authAlgo ||
        !transmissionSig ||
        !webhookEvent
    ) {
        console.error("PayPal Webhook Error: Missing required verification headers or body.");
        return new Response("Missing headers or body for webhook verification.", {
            status: 400,
        });
    }

    // --- Extract relevant info from webhook event ---
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;
    let paymentId: string | undefined;

    if (resource?.invoice_id) {
        paymentId = resource.invoice_id;
    } else if (resource?.purchase_units?.[0]?.invoice_id) {
        paymentId = resource.purchase_units[0].invoice_id;
    }

    if (!paymentId) {
        console.warn(
            `PayPal Webhook Warning: Could not extract Payment ID (invoice_id/custom_id) from webhook resource for event type ${eventType}. Event summary: ${webhookEvent.summary}`,
        );
        return new Response("Webhook received but Payment ID not found in resource.", {
            status: 200,
        });
    }

    console.log(
        `PayPal Webhook Received: Event Type: ${eventType}, Payment ID (from resource): ${paymentId}`,
    );

    // Retrieve plugin config (example)
    const paymentCollectionSlug = (
        payload.config.plugins?.find((p) => p.name === "paypal-plugin")
            ?.config as PayPalPluginConfig
    )?.paymentCollectionSlug;
    if (!paymentCollectionSlug) {
        console.error(
            "PayPal Plugin Error: Could not retrieve paymentCollectionSlug from config in webhook.",
        );
        return new Response("Plugin configuration error.", { status: 500, headers });
    }

    try {
        // --- Fetch the Payment Document associated with the webhook ---
        const paymentDocResult = await payload.find({
            collection: paymentCollectionSlug,
            where: { id: { equals: paymentId } },
            limit: 1,
            // depth: 1, // Ensure provider block is populated
            overrideAccess: true, // Use admin access for webhook processing
        });

        const paymentDoc = paymentDocResult.docs[0] as unknown as PaymentDocForWebhook | undefined;

        if (!paymentDoc) {
            console.error(
                `PayPal Webhook Error: Payment document not found for Payment ID: ${paymentId}. Event Type: ${eventType}`,
            );
            return new Response("Webhook received but corresponding payment document not found.", {
                status: 200,
                headers,
            });
        }

        // --- Get PayPal config specific to THIS payment ---
        const paypalProviderData = paymentDoc.provider?.find(
            (block): block is PayPalBlockData => block.blockType === "paypal",
        );

        if (!paypalProviderData || !paypalProviderData.paypalAuthWebhookId) {
            console.error(
                `PayPal Webhook Error: PayPal provider config or Auth Webhook ID missing for Payment ID: ${paymentId}. Event Type: ${eventType}`,
            );
            return new Response("Webhook processing error: Missing provider configuration.", {
                status: 500,
                headers,
            });
        }

        const { paypalAuthWebhookId } = paypalProviderData;
        const paypalClient = getPayPalClient(paypalProviderData);

        // --- Verify Webhook Signature ---
        // ** Placeholder - Implement real verification using rawBody, headers, paypalAuthWebhookId **
        console.log(
            `PayPal Webhook: Verification needed for Payment ID ${paymentId}. Configured Webhook ID: ${paypalAuthWebhookId}.`,
        );
        const isVerified = true; // **PLACEHOLDER - REPLACE WITH ACTUAL VERIFICATION**

        if (!isVerified) {
            console.error(
                `PayPal Webhook Error: Signature verification failed for Payment ID: ${paymentId}. Event Type: ${eventType}`,
            );
            return new Response("Webhook signature verification failed.", {
                status: 403,
                headers,
            });
        }

        console.log(
            `PayPal Webhook: Signature VERIFIED for Payment ID ${paymentId}. Processing event: ${eventType}`,
        );

        // --- Process Verified Event ---
        let updateData: Partial<PaymentDocForWebhook> & { paypalWebhookEvents?: any[] } = {};
        let statusChanged = false;

        // (Switch statement for event types remains the same as before)
        switch (eventType) {
            case "CHECKOUT.ORDER.APPROVED":
                if (paymentDoc.status === "processing" || paymentDoc.status === "pending") {
                    console.log(`Webhook: CHECKOUT.ORDER.APPROVED for Payment ${paymentId}.`);
                }
                break;
            case "PAYMENT.CAPTURE.COMPLETED":
                if (paymentDoc.status !== "completed") {
                    console.log(
                        `Webhook: PAYMENT.CAPTURE.COMPLETED for Payment ${paymentId}. Updating status.`,
                    );
                    updateData.status = "completed";
                    statusChanged = true;
                }
                break;
            case "PAYMENT.CAPTURE.DENIED":
                if (paymentDoc.status !== "failed") {
                    console.log(
                        `Webhook: PAYMENT.CAPTURE.DENIED for Payment ${paymentId}. Updating status.`,
                    );
                    updateData.status = "failed";
                    statusChanged = true;
                }
                break;
            case "PAYMENT.CAPTURE.PENDING":
                if (paymentDoc.status !== "pending_capture" && paymentDoc.status !== "completed") {
                    console.log(
                        `Webhook: PAYMENT.CAPTURE.PENDING for Payment ${paymentId}. Updating status.`,
                    );
                    updateData.status = "pending_capture";
                    statusChanged = true;
                }
                break;
            case "PAYMENT.CAPTURE.REFUNDED":
                console.log(
                    `Webhook: PAYMENT.CAPTURE.REFUNDED for Payment ${paymentId}. Updating status.`,
                );
                updateData.status = "refunded";
                statusChanged = true;
                break;
            default:
                console.log(
                    `Webhook: Received unhandled event type: ${eventType} for Payment ${paymentId}`,
                );
                break;
        }

        if (statusChanged || Object.keys(updateData).length > 0) {
            // Log webhook event
            updateData.paypalWebhookEvents = [
                ...(paymentDoc.paypalWebhookEvents || []),
                { eventType, timestamp: new Date().toISOString(), resourceId: resource?.id },
            ];

            console.log(`Webhook: Updating Payment ${paymentId} with data:`, updateData);
            await payload.update({
                collection: paymentCollectionSlug,
                id: paymentId,
                data: updateData,
                overrideAccess: true,
            });
        }

        // --- Respond 200 OK to PayPal ---
        return new Response("Webhook received and processed.", {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error(
            `PayPal Webhook Error: Failed to process webhook for Payment ID ${paymentId || "Unknown"}. Event Type: ${eventType || "Unknown"}. Error:`,
            error,
        );
        return new Response("Webhook processing error.", { status: 500, headers });
    }
};
