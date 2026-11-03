import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut().catch(() => {});
  } catch {
    // Ignore signout error
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("the_unwritten_admin_session");
  return response;
}

