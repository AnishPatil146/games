import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { updateAdminQuestion } from "@/lib/services/platform-store";
import { mapServiceErrorToResponse } from "@/lib/session-cookie";

const AbilityKeyEnum = z.enum([
  "logical_reasoning",
  "analytical_thinking",
  "scientific_understanding",
  "problem_solving",
  "numerical_reasoning",
  "financial_understanding",
  "strategic_thinking",
  "business_decision_making",
  "critical_thinking",
  "interpretation",
  "communication",
  "creative_thinking",
]);

const PatchQuestionSchema = z.object({
  chapterNumber: z.coerce.number().int().min(1).max(50).optional(),
  chapter: z.string().trim().min(2).max(180).optional(),
  topic: z.string().trim().min(2).max(180).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  questionText: z.string().trim().min(8).max(2000).optional(),
  diagramType: z
    .enum([
      "vector_plane",
      "circuit_ohm",
      "optics_refraction",
      "demand_supply",
      "accounting_ledger",
      "earth_layers",
    ])
    .optional(),
  options: z
    .array(
      z.object({
        key: z.enum(["A", "B", "C", "D"]),
        text: z.string().trim().min(1).max(600),
      })
    )
    .length(4)
    .optional(),
  correctKey: z.enum(["A", "B", "C", "D"]).optional(),
  explanation: z.string().trim().min(8).max(2000).optional(),
  syllabusReference: z.string().trim().min(4).max(240).optional(),
  abilityTags: z.array(AbilityKeyEnum).min(1).max(4).optional(),
  reviewed: z.boolean().optional(),
});

export async function PATCH(
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
    const parsed = PatchQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid question update payload.",
        },
        { status: 400 }
      );
    }

    const updated = updateAdminQuestion(id, parsed.data, auth.email);
    return NextResponse.json({
      success: true,
      question: updated,
    });
  } catch (err: unknown) {
    return mapServiceErrorToResponse(err, "Unable to update question.");
  }
}
