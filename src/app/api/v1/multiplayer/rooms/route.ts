import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/services/multiplayer-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const hostName = typeof body.hostName === "string" ? body.hostName.trim() : "Host";
    const { room, hostId } = createRoom(hostName);
    return NextResponse.json({ success: true, room, hostId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create room";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

