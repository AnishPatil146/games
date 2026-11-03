import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import {
  getOrCreateSession,
  getPublicSessionDossier,
  recordEventByToken,
  updateSessionPresentationByToken,
} from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_COOKIE = "the_unwritten_token";

const StartSessionSchema = z.object({
  presentation: z.enum(["HIM", "HER", "UNSPECIFIED"]).optional(),
  utmSource: z.string().max(80).optional(),
  utmMedium: z.string().max(80).optional(),
  utmCampaign: z.string().max(120).optional(),
  recordEvent: z.enum(["landing_view", "game_started", "none"]).default("none"),
  resetSession: z.boolean().optional(),
});

function generateSecureSessionToken(): string {
  return "uw_" + crypto.randomBytes(20).toString("hex");
}

export async function GET(req: NextRequest) {
  const existingToken = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!existingToken || existingToken.length < 16) {
    return NextResponse.json({ initialized: false, session: null });
  }

  try {
    const dossier = await getPublicSessionDossier(existingToken);
    if (!dossier) {
      return NextResponse.json({ initialized: false, session: null });
    }

    return NextResponse.json({
      initialized: true,
      session: dossier.session,
      playerDisplayName: dossier.playerDisplayName,
      events: dossier.events,
      preferences: dossier.preferences,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load session state.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "session_start", 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait briefly before retrying." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = StartSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid session payload." },
        { status: 400 }
      );
    }

    const validated = parsed.data;
    const cookieToken = req.cookies.get(TOKEN_COOKIE)?.value;
    const token =
      validated.resetSession || !cookieToken || cookieToken.length < 16
        ? generateSecureSessionToken()
        : cookieToken;

    const { session, playerDisplayName } = await getOrCreateSession(
      token,
      {
        source: validated.utmSource,
        medium: validated.utmMedium,
        name: validated.utmCampaign,
      },
      validated.presentation || "UNSPECIFIED"
    );

    if (validated.presentation) {
      await updateSessionPresentationByToken(token, validated.presentation);
      session.character_presentation = validated.presentation;
    }

    if (validated.recordEvent === "landing_view") {
      await recordEventByToken(token, 0, "landing_view", {
        campaignSource: validated.utmSource || null,
        campaignMedium: validated.utmMedium || null,
        campaignName: validated.utmCampaign || null,
      });
    } else if (validated.recordEvent === "game_started") {
      await recordEventByToken(token, 0, "game_started", {
        presentation: session.character_presentation,
        anonymous: !session.player_id,
      });
    }

    const response = NextResponse.json({
      success: true,
      session,
      playerDisplayName,
    });

    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to initialize session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
