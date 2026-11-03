import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  recordGameplayEvent,
  updateSessionChapter,
  completeGameSession,
} from "@/lib/storage";

const EventSchema = z.object({
  sessionId: z.string().min(1),
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
  resultArchetype: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = EventSchema.parse(body);

    await recordGameplayEvent(
      validated.sessionId,
      validated.chapter,
      validated.eventType,
      validated.eventData
    );

    // If chapter started or completed, update current chapter on session
    if (validated.eventType === "chapter_started") {
      await updateSessionChapter(validated.sessionId, validated.chapter);
    } else if (validated.eventType === "chapter_completed") {
      await updateSessionChapter(
        validated.sessionId,
        Math.min(6, validated.chapter + 1)
      );
    } else if (validated.eventType === "game_completed") {
      await completeGameSession(
        validated.sessionId,
        validated.resultArchetype || "The Observer"
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/events:", err);
    return NextResponse.json(
      { error: err.errors || err.message || "Failed to record event" },
      { status: 400 }
    );
  }
}
