import { NextRequest, NextResponse } from "next/server";
import { getPublicSessionDossier } from "@/lib/storage";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { sessionId } = await props.params;
    const cookieToken = req.cookies.get("the_unwritten_token")?.value;

    const lookupTarget =
      sessionId === "current" && cookieToken ? cookieToken : sessionId;

    if (!lookupTarget) {
      return NextResponse.json(
        { error: "Session identifier is required." },
        { status: 400 }
      );
    }

    const dossier = await getPublicSessionDossier(lookupTarget);
    if (!dossier) {
      return NextResponse.json(
        { error: "No recorded gameplay session was found for this identifier." },
        { status: 404 }
      );
    }

    const report = evaluateReport(
      dossier.session.id,
      dossier.playerDisplayName || "Anonymous Traveler",
      dossier.events,
      dossier.preferences,
      dossier.session.completed_at || dossier.session.started_at,
      dossier.session.character_presentation
    );

    if (!dossier.session.result_archetype && dossier.session.current_chapter >= 6) {
      await getPublicSessionDossier(lookupTarget, report.archetype);
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
