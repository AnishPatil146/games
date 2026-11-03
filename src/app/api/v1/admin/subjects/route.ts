import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  listAcademicStreams,
  listAcademicSubjects,
  upsertAcademicSubject,
} from "@/lib/services/platform-store";

const UpsertSubjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, or hyphens."),
  stream: z.enum(["science", "commerce", "arts"]),
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(1).max(20),
  description: z.string().trim().min(4).max(400),
  isElective: z.boolean(),
  active: z.boolean(),
  chapters: z
    .array(
      z.object({
        number: z.number().int().min(1).max(50),
        title: z.string().trim().min(2).max(160),
      })
    )
    .optional(),
});

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  return NextResponse.json({
    streams: listAcademicStreams(),
    subjects: listAcademicSubjects({ includeInactive: true }),
  });
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
    const parsed = UpsertSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid subject configuration payload.",
        },
        { status: 400 }
      );
    }

    const updated = upsertAcademicSubject(parsed.data, auth.email);
    return NextResponse.json({
      success: true,
      subject: updated,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to save subject configuration." },
      { status: 500 }
    );
  }
}

