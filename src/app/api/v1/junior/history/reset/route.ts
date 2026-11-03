import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetJuniorSubjectHistory } from "@/lib/services/platform-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getSessionTokenFromRequest,
  mapServiceErrorToResponse,
} from "@/lib/session-cookie";

const ResetHistorySchema = z.object({
  subjectSlug: z.string().trim().min(2).max(80),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "v1_junior_history_reset", 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many reset requests. Please wait briefly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const token = getSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { error: "No active session history found to reset." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = ResetHistorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subject identifier." },
        { status: 400 }
      );
    }

    const res = await resetJuniorSubjectHistory({
      sessionToken: token,
      subjectSlug: parsed.data.subjectSlug,
    });

    return NextResponse.json({
      success: true,
      ...res,
    });
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to reset subject question cycle."
    );
  }
}

