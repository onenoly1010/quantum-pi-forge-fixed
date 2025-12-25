// api/supabase/status.ts - Supabase connection status
// GET /api/supabase/status

import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        {
          status: "error",
          message: "Supabase not configured",
          configured: {
            url: !!supabaseUrl,
            key: !!supabaseKey,
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by querying a simple table
    const { error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      return Response.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        status: "connected",
        database: "Supabase PostgreSQL",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Connection failed",
      },
      { status: 500 }
    );
  }
}
