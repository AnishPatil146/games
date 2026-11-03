import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSession, recordGameplayEvent } from "@/lib/storage";

const StartSessionSchema = z.object({
  sessionToken: z.string().min(6),
  presentation: z.enum(["HIM", "HER", "UNSPECIFIED"]).default("UNSPECIFIED"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  isLandingView: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = StartSessionSchema.parse(body);

    const session = await getOrCreateSession(
      validated.sessionToken,
      {
        source: validated.utmSource,
        medium: validated.utmMedium,
        campaign: validated.utmCampaign,
      },
      validated.presentation
    );

    // Track landing view or game started event
    const eventType = validated.isLandingView ? "landing_view" : "game_started";
    await recordGameplayEvent(session.id, 0, eventType, {
      userAgent: req.headers.get("user-agent") || "unknown",
      referrer: req.headers.get("referer") || "direct",
      presentation: validated.presentation,
      timestamp: new Date().toISOString(),
    });

    const response = NextResponse.json({ success: true, session });
    
    // Set persistent session token cookie
    response.cookies.set("the_unwritten_token", validated.sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Error in /api/session/start:", err);
    return NextResponse.json(
      { error: err.errors || err.message || "Failed to initialize session" },
      { status: 400 }
    );
  }
}

