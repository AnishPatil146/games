import { NextRequest, NextResponse } from "next/server";
import { submitLevelSolution } from "@/lib/services/multiplayer-store";

interface RouteProps {
  params: Promise<{ code: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { code } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const playerId = String(body.playerId || "");
    const payload = body.payload || {};

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Missing playerId" },
        { status: 400 }
      );
    }

    const result = submitLevelSolution(code, playerId, payload);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

