import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAllowed } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEnvConfig } from "@/lib/env";

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

  const { isSupabaseConfigured } = getEnvConfig();
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase Auth is not configured in environment variables." },
      { status: 503 }
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

    // Server-side single-administrator allowlist enforcement
    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "Access denied. This identity is not authorized for Control access." },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          error:
            "Invalid administrator credentials. Ensure the authorized account is created in Supabase Auth.",
        },
        { status: 401 }
      );
    }

    if (!isEmailAllowed(data.user.email)) {
      await supabase.auth.signOut().catch(() => {});
      return NextResponse.json(
        { error: "Access denied. Account is not in ADMIN_EMAILS allowlist." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      email: data.user.email,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Authentication request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
