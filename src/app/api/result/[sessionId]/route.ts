import { NextRequest, NextResponse } from "next/server";
import { getPublicSessionDossier } from "@/lib/storage";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { sessionId } = await props.params;
    const cookieToken = req.cookies.get("the_unwritten_token")?.value;

    let authorizedDossier = cookieToken
      ? await getPublicSessionDossier(cookieToken)
      : null;

    const matchesRequestedSession =
      Boolean(authorizedDossier) &&
      (sessionId === "current" || authorizedDossier?.session.id === sessionId);

    let lookupKeyUsed = cookieToken || sessionId;

    if (!matchesRequestedSession) {
      // Allow the sole authenticated administrator to preview any session's public report
      const adminAuth = await verifyAdminAccess();
      if (!adminAuth.authorized) {
        return NextResponse.json(
          {
            error:
              "Forbidden: This personal dossier belongs to another browser session.",
          },
          { status: 403 }
        );
      }

      authorizedDossier = await getPublicSessionDossier(sessionId);
      lookupKeyUsed = sessionId;
    }

    if (!authorizedDossier) {
      return NextResponse.json(
        { error: "No recorded gameplay session was found for this identifier." },
        { status: 404 }
      );
    }

    const report = evaluateReport(
      authorizedDossier.session.id,
      authorizedDossier.playerDisplayName || "Anonymous Traveler",
      authorizedDossier.events,
      authorizedDossier.preferences,
      authorizedDossier.session.completed_at ||
        authorizedDossier.session.started_at,
      authorizedDossier.session.character_presentation
    );

    if (
      !authorizedDossier.session.result_archetype &&
      authorizedDossier.session.current_chapter >= 6
    ) {
      await getPublicSessionDossier(lookupKeyUsed, report.archetype);
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate gameplay report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
