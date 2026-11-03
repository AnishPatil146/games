import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getUnifiedAdminOverview } from "@/lib/services/platform-store";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const overview = await getUnifiedAdminOverview();
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json(
      { error: "Unable to load unified admin dashboard overview." },
      { status: 500 }
    );
  }
}

