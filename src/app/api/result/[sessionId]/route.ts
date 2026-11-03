import { NextRequest, NextResponse } from "next/server";
import { getSessionFullData, completeGameSession } from "@/lib/storage";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { sessionId } = await props.params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const { session, player, events, preferences } = await getSessionFullData(
      sessionId
    );

    const playerName = player?.display_name || "Anonymous Traveler";
    const report = evaluateReport(
      session.id,
      playerName,
      events,
      preferences,
      session.completed_at || new Date().toISOString()
    );

    // Ensure session is marked completed in storage if not already
    if (session.status !== "completed") {
      await completeGameSession(session.id, report.archetype);
    }

    return NextResponse.json({
      success: true,
      report,
      player,
      session,
    });
  } catch (err: any) {
    console.error("Error in /api/result/[sessionId]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate gameplay report" },
      { status: 500 }
    );
  }
}

