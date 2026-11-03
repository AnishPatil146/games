import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  createAdminQuestion,
  exportQuestionsAsCsv,
  getAllEffectiveQuestions,
  getEffectiveSubjectQuestionBank,
  importAdminQuestionsBatch,
  parseQuestionsCsv,
  queryAdminQuestions,
} from "@/lib/services/platform-store";
import { QuestionBankRecord } from "@/lib/platform-types";

const QueryQuestionsSchema = z.object({
  stream: z.enum(["science", "commerce", "arts"]).optional(),
  subjectSlug: z.string().max(80).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  exportFormat: z.enum(["csv", "json"]).optional(),
});

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

const SingleQuestionSchema = z.object({
  mode: z.literal("single").default("single"),
  board: z.string().trim().min(2).max(40).default("MSBSHSE"),
  academicYear: z.string().trim().min(4).max(20).default("2025-26"),
  standard: z.string().trim().min(2).max(40).default("Class 11 (FYJC)"),
  stream: z.enum(["science", "commerce", "arts"]),
  subjectSlug: z.string().trim().min(2).max(80),
  subjectName: z.string().trim().min(2).max(100),
  chapterNumber: z.coerce.number().int().min(1).max(50),
  chapter: z.string().trim().min(2).max(180),
  topic: z.string().trim().min(2).max(180),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  questionText: z.string().trim().min(8).max(2000),
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
    .length(4),
  correctKey: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().trim().min(8).max(2000),
  syllabusReference: z.string().trim().min(4).max(240),
  abilityTags: z.array(AbilityKeyEnum).min(1).max(4),
  publicationStatus: z
    .enum(["draft", "published", "archived"])
    .default("draft"),
  reviewed: z.boolean().default(false),
});

const BulkImportSchema = z.object({
  mode: z.literal("import"),
  format: z.enum(["csv", "json"]),
  content: z.string().min(4).max(5_000_000),
});

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const parsed = QueryQuestionsSchema.safeParse({
    stream: sp.get("stream") || undefined,
    subjectSlug: sp.get("subjectSlug") || undefined,
    difficulty: sp.get("difficulty") || undefined,
    publicationStatus: sp.get("publicationStatus") || undefined,
    search: sp.get("search") || undefined,
    page: sp.get("page") || 1,
    pageSize: sp.get("pageSize") || 25,
    exportFormat: sp.get("export") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid question query filters." },
      { status: 400 }
    );
  }

  const filters = parsed.data;

  if (filters.exportFormat) {
    let exportPool = filters.subjectSlug
      ? getEffectiveSubjectQuestionBank(filters.subjectSlug)
      : getAllEffectiveQuestions();

    if (filters.stream) {
      exportPool = exportPool.filter((q) => q.stream === filters.stream);
    }
    if (filters.difficulty) {
      exportPool = exportPool.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters.publicationStatus) {
      exportPool = exportPool.filter(
        (q) => q.publicationStatus === filters.publicationStatus
      );
    }

    const fileSuffix = filters.subjectSlug || filters.stream || "all-subjects";
    if (filters.exportFormat === "csv") {
      const csv = exportQuestionsAsCsv(exportPool);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="the-unwritten-questions-${fileSuffix}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(exportPool, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="the-unwritten-questions-${fileSuffix}.json"`,
      },
    });
  }

  const pageData = queryAdminQuestions(filters);
  return NextResponse.json(pageData);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized || !auth.email) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const body: unknown = await req.json();

    // Check if bulk CSV / JSON import
    if (
      body &&
      typeof body === "object" &&
      "mode" in body &&
      (body as { mode?: unknown }).mode === "import"
    ) {
      const bulkParsed = BulkImportSchema.safeParse(body);
      if (!bulkParsed.success) {
        return NextResponse.json(
          {
            error:
              bulkParsed.error.issues[0]?.message ||
              "Invalid import payload.",
          },
          { status: 400 }
        );
      }

      let candidateItems: Partial<QuestionBankRecord>[] = [];
      if (bulkParsed.data.format === "csv") {
        candidateItems = parseQuestionsCsv(bulkParsed.data.content);
      } else {
        const jsonParsed: unknown = JSON.parse(bulkParsed.data.content);
        if (!Array.isArray(jsonParsed)) {
          return NextResponse.json(
            { error: "JSON import must contain a top-level array of questions." },
            { status: 400 }
          );
        }
        candidateItems = jsonParsed as Partial<QuestionBankRecord>[];
      }

      const summary = importAdminQuestionsBatch(candidateItems, auth.email);
      return NextResponse.json({
        success: true,
        ...summary,
      });
    }

    // Single question creation
    const singleParsed = SingleQuestionSchema.safeParse(body);
    if (!singleParsed.success) {
      return NextResponse.json(
        {
          error:
            singleParsed.error.issues[0]?.message ||
            "Invalid question payload.",
        },
        { status: 400 }
      );
    }

    const { mode: _omitted, ...questionInput } = singleParsed.data;
    void _omitted;
    const created = createAdminQuestion(questionInput, auth.email);

    return NextResponse.json(
      {
        success: true,
        question: created,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Unable to process question action.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
