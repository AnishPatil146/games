import { NextRequest, NextResponse } from "next/server";
import { getPublicLeaderboard } from "@/lib/services/leaderboard-service";
import type { StreamSlug } from "@/lib/platform-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modeParam = searchParams.get("mode") as "all" | "junior_academy" | "senior_solo" | null;
    const streamParam = searchParams.get("stream") as "ALL" | StreamSlug | null;
    const timeframeParam = searchParams.get("timeframe") as "live" | "all_time" | null;

    const summary = await getPublicLeaderboard({
      mode: modeParam || "all",
      stream: streamParam || "ALL",
      timeframe: timeframeParam || "all_time",
    });

    const response = NextResponse.json({
      success: true,
      data: summary,
    });

    // Enforce 0-second cache so every second the live client gets instantaneous live data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load live leaderboard telemetry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

