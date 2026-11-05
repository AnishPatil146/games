import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { AUTHORIZED_ADMIN_EMAIL, getEnvConfig } from "./env";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "./services/admin-auth-service";

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
  role?: string;
  error?: string;
  statusCode?: 401 | 403 | 503;
}> {
  // 1. Primary check: Cryptographically signed local admin session cookie
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    if (adminSessionCookie) {
      const verified = verifyAdminSessionToken(adminSessionCookie);
      if (verified.valid && verified.email && isEmailAllowed(verified.email)) {
        return {
          authorized: true,
          email: verified.email,
          userId: "admin-root-001",
          role: verified.role || "SUPER_ADMIN",
        };
      }
    }
  } catch {
    // Proceed to fallback check if cookies() context is not available
  }

  // 2. Secondary check: Supabase Auth Session
  const { isSupabaseConfigured } = getEnvConfig();
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user && user.email) {
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
          role: "SUPER_ADMIN",
        };
      }
    } catch {
      // Supabase unavailable or invalid
    }
  }

  return {
    authorized: false,
    error: "Administrator authentication required.",
    statusCode: 401,
  };
}
