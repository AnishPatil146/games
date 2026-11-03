import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { listParticipantsDirectory } from "@/lib/services/platform-store";

const DirectoryQuerySchema = z.object({
  search: z.string().max(100).optional(),
  modeFilter: z
    .enum(["all", "senior", "junior", "both", "anonymous"])
    .default("all"),
  sortBy: z
    .enum(["last_activity", "registration_date", "total_sessions"])
    .default("last_activity"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
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
  const parsed = DirectoryQuerySchema.safeParse({
    search: sp.get("search") || undefined,
    modeFilter: sp.get("modeFilter") || "all",
    sortBy: sp.get("sortBy") || "last_activity",
    page: sp.get("page") || 1,
    pageSize: sp.get("pageSize") || 15,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid directory query parameters." },
      { status: 400 }
    );
  }

  try {
    const directory = await listParticipantsDirectory(parsed.data);
    return NextResponse.json(directory);
  } catch {
    return NextResponse.json(
      { error: "Unable to load participants directory." },
      { status: 500 }
    );
  }
}

