import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminMetrics } from "@/lib/storage";
import { getUnifiedAdminAnalytics } from "@/lib/services/platform-store";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const [unified, seniorMetrics] = await Promise.all([
      getUnifiedAdminAnalytics(),
      getAdminMetrics(),
    ]);

    return NextResponse.json({
      ...unified,
      seniorMetrics,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to compute unified platform analytics." },
      { status: 500 }
    );
  }
}

