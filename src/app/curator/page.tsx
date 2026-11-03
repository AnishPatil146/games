"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Compass,
  CheckCircle2,
  Clock,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
} from "lucide-react";
import { AdminMetrics } from "@/lib/types";
import { AdminNav } from "@/components/AdminNav";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/curator/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to load metrics");
        return res.json();
      })
      .then((data) => {
        setMetrics(data.metrics);
        setAdminEmail(data.adminEmail || "");
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-8 h-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin mb-4" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#78716C]">
            Loading Live Metrics...
          </p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-sm text-[#A37070]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs uppercase tracking-wider underline"
          >
            Retry Connection
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <AdminNav adminEmail={adminEmail} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-10">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D8] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
              Live Gameplay Telemetry
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Real-time records from Supabase PostgreSQL database. No fabricated metrics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/curator/players"
              className="px-4 py-2 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium hover:bg-[#2F2B28] transition-colors rounded flex items-center space-x-2"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Inspect Players</span>
            </Link>
          </div>
        </div>

        {/* 1. Core KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded border border-[#E0D7CB] bg-[#F4EFE7]">
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] block mb-1">
              Total Page Impressions
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-semibold text-[#1C1917]">
              {metrics?.totalVisits ?? 0}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-1">
              Landing & chapter views
            </span>
          </div>

          <div className="p-5 rounded border border-[#E0D7CB] bg-[#F4EFE7]">
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] block mb-1">
              Unique Game Sessions
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-semibold text-[#1C1917]">
              {metrics?.uniqueSessions ?? 0}
            </span>
            <div className="flex items-center space-x-2 mt-1 text-[10px] text-[#5B6356]">
              <span>{metrics?.registeredPlayers ?? 0} Registered</span>
              <span>•</span>
              <span>{metrics?.anonymousPlayers ?? 0} Anon</span>
            </div>
          </div>

          <div className="p-5 rounded border border-[#E0D7CB] bg-[#F4EFE7]">
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] block mb-1">
              Completed Journeys
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-semibold text-[#1C1917]">
              {metrics?.gamesCompleted ?? 0}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-1">
              {metrics?.gamesInProgress ?? 0} In Progress
            </span>
          </div>

          <div className="p-5 rounded border border-[#E0D7CB] bg-[#F4EFE7]">
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] block mb-1">
              Completion Rate
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-semibold text-[#1C1917]">
              {metrics?.completionRate ?? 0}%
            </span>
            <span className="text-[10px] text-[#5B6356] block mt-1">
              Completed / Started
            </span>
          </div>
        </div>

        {/* 2. Chapter Funnel & Drop-Off */}
        <div className="p-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-5">
          <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1C1917]">
                Chapter Progression & Funnel Retention
              </h2>
              <p className="text-xs text-[#78716C]">
                Monitors where players advance or drop off across the 6 narrative chapters.
              </p>
            </div>
            <Layers className="w-4 h-4 text-[#8C827A]" />
          </div>

          {metrics?.chapterDropOff && metrics.chapterDropOff.length > 0 ? (
            <div className="space-y-4">
              {metrics.chapterDropOff.map((ch) => {
                const total = metrics.uniqueSessions || 1;
                const percentage = Math.round((ch.sessionsReached / total) * 100);

                return (
                  <div key={ch.chapter} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#1C1917]">
                        Chapter 0{ch.chapter}: {ch.title}
                      </span>
                      <div className="flex items-center space-x-3 text-[#78716C]">
                        <span>{ch.sessionsReached} players ({percentage}%)</span>
                        {ch.dropOffPct > 0 && (
                          <span className="text-[#A37070] text-[11px]">
                            -{ch.dropOffPct}% drop
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-[#E8E2D8] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5B6356] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8C827A]">
              No chapter sessions recorded yet. Enter the experience to generate events.
            </div>
          )}
        </div>

        {/* 3. Puzzle & Timed Logic Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1C1917] flex items-center justify-between">
              <span>Puzzle & Challenge Telemetry</span>
              <Compass className="w-4 h-4 text-[#5B6356]" />
            </h2>

            {metrics?.puzzleStats && metrics.puzzleStats.length > 0 ? (
              <div className="space-y-4">
                {metrics.puzzleStats.map((pz) => (
                  <div
                    key={pz.chapter}
                    className="p-4 bg-[#FAF8F5] rounded border border-[#E0D7CB] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#1C1917]">
                      <span>{pz.puzzleName}</span>
                      <span className="text-[10px] text-[#5B6356] bg-[#EDF0EB] px-2 py-0.5 rounded">
                        Chapter 0{pz.chapter}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div>
                        <span className="text-[10px] text-[#78716C] block">Attempts</span>
                        <span className="font-semibold text-sm">{pz.totalAttempts}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#78716C] block">Accuracy</span>
                        <span className="font-semibold text-sm">{pz.successRate}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#78716C] block">Hints Used</span>
                        <span className="font-semibold text-sm">{pz.hintsUsedTotal}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8C827A]">No puzzle attempts recorded yet.</p>
            )}
          </div>

          {/* 4. Campaign Attribution */}
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1C1917] flex items-center justify-between">
              <span>Campaign & UTM Attribution</span>
              <TrendingDown className="w-4 h-4 text-[#5B6356]" />
            </h2>

            {metrics?.campaignAttribution && metrics.campaignAttribution.length > 0 ? (
              <div className="space-y-2">
                {metrics.campaignAttribution.map((camp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] rounded border border-[#E0D7CB] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1C1917]">
                        {camp.source || "direct"}
                      </span>
                      <span className="text-[10px] text-[#78716C] block">
                        Campaign: {camp.campaign} • Medium: {camp.medium}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#1C1917]">
                      {camp.count} sessions
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#8C827A] space-y-1">
                <p>No campaign attribution parameters recorded.</p>
                <p className="text-[11px] text-[#78716C]">
                  Test by visiting with <code>?utm_source=instagram&utm_medium=story&utm_campaign=the_unwritten</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
