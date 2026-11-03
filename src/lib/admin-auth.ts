import { createClient } from "./supabase/server";
import { AUTHORIZED_ADMIN_EMAIL, getEnvConfig } from "./env";

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (normalized !== AUTHORIZED_ADMIN_EMAIL) {
    return false;
  }
  const { allowedAdminEmails } = getEnvConfig();
  return allowedAdminEmails.includes(normalized);
}

export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  email?: string;
  userId?: string;
  error?: string;
  statusCode?: 401 | 403 | 503;
}> {
  const { isSupabaseConfigured } = getEnvConfig();
  if (!isSupabaseConfigured) {
    return {
      authorized: false,
      error: "Supabase authentication environment is not configured.",
      statusCode: 503,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return {
        authorized: false,
        error: "Administrator authentication required.",
        statusCode: 401,
      };
    }

    if (!isEmailAllowed(user.email)) {
      await supabase.auth.signOut().catch(() => {});
      return {
        authorized: false,
        error: "Access denied. This account is not an authorized administrator.",
        statusCode: 403,
      };
    }

    return {
      authorized: true,
      email: user.email.toLowerCase(),
      userId: user.id,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Administrator verification failed.";
    return {
      authorized: false,
      error: message,
      statusCode: 401,
    };
  }
}
