"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AdminMetrics } from "@/lib/types";
import { Button } from "@/components/Button";
import {
  formatDurationSeconds,
  formatPct,
} from "@/components/admin/formatters";

async function requestAnalyticsMetrics(): Promise<AdminMetrics> {
  const res = await fetch("/api/admin/metrics", { cache: "no-store" });
  const data = (await res.json()) as {
    metrics?: AdminMetrics;
    error?: string;
  };
  if (!res.ok || !data.metrics) {
    throw new Error(data.error || "Unable to load analytics.");
  }
  return data.metrics;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const m = await requestAnalyticsMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestAnalyticsMetrics()
      .then((m) => {
        if (active) setMetrics(m);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load data."
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

  const maxChapterStarted = Math.max(
    1,
    ...(metrics?.chapterAnalytics.map((c) => c.sessionsStarted) || [1])
  );
  const maxChapterDuration = Math.max(
    1,
    ...(metrics?.chapterAnalytics.map((c) => c.avgDurationSeconds || 0) || [1])
  );

  const totalIdentityCount = metrics
    ? metrics.registeredPlayers + metrics.anonymousPlayers
    : 0;
  const registeredSharePct =
    metrics && totalIdentityCount > 0
      ? Math.round((metrics.registeredPlayers / totalIdentityCount) * 100)
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#8A8178] font-mono">
            Control Centre · Empirical Behavioral Analytics
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
            Narrative &amp; Puzzle Analytics
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => void loadAnalytics()}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {errorMsg && (
        <p className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/35 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg}
        </p>
      )}

      {isLoading && !metrics ? (
        <div className="py-24 text-center text-xs uppercase tracking-[0.24em] text-[#8A8178]">
          Computing analytics from persisted records...
        </div>
      ) : metrics ? (
        <>
          {/* 1. Chapter Engagement & Drop-Off + Average Chapter Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
              <div>
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Chapter Engagement &amp; Drop-Off
                </h2>
                <p className="text-xs text-[#57524C]">
                  Sessions started vs. completed per chapter, with exact drop-off
                  rates.
                </p>
              </div>

              <div className="space-y-4">
                {metrics.chapterAnalytics.map((ch) => {
                  const startWidth = Math.round(
                    (ch.sessionsStarted / maxChapterStarted) * 100
                  );
                  const completeWidth = Math.round(
                    (ch.sessionsCompleted / maxChapterStarted) * 100
                  );
                  return (
                    <div key={ch.chapter} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#1C1917]">
                          0{ch.chapter}. {ch.title}
                        </span>
                        <span className="font-mono text-[11px] text-[#57524C]">
                          {ch.sessionsCompleted}/{ch.sessionsStarted} · Drop:{" "}
                          <strong className="text-[#9E6B68]">
                            {formatPct(ch.dropOffPct)}
                          </strong>
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 100 6"
                        preserveAspectRatio="none"
                        className="w-full h-2.5 bg-[#EDE6DA] rounded-xs overflow-hidden block"
                        role="img"
                        aria-label={`Chapter ${ch.chapter}: ${ch.sessionsCompleted} of ${ch.sessionsStarted} completed`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width={startWidth}
                          height="6"
                          fill="#C9B79B"
                        />
                        <rect
                          x="0"
                          y="0"
                          width={completeWidth}
                          height="6"
                          fill="#545E4E"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. Average Chapter Duration */}
            <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
              <div>
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Average Chapter Duration
                </h2>
                <p className="text-xs text-[#57524C]">
                  Mean measured dwell time per chapter (shows &ldquo;—&rdquo;
                  until measured).
                </p>
              </div>

              <div className="space-y-4">
                {metrics.chapterAnalytics.map((ch) => {
                  const widthPct =
                    ch.avgDurationSeconds !== null
                      ? Math.max(
                          4,
                          Math.round(
                            (ch.avgDurationSeconds / maxChapterDuration) * 100
                          )
                        )
                      : 0;
                  return (
                    <div key={ch.chapter} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#1C1917]">
                          0{ch.chapter}. {ch.title}
                        </span>
                        <span className="font-mono text-[11px] text-[#1C1917]">
                          {formatDurationSeconds(ch.avgDurationSeconds)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#EDE6DA] rounded-xs overflow-hidden">
                        <div
                          className="h-full bg-[#1C1917] transition-all duration-300"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 3. Puzzle Completion & Accuracy (Chapters 02 & 05) */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
            <div>
              <h2 className="font-serif text-xl text-[#1C1917]">
                Puzzle Completion &amp; Accuracy
              </h2>
              <p className="text-xs text-[#57524C]">
                Empirical solve rates, attempt accuracy, hint reliance, and
                average solve speed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.puzzleAnalytics.map((pz) => (
                <div
                  key={pz.chapter}
                  className="p-5 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2.5">
                    <span className="font-serif text-lg text-[#1C1917]">
                      Ch. 0{pz.chapter} · {pz.puzzleName}
                    </span>
                    <span className="font-mono text-xs text-[#545E4E]">
                      Solved: {pz.sessionsSolved}/{pz.sessionsAttempted}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[#8A8178]">
                        Completion
                      </dt>
                      <dd className="font-mono text-base text-[#1C1917] mt-0.5">
                        {formatPct(pz.completionRatePct)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[#8A8178]">
                        Attempt Accuracy
                      </dt>
                      <dd className="font-mono text-base text-[#1C1917] mt-0.5">
                        {formatPct(pz.accuracyRatePct)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[#8A8178]">
                        Hints Used
                      </dt>
                      <dd className="font-mono text-base text-[#1C1917] mt-0.5">
                        {pz.hintsUsedTotal}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[#8A8178]">
                        Avg Solve Time
                      </dt>
                      <dd className="font-mono text-base text-[#1C1917] mt-0.5">
                        {pz.avgSolveSeconds !== null
                          ? `${pz.avgSolveSeconds}s`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Most Selected Choices & 5. Registered vs Anonymous + Archetypes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
              <div>
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Most Selected Narrative Choices
                </h2>
                <p className="text-xs text-[#57524C]">
                  Ranked across persisted <code>choice_selected</code> events.
                </p>
              </div>

              {metrics.choiceDistributions.length === 0 ? (
                <p className="text-xs text-[#8A8178] py-8 text-center">
                  No narrative choices recorded yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {metrics.choiceDistributions.slice(0, 10).map((item) => (
                    <li
                      key={`${item.chapter}-${item.choiceKey}`}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="text-[#1C1917] truncate">
                          <span className="font-mono text-[#8A8178] mr-1.5">
                            Ch.0{item.chapter}
                          </span>
                          {item.choiceLabel}
                        </span>
                        <span className="font-mono text-[11px] text-[#57524C] shrink-0">
                          {item.count} ({item.sharePct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE6DA] rounded-xs overflow-hidden">
                        <div
                          className="h-full bg-[#545E4E]"
                          style={{ width: `${item.sharePct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="space-y-6">
              {/* Registered vs Anonymous Participation */}
              <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Registered vs. Anonymous Participation
                </h2>

                {totalIdentityCount === 0 ? (
                  <p className="text-xs text-[#8A8178]">
                    No sessions recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span>
                        Registered Profiles:{" "}
                        <strong>{metrics.registeredPlayers}</strong>
                      </span>
                      <span>
                        Anonymous Runs:{" "}
                        <strong>{metrics.anonymousPlayers}</strong>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#DDD4C5] rounded-xs overflow-hidden flex">
                      <div
                        className="bg-[#1C1917] h-full"
                        style={{ width: `${registeredSharePct || 0}%` }}
                      />
                      <div
                        className="bg-[#8FA184] h-full"
                        style={{ width: `${100 - (registeredSharePct || 0)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#57524C]">
                      {registeredSharePct !== null
                        ? `${registeredSharePct}% signed with explicit consent · ${
                            100 - registeredSharePct
                          }% played anonymously.`
                        : "—"}
                    </p>
                  </div>
                )}
              </section>

              {/* Archetype Distribution */}
              <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
                <h2 className="font-serif text-xl text-[#1C1917]">
                  Completed Archetype Distribution
                </h2>
                {metrics.archetypeDistribution.length === 0 ? (
                  <p className="text-xs text-[#8A8178]">
                    Complete a 6-chapter playthrough to populate archetype
                    counts.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#EDE6DA] text-xs">
                    {metrics.archetypeDistribution.map((item) => (
                      <li
                        key={item.archetype}
                        className="py-2 flex items-center justify-between"
                      >
                        <span className="font-serif text-sm text-[#1C1917]">
                          {item.archetype}
                        </span>
                        <span className="font-mono font-medium">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>

          {/* 6. Campaign Attribution */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
            <div>
              <h2 className="font-serif text-xl text-[#1C1917]">
                Campaign &amp; Referral Attribution
              </h2>
              <p className="text-xs text-[#57524C]">
                Grouped by <code>utm_source</code>, <code>utm_medium</code>, and{" "}
                <code>utm_campaign</code> (defaults to <code>direct</code> when
                absent).
              </p>
            </div>

            {metrics.campaignAttribution.length === 0 ? (
              <p className="text-xs text-[#8A8178]">
                No session attribution records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                      <th className="py-2.5 pr-4">Source</th>
                      <th className="py-2.5 px-4">Medium</th>
                      <th className="py-2.5 px-4">Campaign</th>
                      <th className="py-2.5 px-4">Sessions</th>
                      <th className="py-2.5 pl-4 text-right">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE6DA]">
                    {metrics.campaignAttribution.map((row) => (
                      <tr
                        key={`${row.source}-${row.medium}-${row.campaign}`}
                        className="hover:bg-[#F3EDE2]/45"
                      >
                        <td className="py-3 pr-4 font-mono text-[#1C1917]">
                          {row.source}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#57524C]">
                          {row.medium}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#57524C]">
                          {row.campaign}
                        </td>
                        <td className="py-3 px-4 font-mono">{row.sessions}</td>
                        <td className="py-3 pl-4 font-mono text-right text-[#545E4E]">
                          {row.completed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
