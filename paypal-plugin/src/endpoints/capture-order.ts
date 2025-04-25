import type { PayloadRequest } from "payload";
import * as paypal from "@paypal/checkout-server-sdk";
import { PayPalBlockData } from "../blocks/PayPalBlock";
import { getPayPalClient } from "../paypal-client";

interface PayPalPluginConfig {
    paymentCollectionSlug: string;
}

interface PaymentDoc {
    id: string;
    amount: number;
    currency: string;
    status: string;
    provider: PayPalBlockData[];
    paypalOrderId?: string;
}

// Updated handler signature
export const captureOrder = async (req: PayloadRequest): Promise<Response> => {
    const { payload, routeParams, user } = req;
    const paymentId = routeParams?.paymentId as string;

    // --- Get paypalOrderId from request body ---
    let paypalOrderId: string | undefined;
    try {
        const body = await req.json?.(); // Parse body explicitly
        paypalOrderId = body?.paypalOrderId;
    } catch (e) {
        console.error("Error parsing request body for capture:", e);
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    // --- End getting paypalOrderId ---

    if (!paymentId) {
        return Response.json({ error: "Payment ID is required" }, { status: 400 });
    }
    if (!paypalOrderId) {
        return Response.json(
            { error: "PayPal Order ID is required in request body" },
            { status: 400 },
        );
    }

    // Retrieve plugin config (example)
    // const paymentCollectionSlug = (
    //     payload.config.plugins?.find((p) => p.name === "paypal-plugin")
    //         ?.config as PayPalPluginConfig
    // )?.paymentCollectionSlug;
    const paymentCollectionSlug = "payments";
    if (!paymentCollectionSlug) {
        console.error(
            "PayPal Plugin Error: Could not retrieve paymentCollectionSlug from config in endpoint.",
        );
        return Response.json({ error: "Plugin configuration error" }, { status: 500 });
    }

    try {
        // 1. Fetch the Payment Document
        const paymentDoc = (await payload.findByID({
            collection: paymentCollectionSlug,
            id: paymentId,
            // depth: 1,
            user: user,
        })) as unknown as PaymentDoc;

        if (!paymentDoc) {
            return Response.json({ error: "Payment document not found" }, { status: 404 });
        }

        // --- Basic validation ---
        if (paymentDoc.status !== "processing") {
            return Response.json(
                {
                    error: `Cannot capture PayPal order for payment with status: ${paymentDoc.status}`,
                },
                { status: 400 },
            );
        }
        if (paymentDoc.paypalOrderId && paymentDoc.paypalOrderId !== paypalOrderId) {
            console.warn(
                `PayPal Capture Warning: Provided Order ID ${paypalOrderId} does not match stored ID ${paymentDoc.paypalOrderId} for Payment ${paymentId}`,
            );
        }

        // 2. Find PayPal Provider Data
        const paypalProviderData = paymentDoc.provider?.find(
            (block): block is PayPalBlockData => block.blockType === "paypal",
        );

        if (!paypalProviderData) {
            return Response.json(
                { error: "PayPal provider configuration not found for this payment" },
                { status: 400 },
            );
        }

        // 3. Get PayPal Client
        const paypalClient = getPayPalClient(paypalProviderData);

        // 4. Create Capture Request
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        // 5. Execute Capture Request
        console.log(
            `Attempting to capture PayPal Order ID: ${paypalOrderId} for Payment ID: ${paymentId}`,
        );
        const capture = await paypalClient.execute(request);
        console.log(`PayPal capture successful for Order ID: ${paypalOrderId}`);

        // 6. Process Capture Result & Update Payload Document
        const captureResult = capture.result;
        const captureStatus = captureResult.status;

        let paymentStatus = "failed";
        let transactionDetails = {};

        if (captureStatus === "COMPLETED") {
            paymentStatus = "completed";
            const captureData = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
            if (captureData) {
                transactionDetails = {
                    paypalCaptureId: captureData.id,
                    paypalCaptureStatus: captureData.status,
                    paypalPayerEmail: captureResult.payer?.email_address,
                    paypalPayerId: captureResult.payer?.payer_id,
                    captureTime: captureData.create_time,
                    amount: captureData.amount?.value,
                    currency: captureData.amount?.currency_code,
                };
            } else {
                transactionDetails = {
                    paypalCaptureStatus: "COMPLETED",
                    captureTime: new Date().toISOString(),
                };
            }
        } else if (captureStatus === "PENDING") {
            paymentStatus = "pending_capture";
            console.log(
                `PayPal capture is PENDING for Order ID: ${paypalOrderId}. Status will be updated via webhook.`,
            );
            transactionDetails = { paypalCaptureStatus: "PENDING" };
        } else {
            console.error(
                `PayPal capture failed for Order ID: ${paypalOrderId}. Status: ${captureStatus}`,
            );
            transactionDetails = { paypalCaptureStatus: captureStatus || "FAILED" };
        }

        await payload.update({
            collection: paymentCollectionSlug,
            id: paymentId,
            data: {
                status: paymentStatus,
                paypalTransactionDetails: transactionDetails,
            },
            user: user,
        });

        console.log(`Payment ID ${paymentId} status updated to '${paymentStatus}'.`);
        return Response.json(
            { status: captureStatus, paymentStatus, details: captureResult },
            { status: 200 },
        );
    } catch (error: any) {
        console.error(
            `Error capturing PayPal order ${paypalOrderId} for Payment ID ${paymentId}:`,
            error,
        );
        const paypalDebugId = error?.data?.debug_id;
        const errorMessage = paypalDebugId
            ? `PayPal Capture Error: ${error.message} (Debug ID: ${paypalDebugId})`
            : error.message || "Internal server error during capture";

        // Attempt to update payment status to failed
        try {
            await payload.update({
                collection: paymentCollectionSlug,
                id: paymentId,
                data: { status: "failed" },
                user: user,
            });
        } catch (updateError) {
            console.error(
                `Failed to update payment status to 'failed' after capture error for Payment ID ${paymentId}:`,
                updateError,
            );
        }

        return Response.json(
            { error: errorMessage, details: error.data },
            { status: error.statusCode || 500 },
        );
    }
};
