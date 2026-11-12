import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { deleteAdminPlayerReview, updateAdminPlayerReview } from "@/lib/storage";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const UpdateReviewSchema = z.object({
  status: z.enum(["approved", "pending", "flagged", "archived"]).optional(),
  featured: z.boolean().optional(),
  adminResponse: z.string().trim().max(1000).nullable().optional(),
});

export async function PATCH(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const { id } = await props.params;
    const body: unknown = await req.json();
    const parsed = UpdateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update payload." },
        { status: 400 }
      );
    }

    const updated = await updateAdminPlayerReview(id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Player review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const { id } = await props.params;
    const deleted = await deleteAdminPlayerReview(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Player review not found or already removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player review deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
