export const supabaseConfig = {
  url:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    "https://xuhwuwdsamnisvxezobh.supabase.co",
  publishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_-G9JTK2ef--s_X0UE-ipSg_BAQeJ_PT",
};

export function hasSupabaseConfig() {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}
