import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAllAdminPlayerReviews } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const status = req.nextUrl.searchParams.get("status") || "all";
    const category = req.nextUrl.searchParams.get("category") || "all";
    const rating = Number(req.nextUrl.searchParams.get("rating")) || 0;
    const search = req.nextUrl.searchParams.get("search") || "";
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 25;

    const data = await getAllAdminPlayerReviews({
      status,
      category,
      rating,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admin reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
