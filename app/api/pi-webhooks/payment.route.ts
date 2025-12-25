// api/pi-webhooks/payment.ts - Pi Network webhook receiver
// POST /api/pi-webhooks/payment

import type { NextRequest } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const webhookSecret = process.env.PI_NETWORK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return Response.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return Response.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { event, data } = payload;

    // Log webhook event
    console.log(`[PI_WEBHOOK] ${event}:`, JSON.stringify(data));

    // Handle payment events
    switch (event) {
      case "payment.completed":
        // Update payment status in Supabase
        console.log(`Payment ${data.payment_id} completed`);
        break;

      case "payment.failed":
        // Mark payment as failed
        console.log(`Payment ${data.payment_id} failed`);
        break;

      case "payment.cancelled":
        // Mark payment as cancelled
        console.log(`Payment ${data.payment_id} cancelled`);
        break;

      default:
        console.log(`Unknown event: ${event}`);
    }

    return Response.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
