import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAllowed } from "@/lib/admin-auth";
import { createClient, createPrivilegedClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEnvConfig } from "@/lib/env";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getStoredAdminCredentials,
  verifyPassword,
} from "@/lib/services/admin-auth-service";

const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid administrator email address."),
  password: z.string().min(6, "Administrator password is required."),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "admin_login", 8, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid credentials format." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    // 1. Server-side single-administrator allowlist enforcement
    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "Access denied. This identity is not authorized for Control access." },
        { status: 403 }
      );
    }

    let authenticated = false;

    // 2. Primary check: Local established credentials with PBKDF2-SHA512
    const storedCreds = getStoredAdminCredentials();
    if (storedCreds && storedCreds.email === email) {
      if (
        verifyPassword(
          parsed.data.password,
          storedCreds.salt,
          storedCreds.hash,
          storedCreds.iterations
        )
      ) {
        authenticated = true;
      }
    }

    // 3. Secondary check: Supabase Auth (if local didn't authenticate or not yet seeded)
    const { isSupabaseConfigured, hasServiceRoleKey } = getEnvConfig();
    if (!authenticated && isSupabaseConfigured) {
      try {
        if (hasServiceRoleKey) {
          try {
            const privilegedSupabase = await createPrivilegedClient();
            const { data: usersData } = await privilegedSupabase.auth.admin.listUsers();
            const adminUser = usersData?.users?.find(
              (u) => u.email?.toLowerCase() === email
            );
            if (adminUser && !adminUser.email_confirmed_at) {
              await privilegedSupabase.auth.admin.updateUserById(adminUser.id, {
                email_confirm: true,
              });
            }
          } catch {
            // Service role auto-confirm attempt logged
          }
        }

        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: parsed.data.password,
        });

        if (!error && data?.user && isEmailAllowed(data.user.email)) {
          authenticated = true;
        }
      } catch {
        // Supabase sign in failed
      }
    }

    if (!authenticated) {
      return NextResponse.json(
        {
          error:
            "Invalid administrator credentials. If you need to establish or reset your password, use the secure administrator recovery protocol.",
        },
        { status: 401 }
      );
    }

    // 4. Issue cryptographically signed admin session cookie
    const token = createAdminSessionToken(email, "SUPER_ADMIN", 86400);
    const response = NextResponse.json({
      success: true,
      email,
      role: "SUPER_ADMIN",
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Authentication request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
