import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminSettingsData } from "@/lib/storage";

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
    return NextResponse.json({
      success: true,
      adminEmail: auth.email,
      adminUserId: auth.userId,
      settings,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

