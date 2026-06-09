import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  supabase: SupabaseClient;
  email: string;
  role: "owner" | "manager";
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";

  if (error || !email) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("email,role,active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  return {
    supabase,
    email,
    role: admin.role,
  };
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
