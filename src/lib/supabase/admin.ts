import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseConfig } from "./config";

let supabaseAdminClient: SupabaseClient | null = null;

export function hasSupabaseAdminConfig() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function getSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  supabaseAdminClient ??= createClient(supabaseConfig.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
}
