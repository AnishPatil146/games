"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ParticipantBreadcrumbs } from "@/components/admin/ParticipantBreadcrumbs";
import {
  formatDateTime,
  formatDurationSeconds,
} from "@/components/admin/formatters";
import {
  AbilityIndicatorEvaluation,
  JuniorDescriptiveProfile,
  StreamSlug,
} from "@/lib/platform-types";

interface ParticipantJuniorDashboardData {
  participant: {
    participantId: string;
    username: string;
    fullName: string;
    isAnonymous: boolean;
  };
  header: {
    streams: StreamSlug[];
    primaryStreamName: string;
    firstParticipationAt: string | null;
    mostRecentAttemptAt: string | null;
  };
  summaryCards: {
    totalAttempts: number;
    completedAttempts: number;
    totalQuestionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    avgScoreOutOf10: number | null;
    overallAccuracyPct: number | null;
    completedSubjectsCount: number;
  };
  subjectPerformance: {
    subjectSlug: string;
    subjectName: string;
    stream: StreamSlug;
    attemptsCount: number;
    avgScoreOutOf10: number;
    highestScoreOutOf10: number;
    latestScoreOutOf10: number;
    accuracyPct: number;
    chaptersCoveredCount: number;
    chaptersSample: string[];
  }[];
  scoreTrendSeries: {
    index: number;
    attemptId: string;
    subjectName: string;
    scoreOutOf10: number;
    accuracyPct: number;
    completedAt: string;
  }[];
  abilityAnalysisByStream: {
    stream: StreamSlug;
    streamName: string;
    indicators: AbilityIndicatorEvaluation[];
  }[];
  latestDescriptiveProfile: JuniorDescriptiveProfile | null;
  attemptHistory: {
    attemptId: string;
    subjectSlug: string;
    subjectName: string;
    stream: StreamSlug;
    attemptNumber: number;
    scoreOutOf10: number | null;
    accuracyPct: number | null;
    startedAt: string;
    completedAt: string | null;
    durationSeconds: number | null;
    status: string;
  }[];
}

export default function ParticipantJuniorDashboardPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const [data, setData] = useState<ParticipantJuniorDashboardData | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/admin/participants/${encodeURIComponent(
            playerId
          )}?view=junior`
        );
        if (res.ok) {
          const json = (await res.json()) as ParticipantJuniorDashboardData;
          if (active) setData(json);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Individual Junior Mode Analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl">Participant not found.</p>
      </div>
    );
  }

  const encPlayer = encodeURIComponent(data.participant.participantId);
  const filteredAttempts =
    subjectFilter === "all"
      ? data.attemptHistory
      : data.attemptHistory.filter((a) => a.subjectSlug === subjectFilter);

  const totalAnswered =
    data.summaryCards.correctAnswers + data.summaryCards.incorrectAnswers;
  const correctRatioPct =
    totalAnswered > 0
      ? Math.round((data.summaryCards.correctAnswers / totalAnswered) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <ParticipantBreadcrumbs
        participant={data.participant}
        activeTab="junior"
        extraCrumbs={[{ label: "Junior Mode Dashboard" }]}
      />

      {/* 1. SUMMARY METRIC CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Stream(s)
          </span>
          <span className="font-serif text-lg text-[#1C1917] mt-1 block">
            {data.header.primaryStreamName}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Attempts
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.summaryCards.completedAttempts}/{data.summaryCards.totalAttempts}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Avg Score
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.summaryCards.avgScoreOutOf10 !== null
              ? `${data.summaryCards.avgScoreOutOf10}/10`
              : "—"}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Accuracy
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.summaryCards.overallAccuracyPct !== null
              ? `${data.summaryCards.overallAccuracyPct}%`
              : "—"}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Correct / Wrong
          </span>
          <span className="font-mono text-sm text-[#1C1917] mt-2 block">
            {data.summaryCards.correctAnswers} /{" "}
            {data.summaryCards.incorrectAnswers}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Subjects
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.summaryCards.completedSubjectsCount}
          </span>
        </div>
      </section>

      {/* 2. VISUAL CHARTS: SCORE PROGRESSION + CORRECT/INCORRECT RATIO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-[#1C1917]">
              Score Progression Across Attempts
            </h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Scale 0–10
            </span>
          </div>

          {data.scoreTrendSeries.length === 0 ? (
            <p className="text-xs text-[#8A8178] py-8 text-center">
              No completed Junior attempts yet for this participant.
            </p>
          ) : (
            <svg
              viewBox="0 0 460 150"
              className="w-full h-40"
              role="img"
              aria-label="Participant score progression chart across Junior attempts"
            >
              <line x1="36" y1="125" x2="440" y2="125" stroke="#CFC5B4" strokeWidth="1" />
              <line x1="36" y1="20" x2="36" y2="125" stroke="#CFC5B4" strokeWidth="1" />
              <text x="12" y="25" fontSize="9" fontFamily="monospace" fill="#8A8178">
                10
              </text>
              <text x="16" y="75" fontSize="9" fontFamily="monospace" fill="#8A8178">
                5
              </text>
              <text x="16" y="125" fontSize="9" fontFamily="monospace" fill="#8A8178">
                0
              </text>

              {data.scoreTrendSeries.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#545E4E"
                  strokeWidth="2"
                  points={data.scoreTrendSeries
                    .map((pt, idx) => {
                      const x =
                        56 +
                        (idx / Math.max(1, data.scoreTrendSeries.length - 1)) *
                          360;
                      const y = 125 - (pt.scoreOutOf10 / 10) * 100;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              )}

              {data.scoreTrendSeries.map((pt, idx) => {
                const x =
                  data.scoreTrendSeries.length === 1
                    ? 230
                    : 56 +
                      (idx / (data.scoreTrendSeries.length - 1)) * 360;
                const y = 125 - (pt.scoreOutOf10 / 10) * 100;
                return (
                  <g key={pt.attemptId}>
                    <circle cx={x} cy={y} r="4.5" fill="#1C1917" />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#1C1917"
                    >
                      {pt.scoreOutOf10}/10
                    </text>
                    <text
                      x={x}
                      y="140"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fill="#8A8178"
                    >
                      #{pt.index}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="lg:col-span-5 p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-5">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Correct vs. Incorrect Distribution
          </h2>

          {totalAnswered === 0 ? (
            <p className="text-xs text-[#8A8178] py-8 text-center">
              Awaiting completed questions.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="w-full h-5 bg-[#9E6B68]/30 rounded-sm overflow-hidden flex">
                <div
                  className="h-full bg-[#545E4E]"
                  style={{ width: `${correctRatioPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#545E4E]">
                  Correct: {data.summaryCards.correctAnswers} ({correctRatioPct}
                  %)
                </span>
                <span className="text-[#9E6B68]">
                  Incorrect: {data.summaryCards.incorrectAnswers} (
                  {100 - correctRatioPct}%)
                </span>
              </div>

              {/* Subject Accuracy Bars */}
              <div className="pt-3 border-t border-[#E5DEC9] space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
                  Subject-by-Subject Accuracy
                </span>
                {data.subjectPerformance.map((sp) => (
                  <div key={sp.subjectSlug} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#1C1917] font-medium">
                        {sp.subjectName}
                      </span>
                      <span className="font-mono text-[#57524C]">
                        Avg {sp.avgScoreOutOf10}/10 · Best{" "}
                        {sp.highestScoreOutOf10}/10 ({sp.accuracyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E7E0D3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1C1917]"
                        style={{ width: `${sp.accuracyPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. EVIDENCE-MAPPED ABILITY INDICATORS & DESCRIPTIVE PROFILE */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-[#1C1917] border-b border-[#DDD4C5] pb-2">
          Evidence-Mapped Ability &amp; Learning Profile
        </h2>

        {data.latestDescriptiveProfile && (
          <div className="p-5 bg-[#141210] text-[#FAF7F2] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#C8B28E]">
              <span>Latest Descriptive Game Profile</span>
              <span>
                Engine: {data.latestDescriptiveProfile.scoringAlgorithmVersion}
              </span>
            </div>
            <h3 className="font-serif text-2xl">
              {data.latestDescriptiveProfile.title}
            </h3>
            <p className="text-xs text-[#D6CEC0] leading-relaxed">
              {data.latestDescriptiveProfile.narrative}
            </p>
          </div>
        )}

        {data.abilityAnalysisByStream.map((group) => (
          <div key={group.stream} className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
              {group.streamName} Stream Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.indicators.map((ind) => (
                <div
                  key={ind.key}
                  className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg text-[#1C1917]">
                      {ind.label}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm">
                      {ind.qualitativeBand}
                      {ind.scorePct !== null ? ` (${ind.scorePct}%)` : ""}
                    </span>
                  </div>
                  <p className="text-[#57524C]">
                    {ind.supportingEvidenceSummary}
                  </p>
                  {ind.supportingQuestionIds.length > 0 && (
                    <p className="font-mono text-[10px] text-[#8A8178] truncate">
                      Supporting IDs: {ind.supportingQuestionIds.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 4. INDIVIDUAL ATTEMPT HISTORY TABLE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD4C5] pb-3">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Individual Attempt History
          </h2>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter participant attempts by subject"
            className="px-3 py-1.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-xs"
          >
            <option value="all">All Subjects</option>
            {data.subjectPerformance.map((s) => (
              <option key={s.subjectSlug} value={s.subjectSlug}>
                {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
          {filteredAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8178]">
              No Junior Mode attempts recorded for this filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                  <th className="py-3 px-4">Run</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Score / Accuracy</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {filteredAttempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-[#F3EDE2]/50">
                    <td className="py-3 px-4 font-mono">
                      #{att.attemptNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">
                      {att.subjectName}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {att.scoreOutOf10 !== null
                        ? `${att.scoreOutOf10}/10 (${att.accuracyPct}%)`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#57524C]">
                      {formatDurationSeconds(att.durationSeconds)}
                    </td>
                    <td className="py-3 px-4 text-[#57524C]">
                      {formatDateTime(att.completedAt || att.startedAt)}
                    </td>
                    <td className="py-3 px-4 uppercase tracking-[0.14em] text-[10px]">
                      {att.status}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/participants/${encPlayer}/junior/attempts/${encodeURIComponent(
                          att.attemptId
                        )}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1C1917] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.16em]"
                      >
                        <span>Questions</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
