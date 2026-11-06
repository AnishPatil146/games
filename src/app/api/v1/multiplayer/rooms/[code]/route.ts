import { NextRequest, NextResponse } from "next/server";
import {
  getClientRoom,
  getRoom,
  joinRoom,
  togglePlayerReady,
  setRoomDifficulty,
  startCampaign,
  makeSudoku6x6Move,
  updatePlayerCursor,
  requestSharedSudokuHint,
  triggerTeamRetry,
  reconnectPlayer,
  recordPlayerHeartbeat,
} from "@/lib/services/multiplayer-store";
import {
  enforceRateLimit,
  validatePayloadSize,
} from "@/lib/services/traffic-guard";

interface RouteProps {
  params: Promise<{ code: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { code } = await params;
  const rawRoom = getRoom(code);
  if (!rawRoom) {
    return NextResponse.json(
      { success: false, error: "Alliance room not found" },
      { status: 404 }
    );
  }

  // Check server-authoritative deadline expiration
  if (
    rawRoom.status === "in_progress" &&
    rawRoom.serverDeadlineTimestamp &&
    Date.now() > rawRoom.serverDeadlineTimestamp
  ) {
    // If not all players solved before deadline, team must retry!
    const allSolved = rawRoom.players.every((p) => p.currentLevelSolved);
    if (!allSolved) {
      triggerTeamRetry(code);
    }
  }

  const room = getClientRoom(code);
  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { code } = await params;

  // 1. Enforce payload size
  const sizeCheck = validatePayloadSize(req, 64 * 1024);
  if (!sizeCheck.valid) {
    return NextResponse.json({ success: false, error: sizeCheck.error }, { status: 413 });
  }

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

    if (action === "reconnect") {
      const rl = await enforceRateLimit(req, "RECONNECT", code);
      if (!rl.allowed && rl.response) return rl.response;

      const playerId = String(body.playerId || "");
      const reconnectToken = String(body.reconnectToken || "");
      const result = await reconnectPlayer(code, playerId, reconnectToken);
      if (!result.success) {
        return NextResponse.json(result, { status: 401 });
      }
      return NextResponse.json(result);
    }

    if (action === "heartbeat") {
      const playerId = String(body.playerId || "");
      const result = recordPlayerHeartbeat(code, playerId);
      return NextResponse.json(result);
    }

    if (action === "set_difficulty") {
      const hostId = String(body.hostId || "");
      const difficulty = body.difficulty;
      if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
        return NextResponse.json(
          { success: false, error: "Invalid difficulty (must be easy, medium, or hard)" },
          { status: 400 }
        );
      }
      const result = setRoomDifficulty(code, hostId, difficulty);
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

    if (action === "sudoku_move") {
      const rl = await enforceRateLimit(req, "SUDOKU_MOVE", code);
      if (!rl.allowed && rl.response) return rl.response;

      const playerId = String(body.playerId || "");
      const row = Number(body.row);
      const col = Number(body.col);
      const value = Number(body.value);
      const txId = typeof body.txId === "string" ? body.txId : undefined;
      const expectedVersion =
        typeof body.expectedVersion === "number" ? body.expectedVersion : undefined;

      const result = makeSudoku6x6Move(code, playerId, row, col, value, txId, expectedVersion);
      if (!result.success) {
        const status = result.error?.includes("conflict") ? 409 : 400;
        return NextResponse.json(result, { status });
      }
      return NextResponse.json(result);
    }

    if (action === "sudoku_cursor") {
      const playerId = String(body.playerId || "");
      const row = Number(body.row);
      const col = Number(body.col);

      const result = updatePlayerCursor(code, playerId, row, col);
      return NextResponse.json(result);
    }

    if (action === "sudoku_hint") {
      const rl = await enforceRateLimit(req, "SUDOKU_HINT", code);
      if (!rl.allowed && rl.response) return rl.response;

      const playerId = String(body.playerId || "");
      const result = requestSharedSudokuHint(code, playerId);
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
