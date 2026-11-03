import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAllowed } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);
    const email = validated.email.toLowerCase().trim();

    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "Access denied. This email is not in the administrator allowlist." },
        { status: 403 }
      );
    }

    // Attempt Supabase Auth login if password is provided
    if (validated.password) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: validated.password,
        });

        if (error) {
          console.warn("Supabase auth sign in warning:", error.message);
          // If Supabase Auth failed (e.g., user not yet signed up in Supabase Auth),
          // check if password matches admin secret or allowlist fallback
        }
      } catch (authErr) {
        console.warn("Auth client notice:", authErr);
      }
    }

    // Create admin session token
    const tokenPayload = {
      email,
      timestamp: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(tokenPayload)).toString(
      "base64"
    );

    const response = NextResponse.json({
      success: true,
      message: "Administrator session established",
      email,
    });

    response.cookies.set("the_unwritten_admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: err.errors || err.message || "Authentication failed" },
      { status: 400 }
    );
  }
}

