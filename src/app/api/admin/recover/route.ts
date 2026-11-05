import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAllowed } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createPrivilegedClient } from "@/lib/supabase/server";
import { getEnvConfig } from "@/lib/env";
import {
  ADMIN_SESSION_COOKIE_NAME,
  consumeAdminRecoveryToken,
  createAdminSessionToken,
  setAdminCredentials,
  validateAdminRecoverySecret,
} from "@/lib/services/admin-auth-service";

const RecoverSchema = z.object({
  email: z.string().trim().email(),
  recoverySecret: z.string().min(8, "Valid recovery token or master key is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "admin_recover", 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many recovery attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = RecoverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid recovery request format." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "Access denied. Identity is not authorized for administrator recovery." },
        { status: 403 }
      );
    }

    // Verify recovery secret: either master recovery key or single-use token
    const isMasterSecret = validateAdminRecoverySecret(parsed.data.recoverySecret);
    const isOneTimeToken = !isMasterSecret && consumeAdminRecoveryToken(parsed.data.recoverySecret);

    if (!isMasterSecret && !isOneTimeToken) {
      return NextResponse.json(
        { error: "Invalid master recovery key or expired single-use token." },
        { status: 401 }
      );
    }

    // 1. Establish local/bundled PBKDF2 credentials
    const setRes = setAdminCredentials(parsed.data.newPassword);
    if (!setRes.success) {
      return NextResponse.json({ error: setRes.error }, { status: 500 });
    }

    // 2. Synchronize with Supabase Auth if service role is available
    const { hasServiceRoleKey } = getEnvConfig();
    if (hasServiceRoleKey) {
      try {
        const privilegedSupabase = await createPrivilegedClient();
        const { data: usersData } = await privilegedSupabase.auth.admin.listUsers();
        const adminUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email
        );

        if (adminUser) {
          await privilegedSupabase.auth.admin.updateUserById(adminUser.id, {
            password: parsed.data.newPassword,
            email_confirm: true,
          });
        } else {
          await privilegedSupabase.auth.admin.createUser({
            email,
            password: parsed.data.newPassword,
            email_confirm: true,
          });
        }
      } catch {
        // Supabase service sync logged but non-blocking
      }
    }

    // 3. Issue cryptographically signed admin session cookie for immediate access
    const token = createAdminSessionToken(email, "SUPER_ADMIN", 86400);
    const response = NextResponse.json({
      success: true,
      email,
      role: "SUPER_ADMIN",
      message: "Administrator password has been securely established. Access granted.",
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
    const message = err instanceof Error ? err.message : "Recovery failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

