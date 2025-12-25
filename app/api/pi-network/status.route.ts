// api/pi-network/status.ts - Pi Network integration status
// GET /api/pi-network/status

import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const piNetworkMode = process.env.PI_NETWORK_MODE || "testnet";
    const piNetworkApiKey = process.env.PI_NETWORK_API_KEY ? "✓ SET" : "✗ MISSING";
    const piNetworkAppId = process.env.PI_NETWORK_APP_ID ? "✓ SET" : "✗ MISSING";

    return Response.json(
      {
        status: "operational",
        pi_network: {
          mode: piNetworkMode,
          api_key_configured: piNetworkApiKey,
          app_id_configured: piNetworkAppId,
          endpoint: process.env.PI_NETWORK_API_ENDPOINT || "https://api.minepi.com",
          webhook_configured: process.env.PI_NETWORK_WEBHOOK_SECRET ? "✓" : "✗",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
