import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitDeletionRequest } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

const DeletionSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(2, "Please provide the display name, Instagram handle, or session ID to delete.")
    .max(150),
  reason: z.string().max(400).optional(),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, "deletion_request", 6, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Please wait before submitting another request." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = DeletionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid deletion request." },
        { status: 400 }
      );
    }

    const { requestId } = await submitDeletionRequest(
      parsed.data.identifier,
      parsed.data.reason
    );

    return NextResponse.json({
      success: true,
      requestId,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unable to submit deletion request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

