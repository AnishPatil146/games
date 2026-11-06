import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/services/admin-auth-service";
import { getStateStoreTelemetry } from "@/lib/services/redis-state-store";
import { getMultiplayerStoreMetrics } from "@/lib/services/multiplayer-store";
import { pingDatabaseLatency, getCircuitBreakersReport } from "@/lib/services/db-performance";
import { getTrafficGuardTelemetry } from "@/lib/services/traffic-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Authenticate Administrator Session
  const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const verifiedSession = verifyAdminSessionToken(sessionCookie);

  if (!verifiedSession.valid) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Administrator authentication required." },
      { status: 401 }
    );
  }

  // 2. Query Live Process Memory & Uptime
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // 3. Ping Database Latency
  const dbPing = await pingDatabaseLatency();

  // 4. Gather State Store & Multiplayer Metrics
  const storeTelemetry = getStateStoreTelemetry();
  const mpMetrics = getMultiplayerStoreMetrics();

  // 5. Gather Security & Traffic Guard Metrics
  const trafficTelemetry = getTrafficGuardTelemetry();
  const circuitBreakers = getCircuitBreakersReport();

  // 6. Overall System Health Synthesis
  let overallHealth: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";
  if (!dbPing.connected || trafficTelemetry.backpressureActive) {
    overallHealth = "DEGRADED";
  }
  if (dbPing.circuitState === "OPEN") {
    overallHealth = "CRITICAL";
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    systemHealth: overallHealth,
    server: {
      runtime: "Node.js (Serverless Lambda)",
      nodeVersion: process.version,
      region: process.env.VERCEL_REGION || "iad1",
      uptimeSeconds,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      },
    },
    database: {
      provider: "Supabase PostgreSQL",
      connectionMode: "Supavisor Transaction Pooler (Port 6543)",
      connected: dbPing.connected,
      latencyMs: dbPing.latencyMs,
      circuitState: dbPing.circuitState,
      targetLatencyMs: 100,
    },
    stateStore: {
      tier: storeTelemetry.tier,
      l1CacheSize: storeTelemetry.l1CacheSize,
      activeLocksCount: storeTelemetry.activeLocksCount,
      reconnectTokensCount: storeTelemetry.reconnectTokensCount,
      rateLimitEntriesCount: storeTelemetry.rateLimitEntriesCount,
    },
    multiplayer: {
      activeRooms: mpMetrics.activeRoomsCount,
      inProgressRooms: mpMetrics.inProgressRoomsCount,
      connectedPlayers: mpMetrics.totalPlayersCount,
      maxPlayersPerRoom: 4,
      boardType: "6x6 Sudoku with 2x3 Subgrids",
    },
    traffic: {
      totalRateLimitDrops: trafficTelemetry.totalRateLimitDrops,
      backpressureActive: trafficTelemetry.backpressureActive,
      estimatedP95LatencyMs: dbPing.latencyMs + 45,
      estimatedP99LatencyMs: dbPing.latencyMs + 95,
      recentIncidents: trafficTelemetry.recentIncidents.slice(0, 10),
    },
    circuitBreakers,
  });
}
