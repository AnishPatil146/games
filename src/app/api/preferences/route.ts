import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordPlayerPreference } from "@/lib/storage";

const PreferenceSchema = z.object({
  sessionId: z.string().min(1),
  category: z.string().min(1),
  selectedValue: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = PreferenceSchema.parse(body);

    await recordPlayerPreference(
      validated.sessionId,
      validated.category,
      validated.selectedValue
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/preferences:", err);
    return NextResponse.json(
      { error: err.errors || err.message || "Failed to record preference" },
      { status: 400 }
    );
  }
}

