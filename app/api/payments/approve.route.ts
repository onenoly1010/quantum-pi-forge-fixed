// api/payments/approve.ts - Approve Pi Network payment
// POST /api/payments/approve

import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, memo, metadata } = body;

    if (!amount || !memo) {
      return Response.json(
        { error: "Missing required fields: amount, memo" },
        { status: 400 }
      );
    }

    // This would call your Pi Network API
    const piNetworkApiKey = process.env.PI_NETWORK_API_KEY;
    const piNetworkAppId = process.env.PI_NETWORK_APP_ID;
    const piNetworkEndpoint = process.env.PI_NETWORK_API_ENDPOINT || "https://api.minepi.com";

    if (!piNetworkApiKey || !piNetworkAppId) {
      return Response.json(
        { error: "Pi Network not configured" },
        { status: 500 }
      );
    }

    // Create payment approval on Pi Network
    const paymentResponse = await fetch(`${piNetworkEndpoint}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${piNetworkApiKey}`,
      },
      body: JSON.stringify({
        amount,
        memo,
        metadata: {
          app_id: piNetworkAppId,
          ...metadata,
        },
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return Response.json(paymentData, { status: paymentResponse.status });
    }

    return Response.json(
      {
        status: "approved",
        payment_id: paymentData.payment_id,
        amount,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Payment approval failed",
      },
      { status: 500 }
    );
  }
}
