import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminPlayersDirectory } from "@/lib/storage";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const data = await getAdminPlayersDirectory();
    return NextResponse.json({
      success: true,
      ...data,
      adminEmail: auth.email,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load player directory.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
