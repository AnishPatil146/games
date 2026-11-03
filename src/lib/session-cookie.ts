import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const TOKEN_COOKIE_NAME = "the_unwritten_token";

export function generateSecureSessionToken(): string {
  return "uw_" + crypto.randomBytes(20).toString("hex");
}

export function getSessionTokenFromRequest(req: NextRequest): string | null {
  const raw = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (!raw || raw.length < 16) return null;
  return raw;
}

export function getOrIssueSessionToken(
  req: NextRequest,
  forceReset: boolean = false
): { token: string; isNew: boolean } {
  const existing = getSessionTokenFromRequest(req);
  if (existing && !forceReset) {
    return { token: existing, isNew: false };
  }
  return { token: generateSecureSessionToken(), isNew: true };
}

export function attachSessionTokenCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}

export function mapServiceErrorToResponse(
  err: unknown,
  fallbackMessage: string = "Request could not be completed."
): NextResponse {
  const raw = err instanceof Error ? err.message : fallbackMessage;
  if (raw.startsWith("NOT_FOUND:")) {
    return NextResponse.json(
      { error: raw.replace(/^NOT_FOUND:\s*/, "") },
      { status: 404 }
    );
  }
  if (raw.startsWith("FORBIDDEN:")) {
    return NextResponse.json(
      { error: raw.replace(/^FORBIDDEN:\s*/, "") },
      { status: 403 }
    );
  }
  if (raw.startsWith("PRECONDITION:")) {
    return NextResponse.json(
      { error: raw.replace(/^PRECONDITION:\s*/, "") },
      { status: 409 }
    );
  }
  if (
    raw.includes("Cannot publish") ||
    raw.includes("not active") ||
    raw.includes("at least 10 published") ||
    raw.includes("Invalid") ||
    raw.includes("not found")
  ) {
    return NextResponse.json({ error: raw }, { status: 400 });
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

