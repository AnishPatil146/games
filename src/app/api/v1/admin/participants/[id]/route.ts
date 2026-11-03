import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  getParticipantCentralProfile,
  getParticipantJuniorAttemptDetail,
  getParticipantJuniorDashboard,
  getParticipantSeniorDashboard,
} from "@/lib/services/platform-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: auth.statusCode || 401 }
    );
  }

  const { id } = await context.params;
  const view = req.nextUrl.searchParams.get("view") || "profile";
  const attemptId = req.nextUrl.searchParams.get("attemptId") || "";

  try {
    if (view === "junior" && attemptId) {
      const detail = await getParticipantJuniorAttemptDetail(id, attemptId);
      if (!detail) {
        return NextResponse.json(
          { error: "Participant attempt record not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(detail);
    }

    if (view === "junior") {
      const junior = await getParticipantJuniorDashboard(id);
      if (!junior) {
        return NextResponse.json(
          { error: "Participant not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(junior);
    }

    if (view === "senior") {
      const senior = await getParticipantSeniorDashboard(id);
      if (!senior) {
        return NextResponse.json(
          { error: "Participant not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(senior);
    }

    const profile = await getParticipantCentralProfile(id);
    if (!profile) {
      return NextResponse.json(
        { error: "Participant not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Unable to load participant dossier." },
      { status: 500 }
    );
  }
}

