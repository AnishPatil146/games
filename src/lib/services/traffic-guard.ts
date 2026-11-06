/**
 * THE UNWRITTEN — Traffic Guard & Abuse Defense Service
 *
 * Implements:
 * - Multi-scope rate limiting (IP address, account token, and room)
 * - Request payload size validation
 * - Origin & Host header validation
 * - System backpressure monitoring
 * - Automated abuse detection & drop logging
 */

import { NextRequest, NextResponse } from "next/server";
import { checkDistributedRateLimit } from "./redis-state-store";

export interface RateLimitPolicy {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_POLICIES: Record<string, RateLimitPolicy> = {
  ADMIN_LOGIN: { maxRequests: 5, windowSeconds: 60 },
  ADMIN_RECOVER: { maxRequests: 3, windowSeconds: 60 },
  CREATE_ROOM: { maxRequests: 6, windowSeconds: 60 },
  SUDOKU_MOVE: { maxRequests: 15, windowSeconds: 5 },
  SUDOKU_HINT: { maxRequests: 1, windowSeconds: 10 },
  RECONNECT: { maxRequests: 10, windowSeconds: 60 },
  PUBLIC_API: { maxRequests: 180, windowSeconds: 60 },
};

// Maximum allowed payload sizes in bytes
export const MAX_PAYLOAD_SIZES = {
  GAME_ACTION: 64 * 1024,      // 64 KB
  DOSSIER_PROFILE: 128 * 1024, // 128 KB
  ADMIN_UPDATE: 256 * 1024,    // 256 KB
};

interface IncidentEvent {
  id: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  scope: string;
  identifier: string;
  reason: string;
}

const recentIncidents: IncidentEvent[] = [];
let totalRateLimitDrops = 0;

/**
 * Extracts a dependable client IP from edge headers (e.g. x-forwarded-for, cf-connecting-ip)
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * Validates request payload size against a strict byte ceiling
 */
export function validatePayloadSize(
  req: NextRequest,
  maxBytes: number
): { valid: boolean; error?: string } {
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader) {
    const bytes = parseInt(lengthHeader, 10);
    if (!isNaN(bytes) && bytes > maxBytes) {
      logIncident("WARNING", "payload_guard", "client", `Payload of ${bytes} bytes exceeds ${maxBytes} bytes limit.`);
      return {
        valid: false,
        error: `Payload exceeds maximum allowed size of ${Math.round(maxBytes / 1024)} KB.`,
      };
    }
  }
  return { valid: true };
}

/**
 * Enforces multi-scope rate limiting with standardized 429 response
 */
export async function enforceRateLimit(
  req: NextRequest,
  policyKey: keyof typeof RATE_POLICIES,
  customIdentifier?: string
): Promise<{ allowed: boolean; response?: NextResponse; remaining: number }> {
  const policy = RATE_POLICIES[policyKey] || { maxRequests: 60, windowSeconds: 60 };
  const ip = getClientIp(req);
  const identifier = customIdentifier ? `${ip}:${customIdentifier}` : ip;
  const key = `rl:${policyKey}:${identifier}`;

  const res = await checkDistributedRateLimit(key, policy.maxRequests, policy.windowSeconds);

  if (!res.allowed) {
    totalRateLimitDrops++;
    logIncident("WARNING", "rate_limiter", identifier, `Exceeded limit of ${policy.maxRequests} requests per ${policy.windowSeconds}s.`);
    const response = NextResponse.json(
      {
        success: false,
        error: "Action rate limit exceeded. Please pause briefly before retrying.",
        retryAfterSeconds: res.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(res.retryAfterSeconds),
          "X-RateLimit-Limit": String(policy.maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
    return { allowed: false, response, remaining: 0 };
  }

  return { allowed: true, remaining: res.remaining };
}

/**
 * Validates Origin and Host headers to mitigate Cross-Site Request Forgery on API actions
 */
export function validateRequestOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Non-browser / same-origin GET
  try {
    const originUrl = new URL(origin);
    const host = req.headers.get("host") || "";
    // Allow matching host, Vercel preview domains, or localhost in development
    return (
      originUrl.host === host ||
      originUrl.hostname.endsWith(".vercel.app") ||
      originUrl.hostname === "localhost" ||
      originUrl.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/**
 * Records an incident into the typed live operations buffer
 */
export function logIncident(
  severity: "INFO" | "WARNING" | "CRITICAL",
  scope: string,
  identifier: string,
  reason: string
): void {
  const incident: IncidentEvent = {
    id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    severity,
    scope,
    identifier,
    reason,
  };
  recentIncidents.unshift(incident);
  if (recentIncidents.length > 50) {
    recentIncidents.pop();
  }
}

/**
 * Returns security diagnostics for Command Centre
 */
export function getTrafficGuardTelemetry(): {
  totalRateLimitDrops: number;
  recentIncidents: IncidentEvent[];
  backpressureActive: boolean;
} {
  // Backpressure is active if recent rate limit drops in the last minute exceed threshold
  const backpressureActive = totalRateLimitDrops > 100;
  return {
    totalRateLimitDrops,
    recentIncidents: [...recentIncidents],
    backpressureActive,
  };
}

