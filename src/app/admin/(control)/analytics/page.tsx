"use client";

import { useEffect, useState } from "react";
import { AdminMetrics } from "@/lib/types";

interface UnifiedAnalyticsPayload {
  modeSelections: { senior: number; junior: number };
  juniorChapterAccuracy: {
    subjectName: string;
    stream: string;
    chapter: string;
    total: number;
    correct: number;
    accuracyPct: number;
  }[];
  questionBankHealth: {
    totalQuestions: number;
    publishedQuestions: number;
    draftOrUnreviewedQuestions: number;
    usedQuestionsCount: number;
    unusedQuestionsCount: number;
  };
  seniorMetrics: AdminMetrics;
}

export default function AdminUnifiedAnalyticsPage() {
  const [data, setData] = useState<UnifiedAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/admin/analytics");
        if (res.ok) {
          const json = (await res.json()) as UnifiedAnalyticsPayload;
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
        Synthesizing Cross-Mode Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-[#DDD4C5] pb-5">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
          Cross-Edition Telemetry
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
          Platform Analytics
        </h1>
      </header>

      {/* Mode Selection & Question Bank Health */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Senior Selections
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.modeSelections.senior}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Junior Selections
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.modeSelections.junior}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Published Bank
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.questionBankHealth.publishedQuestions}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Used Questions
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.questionBankHealth.usedQuestionsCount}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Unused Pool
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.questionBankHealth.unusedQuestionsCount}
          </span>
        </div>
      </section>

      {/* Junior Chapter Accuracy Table */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        <div className="p-4 border-b border-[#DDD4C5]">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Junior Mode Syllabus Chapter Accuracy
          </h2>
        </div>
        {data.juniorChapterAccuracy.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A8178]">
            Chapter accuracy aggregates populate as students submit Junior
            attempts.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Chapter</th>
                <th className="py-3 px-4">Questions Answered</th>
                <th className="py-3 px-4">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {data.juniorChapterAccuracy.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-medium">{row.subjectName}</td>
                  <td className="py-3 px-4">{row.chapter}</td>
                  <td className="py-3 px-4 font-mono">
                    {row.correct}/{row.total}
                  </td>
                  <td className="py-3 px-4 font-mono">{row.accuracyPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Campaign Attribution */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        <div className="p-4 border-b border-[#DDD4C5]">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Campaign &amp; Referral Attribution
          </h2>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Medium</th>
              <th className="py-3 px-4">Campaign</th>
              <th className="py-3 px-4">Sessions</th>
              <th className="py-3 px-4">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]">
            {data.seniorMetrics.campaignAttribution.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#8A8178]">
                  No campaign sessions logged yet.
                </td>
              </tr>
            ) : (
              data.seniorMetrics.campaignAttribution.map((c, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 font-mono">{c.source}</td>
                  <td className="py-3 px-4 font-mono">{c.medium}</td>
                  <td className="py-3 px-4 font-mono">{c.campaign}</td>
                  <td className="py-3 px-4 font-mono">{c.sessions}</td>
                  <td className="py-3 px-4 font-mono">{c.completed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
