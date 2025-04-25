import type { PayloadRequest } from "payload"; // Use PayloadRequest type
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
}

// Updated handler signature
export const createOrder = async (req: PayloadRequest): Promise<Response> => {
    const { payload, routeParams, user } = req; // Destructure from req
    const paymentId = routeParams?.paymentId as string; // Access route params

    if (!paymentId) {
        return Response.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // Fetch Plugin Config (if needed, though usually available in closure scope)
    // This example assumes pluginConfig is available via closure or context
    // If not, you'll need a way to retrieve it (e.g., from payload.config)
    const paymentCollectionSlug = (
        payload.config.plugins?.find((p) => p.name === "paypal-plugin")
            ?.config as PayPalPluginConfig
    )?.paymentCollectionSlug; // Example retrieval
    if (!paymentCollectionSlug) {
        console.error(
            "PayPal Plugin Error: Could not retrieve paymentCollectionSlug from config in endpoint.",
        );
        return Response.json({ error: "Plugin configuration error" }, { status: 500 });
    }

    try {
        // 1. Fetch the Payment Document from Payload using req.payload
        const paymentDoc = (await payload.findByID({
            collection: paymentCollectionSlug,
            id: paymentId,
            // depth: 1, // Consider depth if provider block isn't populated
            user: user, // Use user from req for access control
        })) as unknown as PaymentDoc;

        if (!paymentDoc) {
            return Response.json({ error: "Payment document not found" }, { status: 404 });
        }

        // --- Basic validation ---
        if (!paymentDoc.amount || paymentDoc.amount <= 0) {
            return Response.json({ error: "Invalid payment amount." }, { status: 400 });
        }
        if (!paymentDoc.currency) {
            return Response.json({ error: "Payment currency is missing." }, { status: 400 });
        }
        if (paymentDoc.status !== "pending" && paymentDoc.status !== "created") {
            return Response.json(
                {
                    error: `Cannot create PayPal order for payment with status: ${paymentDoc.status}`,
                },
                { status: 400 },
            );
        }

        // 2. Find the PayPal Provider Block Data
        const paypalProviderData = paymentDoc.provider?.find(
            (block): block is PayPalBlockData => block.blockType === "paypal",
        );

        if (!paypalProviderData) {
            return Response.json(
                { error: "PayPal provider configuration not found for this payment" },
                { status: 400 },
            );
        }

        // 3. Get the Configured PayPal Client
        const paypalClient = getPayPalClient(paypalProviderData);

        // 4. Create PayPal Order Request
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: paymentDoc.currency,
                        value: paymentDoc.amount.toFixed(2),
                    },
                    description: `Payment for Order ID: ${paymentDoc.id}`,
                    invoice_id: paymentDoc.id, // CRITICAL for linking
                },
            ],
        });

        // 5. Execute the Request
        console.log(
            `Creating PayPal order for Payment ID: ${paymentId}, Amount: ${paymentDoc.amount} ${paymentDoc.currency}`,
        );
        const paypalOrder = await paypalClient.execute(request);

        // 6. Update Payment Document using req.payload
        await payload.update({
            collection: paymentCollectionSlug,
            id: paymentId,
            data: {
                paypalOrderId: paypalOrder.result.id,
                status: "processing",
            },
            user: user, // Pass user for access control context
        });

        // 7. Respond to Client using Response.json
        console.log(
            `PayPal Order ID ${paypalOrder.result.id} created successfully for Payment ID ${paymentId}.`,
        );
        return Response.json({ id: paypalOrder.result.id }, { status: 201 }); // Send { id: 'PAYPAL_ORDER_ID' }
    } catch (error: any) {
        console.error(`Error creating PayPal order for Payment ID ${paymentId}:`, error);
        const paypalDebugId = error?.data?.debug_id;
        const errorMessage = paypalDebugId
            ? `PayPal Error: ${error.message} (Debug ID: ${paypalDebugId})`
            : error.message || "Internal server error";

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
                `Failed to update payment status to 'failed' for Payment ID ${paymentId}:`,
                updateError,
            );
        }

        return Response.json(
            { error: errorMessage, details: error.data },
            { status: error.statusCode || 500 },
        );
    }
};
