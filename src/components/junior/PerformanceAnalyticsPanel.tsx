"use client";

import { Brain } from "lucide-react";
import { AcademicStreamConfig, AcademicSubjectConfig } from "@/lib/platform-types";

interface EnrichedSubject extends AcademicSubjectConfig {
  publishedQuestionCount: number;
  participantProgress?: {
    completedQuestionsCount: number;
    attemptsCompleted: number;
    bestScoreOutOf10: number | null;
  };
}

interface PerformanceAnalyticsPanelProps {
  subjects: EnrichedSubject[];
  activeStream: AcademicStreamConfig | undefined;
}

export function PerformanceAnalyticsPanel({
  subjects,
  activeStream,
}: PerformanceAnalyticsPanelProps) {
  const totalQuestionsAnswered = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.completedQuestionsCount || 0),
    0
  );

  const totalAttempts = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.attemptsCompleted || 0),
    0
  );

  const cognitiveAbilities = activeStream?.abilityIndicators || [
    { key: "logical_reasoning", label: "Logical Reasoning", description: "Step-chaining deductions" },
    { key: "analytical_thinking", label: "Analytical Thinking", description: "Decomposing multi-variable scenarios" },
    { key: "scientific_understanding", label: "Conceptual Mastery", description: "Command of core natural laws" },
    { key: "problem_solving", label: "Quantitative Precision", description: "Applying mathematical formulas" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead */}
      <div className="bg-[#181512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184] font-bold">
            Cognitive Diagnostics &amp; Mastery Metrics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
            Performance Diagnostics
          </h2>
          <p className="text-sm text-[#A89F93] leading-relaxed">
            Detailed tracking of questions completed across the 100-question zero-repeat cycle, cognitive reasoning profiles, and subject accuracy.
          </p>
        </div>
      </div>

      {/* 2. Key Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Total Attempts</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">{totalAttempts}</p>
          <span className="text-[10px] text-[#545E4E]">Completed 10-Q sessions</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Questions Solved</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">{totalQuestionsAnswered}</p>
          <span className="text-[10px] text-[#545E4E]">Zero-repeat cycle tracked</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Subjects Explored</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">
            {subjects.filter((s) => (s.participantProgress?.attemptsCompleted || 0) > 0).length} / {subjects.length}
          </p>
          <span className="text-[10px] text-[#545E4E]">Across active stream</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Cycle Rollover</span>
          <p className="font-serif text-3xl font-bold text-emerald-800">100 Qs</p>
          <span className="text-[10px] text-[#545E4E]">Guaranteed zero repeat</span>
        </div>
      </div>

      {/* 3. Subject-by-Subject Progress Table */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-[#1C1917]">
          Subject Mastery &amp; Cycle Progression
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DDD4C5] text-[10px] font-mono uppercase tracking-wider text-[#57524C]">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Questions Solved</th>
                <th className="py-2.5 px-3">Best Score</th>
                <th className="py-2.5 px-3">Cycle Progress</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C5] font-mono">
              {subjects.map((subj) => {
                const completed = subj.participantProgress?.completedQuestionsCount || 0;
                const best = subj.participantProgress?.bestScoreOutOf10;
                const progressPct = Math.min(100, Math.round((completed / 100) * 100));
                return (
                  <tr key={subj.slug} className="hover:bg-[#F3EDE2]/60">
                    <td className="py-3 px-3 font-serif font-bold text-[#1C1917] text-sm">
                      {subj.name}
                    </td>
                    <td className="py-3 px-3 text-[#57524C]">{completed} / 100 Qs</td>
                    <td className="py-3 px-3 text-[#1C1917] font-bold">
                      {best !== null && best !== undefined ? `${best} / 10` : "—"}
                    </td>
                    <td className="py-3 px-3 w-48">
                      <div className="w-full bg-[#E5DEC9] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#545E4E] h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {completed > 0 ? (
                        <span className="text-emerald-800 text-[10px] uppercase font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-[#8A8178] text-[10px] uppercase">
                          Uninitiated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Cognitive Ability Synthesis */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#545E4E]" />
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">
            Cognitive Ability Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cognitiveAbilities.map((ab) => (
            <div
              key={ab.key}
              className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1"
            >
              <span className="font-serif text-base font-bold text-[#1C1917] block">
                {ab.label}
              </span>
              <p className="text-xs text-[#57524C] leading-relaxed">
                {ab.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
