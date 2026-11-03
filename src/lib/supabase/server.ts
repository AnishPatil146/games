import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnvConfig } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublicKey } = getEnvConfig();

  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; safe to ignore when middleware/route handlers refresh cookies.
        }
      },
    },
  });
}

/**
 * Server-only privileged Supabase client.
 * - Uses SUPABASE_SERVICE_ROLE_KEY when configured (bypasses RLS strictly on server).
 * - Otherwise returns the SSR client carrying the verified administrator JWT
 *   (or anon role restricted solely to token-scoped SECURITY DEFINER RPCs).
 */
export async function createPrivilegedClient() {
  const { supabaseUrl, supabaseServiceRoleKey, hasServiceRoleKey } = getEnvConfig();

  if (hasServiceRoleKey && supabaseUrl) {
    return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient();
}
