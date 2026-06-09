import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseConfig } from "@/lib/supabase/config";

let publicClient: SupabaseClient | null = null;

export function getPublicSupabaseClient() {
  if (!publicClient) {
    publicClient = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return publicClient;
}
