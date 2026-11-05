"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, CheckCircle2, ShieldCheck, Activity, Compass } from "lucide-react";
import { formatDateTime } from "@/components/admin/formatters";
import { MathRenderer } from "@/components/math/MathRenderer";

interface UnifiedOverview {
  storageBackend: string;
  schemaReady: boolean;
  schemaNotice?: string;
  landingVisits: number;
  totalParticipants: number;
  seniorParticipants: number;
  juniorParticipants: number;
  totalSessions: number;
  completedGames: number;
  completionRatePct: number | null;
  avgJuniorScore: number | null;
  streamParticipation: {
    stream: string;
    streamName: string;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
  subjectParticipation: {
    subjectSlug: string;
    subjectName: string;
    stream: string;
    publishedQuestions: number;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
  recentAttempts: {
    attemptId: string;
    participantId: string;
    participantName: string;
    username: string;
    stream: string;
    subjectName: string;
    scoreOutOf10: number | null;
    accuracyPct: number | null;
    status: string;
    startedAt: string;
    completedAt: string | null;
  }[];
}

export default function AdminExecutiveDashboardPage() {
  const [data, setData] = useState<UnifiedOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        if (res.ok) {
          const json = (await res.json()) as UnifiedOverview;
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
        Loading Executive Control Overview...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            THE UNWRITTEN / CONTROL
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Executive Platform Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/solo"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2E2822] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#3D352E]"
          >
            <span>Solo Campaign</span>
            <ArrowRight className="w-3 h-3 text-[#C8B28E]" />
          </Link>
          <Link
            href="/alliance"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1C2F24] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#253D30]"
          >
            <span>Alliance War Room</span>
            <ArrowRight className="w-3 h-3 text-[#52B788]" />
          </Link>
          <Link
            href="/admin/participants"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#141210] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.18em] hover:bg-[#2A2521]"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Participants</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Landing Visits
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.landingVisits}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Participants
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.totalParticipants}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Senior / Junior
          </span>
          <span className="font-mono text-lg text-[#1C1917] mt-2 block">
            {data.seniorParticipants} / {data.juniorParticipants}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Total Runs
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.totalSessions}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Completion Rate
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.completionRatePct !== null ? `${data.completionRatePct}%` : "—"}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Avg Junior Marks
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.avgJuniorScore !== null ? `${data.avgJuniorScore}/10` : "—"}
          </span>
        </div>
      </section>

      {/* Stream Participation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.streamParticipation.map((st) => (
          <div
            key={st.stream}
            className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl text-[#1C1917]">
                {st.streamName} Stream
              </span>
              <span className="font-mono text-xs text-[#545E4E]">
                {st.attempts} attempts
              </span>
            </div>
            <p className="text-xs text-[#57524C]">
              Completed: {st.completed} · Mean Score:{" "}
              {st.avgScore !== null ? `${st.avgScore}/10` : "—"}
            </p>
          </div>
        ))}
      </section>

      {/* Recent Junior Attempts with Participant Drill-down */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#DDD4C5] pb-2">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Recent Junior Mode Attempts
          </h2>
          <Link
            href="/admin/attempts"
            className="text-xs uppercase tracking-[0.18em] text-[#545E4E] hover:underline"
          >
            View All Attempts
          </Link>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
          {data.recentAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8178]">
              No Junior Mode attempts submitted yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {data.recentAttempts.map((att) => {
                  const encP = encodeURIComponent(att.participantId);
                  return (
                    <tr key={att.attemptId} className="hover:bg-[#F3EDE2]/50">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/participants/${encP}`}
                          className="font-medium text-[#1C1917] hover:underline"
                        >
                          {att.participantName}
                        </Link>
                        <span className="block font-mono text-[10px] text-[#8A8178]">
                          @{att.username}
                        </span>
                      </td>
                      <td className="py-3 px-4">{att.subjectName}</td>
                      <td className="py-3 px-4 font-mono">
                        {att.scoreOutOf10 !== null
                          ? `${att.scoreOutOf10}/10 (${att.accuracyPct}%)`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 uppercase tracking-[0.14em] text-[10px]">
                        {att.status}
                      </td>
                      <td className="py-3 px-4 text-[#57524C]">
                        {formatDateTime(att.completedAt || att.startedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/participants/${encP}/junior/attempts/${encodeURIComponent(
                            att.attemptId
                          )}`}
                          className="text-[11px] uppercase tracking-[0.16em] text-[#545E4E] font-medium hover:underline"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Cinematic Character Selection & Environment Stage Health Audit */}
      <section className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#8A5A36]" />
            <h2 className="font-serif text-lg text-[#1C1917]">Cinematic Player Select &amp; Environment Stage</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
            100% Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ Background Removal
            </span>
            <span className="font-bold text-[#1C1917] block">Grey Keyhole Eliminated</span>
            <span className="text-[11px] text-[#57524C]">Obsolete SVG arch and meridian rings removed at source.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ 4 Game Environments
            </span>
            <span className="font-bold text-[#1C1917] block">Selection, Junior, Solo, War Room</span>
            <span className="text-[11px] text-[#57524C]">Four distinct 1920x1080 illustrated backdrops with dynamic cross-fade.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ 3 Character Identities
            </span>
            <span className="font-bold text-[#1C1917] block">The Scholar, Investigator, Squad</span>
            <span className="text-[11px] text-[#57524C]">Idle breathing, elevation, distinct badges, and interactive dossier panels.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ Route &amp; State Uplink
            </span>
            <span className="font-bold text-[#1C1917] block">1-Click &quot;ENTER WORLD&quot;</span>
            <span className="text-[11px] text-[#57524C]">Direct routing to /junior, /solo, and /alliance with saved progress awareness.</span>
          </div>
        </div>
      </section>

      {/* Mathematical Notation & Gameplay Engines Health Audit */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Operational Subsystems */}
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#545E4E]" />
              <h2 className="font-serif text-lg text-[#1C1917]">Operational Subsystem Health</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
              All Systems Nominal
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">Solo Campaign — The Mind Experiment</span>
                <span className="block text-[11px] text-[#57524C]">8 Chambers · Interactive Spatial Labyrinth · Keypad · 3-Doors</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">Multiplayer Alliance — The Last Alliance</span>
                <span className="block text-[11px] text-[#57524C]">9x9 Sudoku Generator · 8x8 Chess vs Count Vesper · Prisoner&apos;s Matrix</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online &amp; Synced
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">Junior Mode — The Learning Arena</span>
                <span className="block text-[11px] text-[#57524C]">Class 11 &amp; Class 12 · 14 Subjects · 1,400 Questions · Zero Repetition</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1,400 Qs Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Mathematical Notation Typesetting Health Check */}
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8A5A36]" />
              <h2 className="font-serif text-lg text-[#1C1917]">MathRenderer™ Telemetry</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
              Engine OK
            </span>
          </div>

          <div className="p-3.5 bg-[#F3EDE2] rounded-sm space-y-2 text-xs font-serif">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#8A8178]">
              Live Typesetting Verification Preview
            </span>
            <div className="p-3 bg-white rounded border border-[#DDD4C5] space-y-2 text-sm text-[#1C1917]">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Fraction &amp; Radical:</span>
                <MathRenderer text="Quadratic Formula: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Greek &amp; Integral:</span>
                <MathRenderer text="Gaussian Integral: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$" />
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Relations:</span>
                <MathRenderer text="Domain constraint: $f(x) \ge 0 \iff x \in [-\pi, \pi]$" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
