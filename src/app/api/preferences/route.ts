import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordPreferenceByToken, recordPreferencesBatchByToken } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_COOKIE = "the_unwritten_token";

const PreferenceSchema = z.object({
  category: z.string().trim().min(1).max(80),
  selectedValue: z.string().trim().min(1).max(200).optional(),
  selectedValues: z.array(z.string().trim().min(1).max(200)).optional(),
  replace: z.boolean().optional(),
}).refine((data) => data.selectedValue !== undefined || (data.selectedValues !== undefined && data.selectedValues.length > 0), {
  message: "Either selectedValue or selectedValues is required.",
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

    if (parsed.data.selectedValues && parsed.data.selectedValues.length > 0) {
      await recordPreferencesBatchByToken(
        sessionToken,
        parsed.data.category,
        parsed.data.selectedValues
      );
    } else if (parsed.data.selectedValue) {
      await recordPreferenceByToken(
        sessionToken,
        parsed.data.category,
        parsed.data.selectedValue,
        Boolean(parsed.data.replace)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to record preference.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
