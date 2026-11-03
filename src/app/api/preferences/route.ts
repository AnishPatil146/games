import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordPreferenceByToken } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_COOKIE = "the_unwritten_token";

const PreferenceSchema = z.object({
  category: z.string().trim().min(1).max(80),
  selectedValue: z.string().trim().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "preferences", 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const sessionToken = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!sessionToken || sessionToken.length < 16) {
    return NextResponse.json(
      { error: "Active game session required." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = PreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid preference payload." },
        { status: 400 }
      );
    }

    await recordPreferenceByToken(
      sessionToken,
      parsed.data.category,
      parsed.data.selectedValue
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to record preference.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
