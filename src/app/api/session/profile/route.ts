import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updatePlayerProfile, recordGameplayEvent } from "@/lib/storage";

const ProfileSchema = z.object({
  sessionId: z.string().min(1),
  displayName: z.string().min(1, "Display name is required").max(60),
  instagramUsername: z
    .string()
    .max(40)
    .optional()
    .transform((val) => (val ? val.replace(/^@/, "").trim() : undefined)),
  consent: z.boolean().refine((val) => val === true, {
    message: "Consent is required to save a linked profile.",
  }),
  characterPresentation: z
    .enum(["HIM", "HER", "UNSPECIFIED"])
    .default("UNSPECIFIED"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ProfileSchema.parse(body);

    const result = await updatePlayerProfile(validated.sessionId, {
      displayName: validated.displayName,
      instagramUsername: validated.instagramUsername,
      consent: validated.consent,
      characterPresentation: validated.characterPresentation,
    });

    // Record profile submitted event
    await recordGameplayEvent(result.session.id, 0, "profile_submitted", {
      hasInstagram: Boolean(validated.instagramUsername),
      presentation: validated.characterPresentation,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Error in /api/session/profile:", err);
    return NextResponse.json(
      { error: err.errors || err.message || "Invalid profile data" },
      { status: 400 }
    );
  }
}
