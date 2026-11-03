"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";
import { AdminMetrics } from "@/lib/types";
import { Button } from "@/components/Button";
import {
  formatDurationSeconds,
  formatPct,
} from "@/components/admin/formatters";

async function requestAdminMetrics(): Promise<AdminMetrics> {
  const res = await fetch("/api/admin/metrics", { cache: "no-store" });
  const data = (await res.json()) as {
    metrics?: AdminMetrics;
    error?: string;
  };
  if (!res.ok || !data.metrics) {
    throw new Error(data.error || "Unable to fetch dashboard metrics.");
  }
  return data.metrics;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const m = await requestAdminMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load metrics."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestAdminMetrics()
      .then((m) => {
        if (active) setMetrics(m);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load metrics."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#8A8178] font-mono">
            Control Centre · Executive Overview
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
            Live Telemetry &amp; Activity
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => void loadMetrics()}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/40 rounded-sm text-xs text-[#9E6B68]"
        >
          {errorMsg}
        </div>
      )}

      {metrics && !metrics.schemaReady && metrics.schemaNotice && (
        <div className="p-4 sm:p-5 bg-[#EFE4CE] border border-[#C9B795] rounded-sm flex items-start gap-3 text-xs text-[#26201A]">
          <AlertTriangle className="w-4 h-4 text-[#9E6B68] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold uppercase tracking-[0.14em] text-[11px]">
              Database Schema Notice ({metrics.storageBackend})
            </p>
            <p className="leading-relaxed">{metrics.schemaNotice}</p>
          </div>
        </div>
      )}

      {isLoading && !metrics ? (
        <div className="py-24 text-center text-xs uppercase tracking-[0.24em] text-[#8A8178]">
          Querying persisted telemetry...
        </div>
      ) : metrics ? (
        <>
          {/* Primary Real KPI Grid (9 exact metrics required by spec) */}
          <section aria-label="Key performance metrics">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <KpiCard
                label="Landing Visits"
                value={String(metrics.totalVisits)}
                sub="Recorded landing_view"
              />
              <KpiCard
                label="Unique Sessions"
                value={String(metrics.uniqueSessions)}
                sub="Persisted sessions"
              />
              <KpiCard
                label="Registered Players"
                value={String(metrics.registeredPlayers)}
                sub="Consented profiles"
              />
              <KpiCard
                label="Anonymous Sessions"
                value={String(metrics.anonymousPlayers)}
                sub="Unregistered runs"
              />
              <KpiCard
                label="Games Started"
                value={String(metrics.gamesStarted)}
                sub="Entered Prologue/Ch.1"
              />
              <KpiCard
                label="Games Completed"
                value={String(metrics.gamesCompleted)}
                sub="Finished all 6 chapters"
              />
              <KpiCard
                label="In Progress"
                value={String(metrics.gamesInProgress)}
                sub="Active unfinished runs"
              />
              <KpiCard
                label="Completion Rate"
                value={formatPct(metrics.completionRatePct)}
                sub="Completed / Started"
              />
              <KpiCard
                label="Avg Completion Time"
                value={formatDurationSeconds(
                  metrics.avgCompletionDurationSeconds
                )}
                sub="Start to Chapter 06 seal"
              />
              <KpiCard
                label="Storage Engine"
                value={
                  metrics.storageBackend === "supabase"
                    ? "Supabase PG"
                    : "Local Dev"
                }
                sub={metrics.schemaReady ? "RLS Active" : "Pending SQL"}
              />
            </div>
          </section>

          {/* Chapter Completion & Drop-Off Overview */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Chapter Progression &amp; Drop-Off Summary
                </h2>
                <p className="text-xs text-[#57524C]">
                  Measured strictly from persisted session and chapter event
                  records.
                </p>
              </div>
              <Link
                href="/admin/analytics"
                className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-[#545E4E] hover:text-[#1C1917] font-medium"
              >
                Full Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {metrics.uniqueSessions === 0 ? (
              <div className="py-10 text-center border border-dashed border-[#DDD4C5] rounded-sm space-y-1">
                <p className="text-sm font-medium text-[#1C1917]">
                  No gameplay sessions recorded yet.
                </p>
                <p className="text-xs text-[#8A8178]">
                  Complete a public playthrough to populate real chapter funnel
                  metrics.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                      <th className="py-2.5 pr-4">Chapter</th>
                      <th className="py-2.5 px-4">Started</th>
                      <th className="py-2.5 px-4">Completed</th>
                      <th className="py-2.5 px-4">Completion %</th>
                      <th className="py-2.5 px-4">Drop-Off %</th>
                      <th className="py-2.5 pl-4 text-right">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE6DA]">
                    {metrics.chapterAnalytics.map((row) => (
                      <tr key={row.chapter} className="hover:bg-[#F3EDE2]/50">
                        <td className="py-3 pr-4 font-medium text-[#1C1917]">
                          <span className="font-mono text-[#8A8178] mr-2">
                            0{row.chapter}
                          </span>
                          {row.title}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {row.sessionsStarted}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {row.sessionsCompleted}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#545E4E]">
                          {formatPct(row.completionRatePct)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#9E6B68]">
                          {formatPct(row.dropOffPct)}
                        </td>
                        <td className="py-3 pl-4 font-mono text-right">
                          {formatDurationSeconds(row.avgDurationSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick Control Navigation */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickNavCard
              href="/admin/players"
              icon={Users}
              title="Player Directory"
              description="Inspect consented player profiles, Instagram handles, and linked journeys."
            />
            <QuickNavCard
              href="/admin/sessions"
              icon={Activity}
              title="Session Inspector"
              description="Audit all registered and anonymous playthroughs with full event timelines."
            />
            <QuickNavCard
              href="/admin/analytics"
              icon={BarChart3}
              title="Behavioral Analytics"
              description="Compare choice distributions, puzzle accuracy, and campaign attribution."
            />
            <QuickNavCard
              href="/admin/settings"
              icon={Settings}
              title="Governance & Settings"
              description="Review deletion requests, RLS status, and environment configuration."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-4 flex flex-col justify-between gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
        {label}
      </span>
      <span className="font-serif text-2xl sm:text-3xl text-[#1C1917] leading-none">
        {value}
      </span>
      <span className="text-[11px] text-[#57524C]">{sub}</span>
    </div>
  );
}

function QuickNavCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-[#FAF7F2] border border-[#DDD4C5] hover:border-[#1C1917] rounded-sm p-5 flex flex-col justify-between gap-4 transition-colors"
    >
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 text-[#545E4E]" />
        <ArrowRight className="w-3.5 h-3.5 text-[#8A8178] group-hover:text-[#1C1917] group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-[#1C1917]">{title}</h3>
        <p className="text-xs text-[#57524C] leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
