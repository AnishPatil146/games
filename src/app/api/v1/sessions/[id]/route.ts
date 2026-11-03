import { NextRequest, NextResponse } from "next/server";
import { getPublicSessionDossier } from "@/lib/storage";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getSessionTokenFromRequest } from "@/lib/session-cookie";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid session identifier." }, { status: 400 });
  }

  const callerToken = getSessionTokenFromRequest(req);
  const callerDossier = callerToken
    ? await getPublicSessionDossier(callerToken)
    : null;

  const isOwner = callerDossier?.session.id === id;
  if (!isOwner) {
    const adminAuth = await verifyAdminAccess();
    if (!adminAuth.authorized) {
      return NextResponse.json(
        { error: "Access denied. Session belongs to another participant." },
        { status: 403 }
      );
    }
  }

  const targetDossier = isOwner
    ? callerDossier
    : await getPublicSessionDossier(id);

  if (!targetDossier) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({
    session: targetDossier.session,
    playerDisplayName: targetDossier.playerDisplayName,
    eventsCount: targetDossier.events.length,
  });
}

