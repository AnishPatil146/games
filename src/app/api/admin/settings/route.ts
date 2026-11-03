import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminSettingsData } from "@/lib/storage";
import { listAdminAuditLogs } from "@/lib/services/platform-store";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const settings = await getAdminSettingsData();
    const auditLogs = listAdminAuditLogs(40);
    return NextResponse.json({
      success: true,
      adminEmail: auth.email,
      adminUserId: auth.userId,
      settings,
      auditLogs,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

