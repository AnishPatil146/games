import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { startJuniorAttempt } from "@/lib/services/platform-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  attachSessionTokenCookie,
  getOrIssueSessionToken,
  mapServiceErrorToResponse,
} from "@/lib/session-cookie";

const StartJuniorAttemptSchema = z.object({
  stream: z.enum(["science", "commerce", "arts"]),
  subjectSlug: z.string().trim().min(2).max(80),
  difficultyPreference: z
    .enum(["Mixed", "Easy", "Medium", "Hard"])
    .default("Mixed"),
  instantFeedbackEnabled: z.boolean().default(false),
  optionalProfile: z
    .object({
      fullName: z.string().trim().max(80).optional(),
      username: z.string().trim().max(50).optional(),
      consent: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "v1_junior_attempt_start", 25, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempt requests. Please wait briefly before retrying." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = StartJuniorAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid Junior challenge configuration.",
        },
        { status: 400 }
      );
    }

    const { token } = getOrIssueSessionToken(req, false);
    const attempt = await startJuniorAttempt({
      sessionToken: token,
      stream: parsed.data.stream,
      subjectSlug: parsed.data.subjectSlug,
      difficultyPreference: parsed.data.difficultyPreference,
      instantFeedbackEnabled: parsed.data.instantFeedbackEnabled,
      optionalProfile: parsed.data.optionalProfile,
    });

    const response = NextResponse.json(attempt, { status: 201 });
    return attachSessionTokenCookie(response, token);
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to start Junior Mode challenge attempt."
    );
  }
}

