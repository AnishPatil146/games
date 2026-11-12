import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPlayerReview, getPublicPlayerReviews } from "@/lib/storage";

const SubmitReviewSchema = z.object({
  playerName: z
    .string()
    .trim()
    .min(2, "Player callsign must be at least 2 characters.")
    .max(60, "Player callsign must be 60 characters or fewer."),
  instagramId: z
    .string()
    .trim()
    .max(60, "Instagram handle must be 60 characters or fewer.")
    .optional()
    .nullable()
    .transform((val) => (val ? val.replace(/^@+/, "").trim() || null : null)),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1 star.")
    .max(5, "Rating cannot exceed 5 stars."),
  title: z
    .string()
    .trim()
    .min(2, "Review headline must be at least 2 characters.")
    .max(120, "Review headline must be 120 characters or fewer."),
  feedback: z
    .string()
    .trim()
    .min(5, "Review text must be at least 5 characters.")
    .max(2000, "Review text must be 2000 characters or fewer."),
  category: z
    .enum(["general", "solo", "junior", "story", "puzzles", "design"])
    .optional()
    .default("general"),
  modePlayed: z
    .enum(["senior", "junior", "both", "general"])
    .optional()
    .default("general"),
});

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") || "all";
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 12;

    const result = await getPublicPlayerReviews({ category, page, limit });
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load player reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = SubmitReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review payload." },
        { status: 400 }
      );
    }

    const { playerName, instagramId, rating, title, feedback, category, modePlayed } =
      parsed.data;

    // Check if player ID exists in cookies
    const cookiePlayerId = req.cookies.get("the_unwritten_player_id")?.value || null;

    const newReview = await createPlayerReview({
      playerId: cookiePlayerId,
      playerName,
      instagramId,
      rating,
      title,
      feedback,
      category,
      modePlayed,
    });

    return NextResponse.json({
      success: true,
      review: newReview,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record player review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
