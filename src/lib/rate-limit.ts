import { NextRequest } from "next/server";
import crypto from "crypto";

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();
const EPHEMERAL_SALT = crypto.randomBytes(16).toString("hex");

function cleanupExpired(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Ephemeral in-memory rate limiter for abuse protection on public write & auth routes.
 * Hashes request origin fingerprint in memory only; never stores or logs IP addresses.
 */
export function checkRateLimit(
  req: NextRequest,
  scope: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupExpired(now);

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const tokenCookie = req.cookies.get("the_unwritten_token")?.value || "";
  const hash = crypto
    .createHash("sha256")
    .update(`${EPHEMERAL_SALT}:${scope}:${forwarded}:${tokenCookie.slice(0, 12)}`)
    .digest("hex")
    .slice(0, 24);

  const existing = buckets.get(hash);
  if (!existing || existing.resetAt <= now) {
    buckets.set(hash, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

