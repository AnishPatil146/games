"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { formatDateTime } from "@/components/admin/formatters";

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

        <Link
          href="/admin/participants"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141210] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.18em] hover:bg-[#2A2521]"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Open Participant Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
    </div>
  );
}
