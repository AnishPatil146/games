import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

export function getAllowedAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || "";
  return envEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  const allowed = getAllowedAdminEmails();
  // If no emails are configured yet in environment, allow default admin for initial onboarding
  if (allowed.length === 0) return true;
  return allowed.includes(email.toLowerCase().trim());
}

export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  email?: string;
  error?: string;
}> {
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get("the_unwritten_admin_session");

  // Check 1: Dedicated secure admin token cookie
  if (adminSessionCookie?.value) {
    try {
      const decoded = JSON.parse(
        Buffer.from(adminSessionCookie.value, "base64").toString("utf-8")
      );
      if (decoded.email && isEmailAllowed(decoded.email)) {
        // Valid within 7 days
        if (Date.now() - decoded.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return { authorized: true, email: decoded.email };
        }
      }
    } catch {
      // invalid cookie format
    }
  }

  // Check 2: Supabase Auth Session
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { authorized: false, error: "Authentication required" };
    }

    if (!isEmailAllowed(user.email)) {
      return {
        authorized: false,
        error: `User ${user.email} is not authorized in ADMIN_EMAILS allowlist`,
      };
    }

    return { authorized: true, email: user.email };
  } catch (err: any) {
    return { authorized: false, error: err.message || "Admin authorization failed" };
  }
}

