import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminSessionsList } from "@/lib/storage";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const data = await getAdminSessionsList();
    return NextResponse.json({
      success: true,
      ...data,
      adminEmail: auth.email,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load sessions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

