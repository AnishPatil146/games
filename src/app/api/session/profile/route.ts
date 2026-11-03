import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordEventByToken, submitProfileByToken } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_COOKIE = "the_unwritten_token";

const ProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(60, "Display name must be 60 characters or fewer."),
  instagramUsername: z
    .string()
    .max(40, "Instagram username must be 40 characters or fewer.")
    .optional()
    .transform((val) =>
      val ? val.replace(/^@+/, "").trim() || undefined : undefined
    ),
  consent: z.boolean().refine((val) => val === true, {
    message: "Explicit consent is required to link profile details to gameplay.",
  }),
  characterPresentation: z
    .enum(["HIM", "HER", "UNSPECIFIED"])
    .default("UNSPECIFIED"),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "session_profile", 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many profile requests. Please wait briefly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const sessionToken = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!sessionToken || sessionToken.length < 16) {
    return NextResponse.json(
      { error: "Active game session required. Refresh and try again." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile submission." },
        { status: 400 }
      );
    }

    const validated = parsed.data;
    const result = await submitProfileByToken(sessionToken, {
      displayName: validated.displayName,
      instagramUsername: validated.instagramUsername,
      consent: validated.consent,
      characterPresentation: validated.characterPresentation,
    });

    await recordEventByToken(sessionToken, 0, "profile_submitted", {
      hasInstagram: Boolean(validated.instagramUsername),
      presentation: validated.characterPresentation,
    });

    await recordEventByToken(sessionToken, 0, "game_started", {
      anonymous: false,
      presentation: validated.characterPresentation,
    });

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      displayName: result.displayName,
      characterPresentation: result.characterPresentation,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unable to save profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
