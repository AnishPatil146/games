import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) {
    // If running in development without credentials configured yet,
    // return a dummy client or log warning
    console.warn("Supabase credentials not configured in environment variables.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

