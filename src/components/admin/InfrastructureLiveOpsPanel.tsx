"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Server,
  Database,
  ShieldAlert,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface InfrastructureTelemetry {
  timestamp: string;
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  server: {
    runtime: string;
    nodeVersion: string;
    region: string;
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
  database: {
    provider: string;
    connectionMode: string;
    connected: boolean;
    latencyMs: number;
    circuitState: string;
    targetLatencyMs: number;
  };
  stateStore: {
    tier: string;
    l1CacheSize: number;
    activeLocksCount: number;
    reconnectTokensCount: number;
    rateLimitEntriesCount: number;
  };
  multiplayer: {
    activeRooms: number;
    inProgressRooms: number;
    connectedPlayers: number;
    maxPlayersPerRoom: number;
    boardType: string;
  };
  traffic: {
    totalRateLimitDrops: number;
    backpressureActive: boolean;
    estimatedP95LatencyMs: number;
    estimatedP99LatencyMs: number;
    recentIncidents: {
      id: string;
      timestamp: string;
      severity: string;
      scope: string;
      reason: string;
    }[];
  };
}

export function InfrastructureLiveOpsPanel() {
  const [data, setData] = useState<InfrastructureTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetch("/api/admin/infrastructure")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: InfrastructureTelemetry | null) => {
        if (json) {
          setData(json);
          setLastRefreshedAt(new Date().toLocaleTimeString());
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      fetch("/api/admin/infrastructure")
        .then((res) => (res.ok ? res.json() : null))
        .then((json: InfrastructureTelemetry | null) => {
          if (isMounted && json) {
            setData(json);
            setLastRefreshedAt(new Date().toLocaleTimeString());
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    load();
    const interval = setInterval(load, 10_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-xs font-mono text-[#8A8178] animate-pulse">
        Initializing Live Operations &amp; Infrastructure Telemetry...
      </div>
    );
  }

  const isHealthy = data.systemHealth === "HEALTHY";

  return (
    <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-6">
      {/* 1. Header with Live Status & Refresh Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD4C5] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <h2 className="font-serif text-lg text-[#1C1917] tracking-tight">
              Live Operations &amp; Infrastructure Command
            </h2>
          </div>
          <p className="text-[11px] font-mono text-[#8A8178]">
            Real-time serverless concurrency, database latency, and distributed state telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8A8178]">
            Updated: {lastRefreshedAt || "Just now"}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-[11px] font-mono uppercase tracking-wider text-[#1C1917] hover:bg-[#E7E0D3] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 text-[#545E4E] ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#57524C]">
            <span>System Health</span>
            <Activity className="w-3.5 h-3.5 text-[#545E4E]" />
          </div>
          <p
            className={`font-serif text-xl sm:text-2xl ${
              isHealthy ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {data.systemHealth}
          </p>
          <span className="text-[10px] font-mono text-[#8A8178]">
            {isHealthy ? "All Subsystems Nominal" : "Throttled / Degraded Mode"}
          </span>
        </div>

        {/* Database Latency */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#57524C]">
            <span>Database Latency</span>
            <Database className="w-3.5 h-3.5 text-[#545E4E]" />
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#1C1917]">
            {data.database.latencyMs} <span className="text-xs font-mono">ms</span>
          </p>
          <span className="text-[10px] font-mono text-[#8A8178]">
            {data.database.connectionMode.split(" ")[0]} · Target &lt; 100ms
          </span>
        </div>

        {/* Active Multiplayer Rooms */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#57524C]">
            <span>Active Rooms</span>
            <Zap className="w-3.5 h-3.5 text-[#545E4E]" />
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#1C1917]">
            {data.multiplayer.activeRooms}{" "}
            <span className="text-xs font-mono font-normal text-[#57524C]">
              ({data.multiplayer.connectedPlayers} Players)
            </span>
          </p>
          <span className="text-[10px] font-mono text-[#8A8178]">
            {data.multiplayer.inProgressRooms} in-progress chambers
          </span>
        </div>

        {/* Process Memory RSS */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#57524C]">
            <span>Memory RSS</span>
            <Cpu className="w-3.5 h-3.5 text-[#545E4E]" />
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#1C1917]">
            {data.server.memory.rssMb} <span className="text-xs font-mono">MB</span>
          </p>
          <span className="text-[10px] font-mono text-[#8A8178]">
            Heap: {data.server.memory.heapUsedMb} MB / {data.server.memory.heapTotalMb} MB
          </span>
        </div>
      </div>

      {/* 3. Detailed Subsystem Diagnostica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Tier Coordination & Performance SLOs */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-2.5">
          <p className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#545E4E]" />
            <span>State Store &amp; Performance SLOs</span>
          </p>
          <div className="space-y-1.5 text-[#57524C] pt-1 border-t border-[#DDD4C5]">
            <div className="flex justify-between">
              <span>Coordination Engine:</span>
              <span className="font-bold text-[#1C1917]">{data.stateStore.tier}</span>
            </div>
            <div className="flex justify-between">
              <span>L1 Memory Cache:</span>
              <span className="text-[#1C1917]">{data.stateStore.l1CacheSize} active snapshots</span>
            </div>
            <div className="flex justify-between">
              <span>Active Cell Locks (SETNX):</span>
              <span className="text-[#1C1917]">{data.stateStore.activeLocksCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated API p95 / p99:</span>
              <span className="text-[#1C1917]">
                {data.traffic.estimatedP95LatencyMs}ms / {data.traffic.estimatedP99LatencyMs}ms
              </span>
            </div>
          </div>
        </div>

        {/* Security & Abuse Defense */}
        <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-2.5">
          <p className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#545E4E]" />
            <span>Security &amp; Abuse Defense</span>
          </p>
          <div className="space-y-1.5 text-[#57524C] pt-1 border-t border-[#DDD4C5]">
            <div className="flex justify-between">
              <span>Rate Limit Drops (Total):</span>
              <span className="font-bold text-[#1C1917]">{data.traffic.totalRateLimitDrops}</span>
            </div>
            <div className="flex justify-between">
              <span>Backpressure State:</span>
              <span
                className={`font-bold ${
                  data.traffic.backpressureActive ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {data.traffic.backpressureActive ? "ACTIVE (Throttling)" : "NOMINAL"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Server Uptime:</span>
              <span className="text-[#1C1917]">{Math.floor(data.server.uptimeSeconds / 60)} min</span>
            </div>
            <div className="flex justify-between">
              <span>Active Reconnect Tokens:</span>
              <span className="text-[#1C1917]">{data.stateStore.reconnectTokensCount} operatives</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Incidents / Telemetry Log */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A8178]">
          Operational Incident Timeline &amp; Event Stream
        </p>
        {data.traffic.recentIncidents.length === 0 ? (
          <div className="p-3 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-xs font-mono text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero operational incidents detected in active window. All services nominal.</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {data.traffic.recentIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-2.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-[11px] font-mono flex items-center justify-between gap-4 text-[#57524C]"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="font-bold text-[#1C1917]">[{inc.scope.toUpperCase()}]</span>
                  <span>{inc.reason}</span>
                </div>
                <span className="text-[10px] text-[#8A8178] shrink-0">
                  {new Date(inc.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
