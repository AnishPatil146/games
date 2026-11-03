import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getOrCreateSession,
  getPublicSessionDossier,
  recordEventByToken,
} from "@/lib/storage";
import { getParticipantSubjectProgress } from "@/lib/services/platform-store";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  attachSessionTokenCookie,
  getOrIssueSessionToken,
  getSessionTokenFromRequest,
} from "@/lib/session-cookie";

const CreateSessionSchema = z.object({
  mode: z.enum(["senior", "junior"]).optional(),
  stream: z.enum(["science", "commerce", "arts"]).optional(),
  subjectSlug: z.string().max(80).optional(),
  presentation: z.enum(["HIM", "HER", "UNSPECIFIED"]).optional(),
  utmSource: z.string().max(80).optional(),
  utmMedium: z.string().max(80).optional(),
  utmCampaign: z.string().max(120).optional(),
  resetSession: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const token = getSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({
      initialized: false,
      session: null,
      subjectProgress: {},
    });
  }

  const dossier = await getPublicSessionDossier(token);
  const subjectProgress = await getParticipantSubjectProgress(token);

  return NextResponse.json({
    initialized: Boolean(dossier),
    session: dossier?.session || null,
    playerDisplayName: dossier?.playerDisplayName || null,
    subjectProgress,
  });
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "v1_sessions", 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many session requests. Please wait briefly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid session payload." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { token } = getOrIssueSessionToken(req, Boolean(data.resetSession));

    const { session, playerDisplayName } = await getOrCreateSession(
      token,
      {
        source: data.utmSource,
        medium: data.utmMedium,
        name: data.utmCampaign,
      },
      data.presentation || "UNSPECIFIED"
    );

    if (data.mode) {
      await recordEventByToken(token, 0, "mode_selected", {
        mode: data.mode,
        stream: data.stream || null,
        subjectSlug: data.subjectSlug || null,
      });
    }

    const res = NextResponse.json({
      success: true,
      session,
      playerDisplayName,
    });
    return attachSessionTokenCookie(res, token);
  } catch {
    return NextResponse.json(
      { error: "Unable to initialize session." },
      { status: 500 }
    );
  }
}

