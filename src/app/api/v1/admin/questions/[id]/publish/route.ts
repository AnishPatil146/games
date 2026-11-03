import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { setQuestionPublicationState } from "@/lib/services/platform-store";
import { mapServiceErrorToResponse } from "@/lib/session-cookie";

const PublishSchema = z.object({
  action: z.enum(["publish", "unpublish", "archive"]),
  reviewConfirmed: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized || !auth.email) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  const { id } = await context.params;
  try {
    const body: unknown = await req.json();
    const parsed = PublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid publication state payload." },
        { status: 400 }
      );
    }

    const updated = setQuestionPublicationState(
      id,
      parsed.data.action,
      parsed.data.reviewConfirmed,
      auth.email
    );

    return NextResponse.json({
      success: true,
      question: updated,
    });
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to change question publication status."
    );
  }
}

