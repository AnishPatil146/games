import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSessionDossier, recordEventByToken } from "@/lib/storage";
import { evaluateReport } from "@/lib/scoring";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_COOKIE = "the_unwritten_token";

const EventSchema = z.object({
  chapter: z.number().int().min(0).max(6),
  eventType: z.enum([
    "landing_view",
    "game_started",
    "profile_submitted",
    "chapter_started",
    "choice_selected",
    "clue_inspected",
    "puzzle_attempted",
    "hint_used",
    "chapter_completed",
    "game_completed",
  ]),
  eventData: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "gameplay_events", 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded for event telemetry." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const sessionToken = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!sessionToken || sessionToken.length < 16) {
    return NextResponse.json(
      { error: "Session cookie missing or expired." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = EventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid event payload." },
        { status: 400 }
      );
    }

    const { chapter, eventType, eventData } = parsed.data;

    let computedArchetype: string | undefined;
    let resolvedSessionId: string | undefined;

    if (eventType === "game_completed") {
      const currentDossier = await getPublicSessionDossier(sessionToken);
      if (currentDossier) {
        resolvedSessionId = currentDossier.session.id;
        const report = evaluateReport(
          currentDossier.session.id,
          currentDossier.playerDisplayName || "Anonymous Traveler",
          currentDossier.events,
          currentDossier.preferences,
          new Date().toISOString(),
          currentDossier.session.character_presentation
        );
        computedArchetype = report.archetype;
      }
    }

    const result = await recordEventByToken(
      sessionToken,
      chapter,
      eventType,
      eventData,
      computedArchetype
    );

    return NextResponse.json({
      success: true,
      ...result,
      sessionId: resolvedSessionId,
      archetype: computedArchetype,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to record gameplay event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
