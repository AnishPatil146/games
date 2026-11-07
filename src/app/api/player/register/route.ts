import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerPlayerAccount } from "@/lib/storage";

const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters.")
    .max(50, "Username must be 50 characters or fewer."),
  instagramId: z
    .string()
    .trim()
    .max(50, "Instagram ID must be 50 characters or fewer.")
    .optional()
    .transform((val) => (val ? val.replace(/^@+/, "").trim() || null : null)),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration data." },
        { status: 400 }
      );
    }

    const { username, instagramId } = parsed.data;
    const cookieToken = req.cookies.get("the_unwritten_token")?.value;

    const result = await registerPlayerAccount({
      username,
      instagramId,
      sessionToken: cookieToken,
    });

    const res = NextResponse.json({
      success: true,
      playerId: result.playerId,
      username: result.username,
      instagramId: result.instagramId,
      isReturningPlayer: result.isReturningPlayer,
      sessionToken: result.sessionToken,
    });

    const isProd = process.env.NODE_ENV === "production";
    const oneYearSeconds = 365 * 24 * 60 * 60;

    // Set persistent identity cookies
    res.cookies.set("the_unwritten_player_id", result.playerId, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: oneYearSeconds,
      path: "/",
    });

    res.cookies.set("the_unwritten_username", encodeURIComponent(result.username), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: oneYearSeconds,
      path: "/",
    });

    if (result.instagramId) {
      res.cookies.set("the_unwritten_instagram", encodeURIComponent(result.instagramId), {
        httpOnly: false,
        secure: isProd,
        sameSite: "lax",
        maxAge: oneYearSeconds,
        path: "/",
      });
    }

    res.cookies.set("the_unwritten_token", result.sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: oneYearSeconds,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to register player." },
      { status: 500 }
    );
  }
}
