import { NextRequest, NextResponse } from "next/server";
import { getPlayerIdentityByTokenOrId } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const cookiePlayerId = req.cookies.get("the_unwritten_player_id")?.value;
    const cookieUsername = req.cookies.get("the_unwritten_username")?.value;
    const cookieInstagram = req.cookies.get("the_unwritten_instagram")?.value;
    const cookieToken = req.cookies.get("the_unwritten_token")?.value;

    if (cookiePlayerId && cookieUsername) {
      return NextResponse.json({
        registered: true,
        player: {
          id: cookiePlayerId,
          username: decodeURIComponent(cookieUsername),
          instagramId: cookieInstagram ? decodeURIComponent(cookieInstagram) : null,
        },
      });
    }

    const player = await getPlayerIdentityByTokenOrId({
      playerId: cookiePlayerId,
      sessionToken: cookieToken,
    });

    if (player) {
      return NextResponse.json({
        registered: true,
        player,
      });
    }

    return NextResponse.json({ registered: false });
  } catch {
    return NextResponse.json({ registered: false });
  }
}
