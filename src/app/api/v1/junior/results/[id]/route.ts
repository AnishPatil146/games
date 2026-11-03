import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedJuniorResult } from "@/lib/services/platform-store";
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
    const result = getAuthorizedJuniorResult({
      attemptId: id,
      sessionToken,
      isAdmin: adminAuth.authorized,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to retrieve Junior Mode result."
    );
  }
}

