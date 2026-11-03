import { createClient } from "@supabase/supabase-js";

let adminClient = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    ""
  ).trim();

  if (!url || !serviceKey) {
    return null;
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}
