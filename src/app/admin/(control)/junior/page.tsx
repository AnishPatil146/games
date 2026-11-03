"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Database } from "lucide-react";

interface JuniorControlData {
  subjectParticipation: {
    subjectSlug: string;
    subjectName: string;
    stream: string;
    publishedQuestions: number;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
}

export default function AdminJuniorModePage() {
  const [subjects, setSubjects] = useState<
    JuniorControlData["subjectParticipation"]
  >([]);
  const [streamFilter, setStreamFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        if (res.ok) {
          const json = (await res.json()) as JuniorControlData;
          if (active) setSubjects(json.subjectParticipation || []);
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

  const filtered =
    streamFilter === "all"
      ? subjects
      : subjects.filter((s) => s.stream === streamFilter);

  const totalPublished = subjects.reduce(
    (sum, s) => sum + s.publishedQuestions,
    0
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Edition B · MSBSHSE Class 11 (FYJC)
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Junior Mode Control
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs uppercase tracking-[0.16em]">
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141210] text-[#FAF7F2] rounded-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage {totalPublished} Questions</span>
          </Link>
          <Link
            href="/admin/subjects"
            className="px-3.5 py-2 bg-[#FAF7F2] border border-[#CFC5B4] text-[#1C1917] rounded-sm"
          >
            Configure Subjects
          </Link>
        </div>
      </header>

      {/* Stream Filter */}
      <div className="flex items-center gap-2">
        {["all", "science", "commerce", "arts"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStreamFilter(st)}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.16em] rounded-sm border cursor-pointer ${
              streamFilter === st
                ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                : "bg-[#FAF7F2] text-[#57524C] border-[#DDD4C5]"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Subject Bank Coverage & Performance Table */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            Loading Junior Subject Telemetry...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Stream</th>
                <th className="py-3 px-4">Published Bank</th>
                <th className="py-3 px-4">Attempts (Done)</th>
                <th className="py-3 px-4">Mean Score</th>
                <th className="py-3 px-4 text-right">Bank Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {filtered.map((s) => {
                const healthy = s.publishedQuestions >= 100;
                return (
                  <tr key={s.subjectSlug} className="hover:bg-[#F3EDE2]/50">
                    <td className="py-3.5 px-4 font-serif text-base text-[#1C1917]">
                      {s.subjectName}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-[#57524C]">
                      {s.stream}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono ${
                          healthy ? "text-[#545E4E]" : "text-[#9E6B68]"
                        }`}
                      >
                        {healthy ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {s.publishedQuestions} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.attempts} ({s.completed})
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.avgScore !== null ? `${s.avgScore}/10` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/questions?subject=${encodeURIComponent(
                          s.subjectSlug
                        )}`}
                        className="text-[11px] uppercase tracking-[0.16em] text-[#545E4E] font-medium hover:underline"
                      >
                        Inspect Bank
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

