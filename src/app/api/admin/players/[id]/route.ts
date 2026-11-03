import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getSessionFullData } from "@/lib/storage";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Administrator access unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await props.params;
    const { session, player, events, preferences } = await getSessionFullData(id);

    const playerName = player?.display_name || "Anonymous Traveler";
    const report = evaluateReport(
      session.id,
      playerName,
      events,
      preferences,
      session.completed_at || session.started_at
    );

    return NextResponse.json({
      success: true,
      session,
      player,
      events,
      preferences,
      report,
    });
  } catch (err: any) {
    console.error("Error retrieving player detail:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load player details" },
      { status: 500 }
    );
  }
}

