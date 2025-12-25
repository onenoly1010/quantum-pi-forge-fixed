// api/payments/complete.ts - Complete Pi Network payment
// POST /api/payments/complete

import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id, txid } = body;

    if (!payment_id || !txid) {
      return Response.json(
        { error: "Missing required fields: payment_id, txid" },
        { status: 400 }
      );
    }

    const piNetworkApiKey = process.env.PI_NETWORK_API_KEY;
    const piNetworkEndpoint = process.env.PI_NETWORK_API_ENDPOINT || "https://api.minepi.com";

    if (!piNetworkApiKey) {
      return Response.json(
        { error: "Pi Network not configured" },
        { status: 500 }
      );
    }

    // Complete payment on Pi Network
    const completeResponse = await fetch(
      `${piNetworkEndpoint}/payments/${payment_id}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${piNetworkApiKey}`,
        },
        body: JSON.stringify({ txid }),
      }
    );

    const completeData = await completeResponse.json();

    if (!completeResponse.ok) {
      return Response.json(completeData, { status: completeResponse.status });
    }

    return Response.json(
      {
        status: "completed",
        payment_id,
        txid,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Payment completion failed",
      },
      { status: 500 }
    );
  }
}
