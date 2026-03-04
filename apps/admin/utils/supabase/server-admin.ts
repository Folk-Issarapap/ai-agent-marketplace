import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  return { supabaseUrl, serviceRoleKey };
}

/**
 * Server-side admin client that never reads or writes user cookies.
 * Use this for admin/service operations (e.g. user management) to avoid
 * inflating request cookie/header size.
 */
export function createSupabaseAdminClientWithoutCookies() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Alias for consistency with larger apps where a cookie-based admin client may
 * also exist.
 */
export function createSupabaseServerAdminClient() {
  return createSupabaseAdminClientWithoutCookies();
}
