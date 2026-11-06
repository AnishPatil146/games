import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/services/multiplayer-store";
import { enforceRateLimit, validatePayloadSize } from "@/lib/services/traffic-guard";

export async function POST(req: NextRequest) {
  // 1. Enforce payload size
  const sizeCheck = validatePayloadSize(req, 64 * 1024);
  if (!sizeCheck.valid) {
    return NextResponse.json({ success: false, error: sizeCheck.error }, { status: 413 });
  }

  // 2. Enforce room creation rate limits (max 6 rooms per 60s per IP)
  const rl = await enforceRateLimit(req, "CREATE_ROOM");
  if (!rl.allowed && rl.response) return rl.response;

  try {
    const body = await req.json().catch(() => ({}));
    const hostName = typeof body.hostName === "string" ? body.hostName.trim() : "Host";
    const difficulty =
      body.difficulty === "easy" || body.difficulty === "hard" ? body.difficulty : "medium";
    const { room, hostId, reconnectToken } = createRoom(hostName, difficulty);
    return NextResponse.json({ success: true, room, hostId, reconnectToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create room";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
