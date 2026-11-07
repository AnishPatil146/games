import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedJuniorResult, getPublicJuniorCompletedResult } from "@/lib/services/platform-store";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  getSessionTokenFromRequest,
  mapServiceErrorToResponse,
} from "@/lib/session-cookie";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid attempt ID." }, { status: 400 });
  }

  const sessionToken = getSessionTokenFromRequest(req);

  try {
    // First attempt fast owner check via session token
    if (sessionToken) {
      try {
        const ownerResult = getAuthorizedJuniorResult({
          attemptId: id,
          sessionToken,
          isAdmin: false,
        });
        return NextResponse.json(ownerResult);
      } catch (innerErr: unknown) {
        const msg = innerErr instanceof Error ? innerErr.message : "";
        if (!msg.startsWith("FORBIDDEN:")) {
          throw innerErr;
        }
      }
    }

    // Fallback to server-side verified administrator allowlist check
    const adminAuth = await verifyAdminAccess();
    if (adminAuth.authorized) {
      const result = getAuthorizedJuniorResult({
        attemptId: id,
        sessionToken,
        isAdmin: true,
      });
      return NextResponse.json(result);
    }

    // Public Certificate Access: If the evaluation attempt has been submitted and completed,
    // allow read-only certificate monograph viewing so candidates can share and review scorecards.
    const completedResult = getPublicJuniorCompletedResult(id);
    if (completedResult) {
      return NextResponse.json(completedResult);
    }

    const result = getAuthorizedJuniorResult({
      attemptId: id,
      sessionToken,
      isAdmin: false,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to retrieve Junior Mode result."
    );
  }
}

