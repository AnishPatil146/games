"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminMetrics } from "@/lib/types";
import {
  formatDurationSeconds,
  formatPct,
} from "@/components/admin/formatters";

interface SeniorOverviewPayload {
  seniorSecretMetrics: {
    seventhDoorUnlocks: number;
    seventhDoorCompletions: number;
    hiddenLetterReads: number;
  };
  seniorMetrics: AdminMetrics;
}

export default function AdminSeniorModePage() {
  const [data, setData] = useState<SeniorOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/admin/analytics");
        if (res.ok) {
          const json = (await res.json()) as SeniorOverviewPayload;
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
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Senior Mode Analytics...
      </div>
    );
  }

  const m = data.seniorMetrics;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Edition A · Narrative Telemetry
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Senior Mode Control
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em]">
          <Link
            href="/admin/participants?modeFilter=senior"
            className="px-3.5 py-2 bg-[#141210] text-[#FAF7F2] rounded-sm"
          >
            Senior Participants
          </Link>
          <Link
            href="/admin/sessions"
            className="px-3.5 py-2 bg-[#FAF7F2] border border-[#CFC5B4] text-[#1C1917] rounded-sm"
          >
            Raw Sessions
          </Link>
        </div>
      </header>

      {/* KPI Strip including Seventh Door & Hidden Letter */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Games Started
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {m.gamesStarted}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Completed
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {m.gamesCompleted}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Avg Duration
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {formatDurationSeconds(m.avgCompletionDurationSeconds)}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            7th Door Unlocks
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.seniorSecretMetrics.seventhDoorUnlocks}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            7th Door Sealed
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.seniorSecretMetrics.seventhDoorCompletions}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Hidden Letter Read
          </span>
          <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
            {data.seniorSecretMetrics.hiddenLetterReads}
          </span>
        </div>
      </section>

      {/* Chapter Engagement & Drop-Off */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        <div className="p-4 border-b border-[#DDD4C5]">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Chapter Funnel (Chapters 01–06)
          </h2>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
              <th className="py-3 px-4">Chapter</th>
              <th className="py-3 px-4">Started</th>
              <th className="py-3 px-4">Completed</th>
              <th className="py-3 px-4">Completion %</th>
              <th className="py-3 px-4">Drop-Off %</th>
              <th className="py-3 px-4">Avg Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]">
            {m.chapterAnalytics.map((ch) => (
              <tr key={ch.chapter}>
                <td className="py-3 px-4 font-serif text-sm">
                  0{ch.chapter} · {ch.title}
                </td>
                <td className="py-3 px-4 font-mono">{ch.sessionsStarted}</td>
                <td className="py-3 px-4 font-mono">{ch.sessionsCompleted}</td>
                <td className="py-3 px-4 font-mono">
                  {formatPct(ch.completionRatePct)}
                </td>
                <td className="py-3 px-4 font-mono">
                  {formatPct(ch.dropOffPct)}
                </td>
                <td className="py-3 px-4 font-mono">
                  {formatDurationSeconds(ch.avgDurationSeconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Puzzle Telemetry */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {m.puzzleAnalytics.map((pz) => (
          <div
            key={pz.chapter}
            className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2 text-xs"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#545E4E] font-semibold">
              Chapter 0{pz.chapter} Logic Challenge
            </span>
            <h3 className="font-serif text-xl text-[#1C1917]">
              {pz.puzzleName}
            </h3>
            <p className="text-[#57524C] font-mono">
              Solved: {pz.sessionsSolved}/{pz.sessionsAttempted} sessions (
              {formatPct(pz.completionRatePct)}) · Hints: {pz.hintsUsedTotal} ·
              Avg Solve: {formatDurationSeconds(pz.avgSolveSeconds)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

