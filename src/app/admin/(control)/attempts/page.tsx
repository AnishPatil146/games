"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  formatDateTime,
  formatDurationSeconds,
} from "@/components/admin/formatters";

interface AttemptRow {
  attemptId: string;
  participantId: string;
  participantName: string;
  username: string;
  stream: string;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: string;
  attemptNumber: number;
  cycleNumber: number;
  scoreOutOf10: number | null;
  accuracyPct: number | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
}

export default function AdminAttemptsExplorerPage() {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [stream, setStream] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const qs = new URLSearchParams();
        if (stream) qs.set("stream", stream);
        if (status) qs.set("status", status);

        const res = await fetch(`/api/v1/admin/attempts?${qs.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as { attempts: AttemptRow[] };
          if (active) setAttempts(json.attempts || []);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [stream, status]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Junior Mode Audit Trail
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            All Challenge Attempts ({attempts.length})
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            aria-label="Filter attempts by stream"
            className="px-3 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm"
          >
            <option value="">All Streams</option>
            <option value="science">Science</option>
            <option value="commerce">Commerce</option>
            <option value="arts">Arts</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter attempts by status"
            className="px-3 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </header>

      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            Loading Attempts...
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            No Junior challenge attempts match the current filter.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Subject &amp; Stream</th>
                <th className="py-3 px-4">Run / Cycle</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {attempts.map((a) => {
                const encP = encodeURIComponent(a.participantId);
                return (
                  <tr key={a.attemptId} className="hover:bg-[#F3EDE2]/50">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/participants/${encP}`}
                        className="font-medium text-[#1C1917] hover:underline"
                      >
                        {a.participantName}
                      </Link>
                      <span className="block font-mono text-[10px] text-[#8A8178]">
                        @{a.username}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {a.subjectName}
                      <span className="block text-[10px] capitalize text-[#8A8178]">
                        {a.stream} · {a.difficultyPreference}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      #{a.attemptNumber} (C{a.cycleNumber})
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {a.scoreOutOf10 !== null
                        ? `${a.scoreOutOf10}/10 (${a.accuracyPct}%)`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {formatDurationSeconds(a.durationSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-[#57524C]">
                      {formatDateTime(a.completedAt || a.startedAt)}
                    </td>
                    <td className="py-3.5 px-4 uppercase tracking-[0.14em] text-[10px]">
                      {a.status}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/participants/${encP}/junior/attempts/${encodeURIComponent(
                          a.attemptId
                        )}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1C1917] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.16em]"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

