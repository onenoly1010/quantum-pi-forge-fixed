// lib/supabase-client.ts - Supabase client for API routes

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client for API routes
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to check database connection
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabaseServer
      .from("users")
      .select("count")
      .limit(1);

    return { connected: !error, error: error?.message };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function for user operations
export async function getUserById(userId: string) {
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

// Helper function for deployment logging
export async function logDeployment(
  deploymentId: string,
  status: string,
  metadata: Record<string, unknown>
) {
  const { data, error } = await supabaseServer
    .from("deployments")
    .insert({
      id: deploymentId,
      status,
      metadata,
      created_at: new Date().toISOString(),
    });

  return { data, error };
}
