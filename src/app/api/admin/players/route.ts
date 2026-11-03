import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getAdminPlayersList } from "@/lib/storage";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Administrator access unauthorized" },
      { status: 401 }
    );
  }

  try {
    const players = await getAdminPlayersList();
    return NextResponse.json({ success: true, players, adminEmail: auth.email });
  } catch (err: any) {
    console.error("Error retrieving players:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load players" },
      { status: 500 }
    );
  }
}

