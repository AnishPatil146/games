import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAllowed } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  consumeAdminRecoveryToken,
  setAdminCredentials,
} from "@/lib/services/admin-auth-service";

const RecoverSchema = z.object({
  email: z.string().trim().email(),
  recoverySecret: z.string().min(12, "Valid recovery token is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "admin_recover", 5, 60_000);
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

    const tokenValid = consumeAdminRecoveryToken(parsed.data.recoverySecret);
    if (!tokenValid) {
      return NextResponse.json(
        { error: "Invalid or expired administrator recovery token." },
        { status: 401 }
      );
    }

    const setRes = setAdminCredentials(parsed.data.newPassword);
    if (!setRes.success) {
      return NextResponse.json({ error: setRes.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Administrator password has been securely re-established.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Recovery failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

