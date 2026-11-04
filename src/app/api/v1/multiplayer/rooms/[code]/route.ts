import { NextRequest, NextResponse } from "next/server";
import {
  getRoom,
  joinRoom,
  togglePlayerReady,
  startCampaign,
  triggerTeamRetry,
} from "@/lib/services/multiplayer-store";

interface RouteProps {
  params: Promise<{ code: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { code } = await params;
  const room = getRoom(code);
  if (!room) {
    return NextResponse.json(
      { success: false, error: "Alliance room not found" },
      { status: 404 }
    );
  }

  // Check server-authoritative deadline expiration
  if (
    room.status === "in_progress" &&
    room.serverDeadlineTimestamp &&
    Date.now() > room.serverDeadlineTimestamp
  ) {
    // If not all players solved before deadline, team must retry!
    const allSolved = room.players.every((p) => p.currentLevelSolved);
    if (!allSolved) {
      triggerTeamRetry(code);
    }
  }

  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { code } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "join") {
      const playerName =
        typeof body.playerName === "string" ? body.playerName.trim() : "";
      const result = joinRoom(code, playerName);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "toggle_ready") {
      const playerId = String(body.playerId || "");
      const room = togglePlayerReady(code, playerId);
      if (!room) {
        return NextResponse.json(
          { success: false, error: "Room not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, room });
    }

    if (action === "start") {
      const hostId = String(body.hostId || "");
      const result = startCampaign(code, hostId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "retry") {
      const room = triggerTeamRetry(code);
      return NextResponse.json({ success: true, room });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

