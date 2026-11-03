import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminDetailByPlayerOrSessionId } from "@/lib/storage";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const { id } = await props.params;
    const detail = await getAdminDetailByPlayerOrSessionId(id);

    if (!detail) {
      return NextResponse.json(
        { error: "Player or session record not found." },
        { status: 404 }
      );
    }

    const report = evaluateReport(
      detail.primarySession.id,
      detail.player?.display_name || "Anonymous Traveler",
      detail.events,
      detail.preferences,
      detail.primarySession.completed_at || detail.primarySession.started_at,
      detail.primarySession.character_presentation
    );

    return NextResponse.json({
      success: true,
      player: detail.player,
      sessions: detail.sessions,
      session: detail.primarySession,
      events: detail.events,
      preferences: detail.preferences,
      report,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load player detail.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
