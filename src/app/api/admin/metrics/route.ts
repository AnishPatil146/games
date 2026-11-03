import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminMetrics } from "@/lib/storage";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Administrator access unauthorized" },
      { status: 401 }
    );
  }

  try {
    const metrics = await getAdminMetrics();
    return NextResponse.json({ success: true, metrics, adminEmail: auth.email });
  } catch (err: any) {
    console.error("Error retrieving admin metrics:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load metrics" },
      { status: 500 }
    );
  }
}

