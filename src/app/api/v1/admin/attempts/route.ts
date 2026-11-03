import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { listAllJuniorAttemptsAdmin } from "@/lib/services/platform-store";

const AttemptsQuerySchema = z.object({
  stream: z.enum(["science", "commerce", "arts"]).optional(),
  subjectSlug: z.string().max(80).optional(),
  status: z.enum(["in_progress", "completed", "abandoned"]).optional(),
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
  const parsed = AttemptsQuerySchema.safeParse({
    stream: sp.get("stream") || undefined,
    subjectSlug: sp.get("subjectSlug") || undefined,
    status: sp.get("status") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid attempts filter parameters." },
      { status: 400 }
    );
  }

  try {
    const attempts = await listAllJuniorAttemptsAdmin(parsed.data);
    return NextResponse.json({ attempts, total: attempts.length });
  } catch {
    return NextResponse.json(
      { error: "Unable to load Junior Mode attempts." },
      { status: 500 }
    );
  }
}

