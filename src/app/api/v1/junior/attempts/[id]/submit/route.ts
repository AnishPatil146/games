import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitJuniorAttempt } from "@/lib/services/platform-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getSessionTokenFromRequest,
  mapServiceErrorToResponse,
} from "@/lib/session-cookie";

const SubmitAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(120),
        selectedOptionKey: z.enum(["A", "B", "C", "D"]).nullable(),
        responseTimeMs: z.number().int().min(0).max(3_600_000).nullable().optional(),
      })
    )
    .max(20),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(req, "v1_junior_attempt_submit", 25, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait briefly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid attempt ID." }, { status: 400 });
  }

  const token = getSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { error: "Active participant session required to submit answers." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = SubmitAnswersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid answer submission payload.",
        },
        { status: 400 }
      );
    }

    const result = await submitJuniorAttempt({
      attemptId: id,
      sessionToken: token,
      answers: parsed.data.answers,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to evaluate Junior Mode attempt."
    );
  }
}

