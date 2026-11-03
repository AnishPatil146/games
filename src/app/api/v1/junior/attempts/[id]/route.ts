import { NextRequest, NextResponse } from "next/server";
import { getPublicJuniorAttemptState } from "@/lib/services/platform-store";
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

  const token = getSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { error: "Active participant session required." },
      { status: 401 }
    );
  }

  try {
    const state = getPublicJuniorAttemptState(id, token);
    return NextResponse.json(state);
  } catch (err: unknown) {
    return mapServiceErrorToResponse(
      err,
      "Unable to retrieve Junior Mode attempt."
    );
  }
}

