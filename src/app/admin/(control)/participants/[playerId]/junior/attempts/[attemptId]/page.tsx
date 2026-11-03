"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ParticipantBreadcrumbs } from "@/components/admin/ParticipantBreadcrumbs";
import {
  formatDateTime,
  formatDurationSeconds,
} from "@/components/admin/formatters";
import {
  AbilityIndicatorEvaluation,
  JuniorDescriptiveProfile,
  OptionKey,
} from "@/lib/platform-types";

interface AttemptInspectionData {
  participant: {
    participantId: string;
    username: string;
    fullName: string;
    isAnonymous: boolean;
  };
  attempt: {
    attemptId: string;
    stream: string;
    subjectSlug: string;
    subjectName: string;
    board: string;
    academicYear: string;
    standard: string;
    difficultyPreference: string;
    attemptNumber: number;
    cycleNumber: number;
    status: string;
    startedAt: string;
    completedAt: string | null;
    durationSeconds: number | null;
    scoreOutOf10: number | null;
    correctCount: number | null;
    incorrectCount: number | null;
    accuracyPct: number | null;
    scoringAlgorithmVersion: string;
  };
  abilityIndicators: AbilityIndicatorEvaluation[];
  descriptiveProfile: JuniorDescriptiveProfile | null;
  questions: {
    slotNumber: number;
    questionId: string;
    questionVersion: number;
    chapterNumber: number;
    chapter: string;
    topic: string;
    difficulty: string;
    questionText: string;
    options: { key: OptionKey; text: string }[];
    selectedOptionKey: OptionKey | null;
    selectedOptionText: string | null;
    correctOptionKey: OptionKey;
    correctOptionText: string;
    isCorrect: boolean;
    explanation: string;
    syllabusReference: string;
    responseTimeMs: number | null;
  }[];
}

export default function ParticipantJuniorAttemptDetailPage({
  params,
}: {
  params: Promise<{ playerId: string; attemptId: string }>;
}) {
  const { playerId, attemptId } = use(params);
  const [data, setData] = useState<AttemptInspectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/admin/participants/${encodeURIComponent(
            playerId
          )}?view=junior&attemptId=${encodeURIComponent(attemptId)}`
        );
        if (res.ok) {
          const json = (await res.json()) as AttemptInspectionData;
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
  }, [playerId, attemptId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Individual Attempt Snapshot...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center font-serif text-2xl">
        Attempt record not found for this participant.
      </div>
    );
  }

  const encPlayer = encodeURIComponent(data.participant.participantId);

  return (
    <div className="space-y-8">
      <ParticipantBreadcrumbs
        participant={data.participant}
        activeTab="junior"
        extraCrumbs={[
          {
            label: "Junior Mode",
            href: `/admin/participants/${encPlayer}/junior`,
          },
          {
            label: `${data.attempt.subjectName} · Attempt #${data.attempt.attemptNumber}`,
          },
        ]}
      />

      {/* Attempt Metadata Header */}
      <section className="p-6 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Subject
          </span>
          <span className="font-serif text-base text-[#1C1917] mt-0.5 block">
            {data.attempt.subjectName}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Marks / Accuracy
          </span>
          <span className="font-serif text-xl text-[#1C1917] mt-0.5 block">
            {data.attempt.scoreOutOf10 !== null
              ? `${data.attempt.scoreOutOf10}/10 (${data.attempt.accuracyPct}%)`
              : "In Progress"}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Cycle &amp; Calibration
          </span>
          <span className="font-mono text-[#1C1917] mt-1 block">
            Cycle {data.attempt.cycleNumber} · {data.attempt.difficultyPreference}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Duration
          </span>
          <span className="font-mono text-[#1C1917] mt-1 block">
            {formatDurationSeconds(data.attempt.durationSeconds)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Engine Version
          </span>
          <span className="font-mono text-[#1C1917] mt-1 block">
            {data.attempt.scoringAlgorithmVersion}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Completed At
          </span>
          <span className="text-[#1C1917] mt-1 block">
            {formatDateTime(data.attempt.completedAt || data.attempt.startedAt)}
          </span>
        </div>
      </section>

      {/* Historical Question Snapshots */}
      <section className="space-y-4">
        <div className="border-b border-[#DDD4C5] pb-2 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            10-Question Historical Snapshot
          </h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A8178]">
            Exact Shuffled Option Keys &amp; Question Versions Retained
          </span>
        </div>

        <div className="space-y-4">
          {data.questions.map((q) => (
            <div
              key={q.questionId}
              className="p-5 sm:p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#E5DEC9] pb-3">
                <div className="space-x-2 font-mono text-[11px] text-[#57524C]">
                  <span>Slot #{String(q.slotNumber).padStart(2, "0")}</span>
                  <span>·</span>
                  <span>
                    {q.questionId} (v{q.questionVersion})
                  </span>
                  <span>·</span>
                  <span>
                    Ch.{q.chapterNumber}: {q.chapter}
                  </span>
                  <span>·</span>
                  <span>{q.difficulty}</span>
                </div>

                <div className="flex items-center gap-3">
                  {q.responseTimeMs !== null && (
                    <span className="font-mono text-[11px] text-[#8A8178]">
                      {(q.responseTimeMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#545E4E]">
                      <CheckCircle2 className="w-4 h-4" />
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9E6B68]">
                      <XCircle className="w-4 h-4" />
                      {q.selectedOptionKey ? "Incorrect" : "Unanswered"}
                    </span>
                  )}
                </div>
              </div>

              <p className="font-serif text-lg text-[#1C1917]">
                {q.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {q.options.map((opt) => {
                  const isCorrectOpt = opt.key === q.correctOptionKey;
                  const isSelectedOpt = opt.key === q.selectedOptionKey;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-sm border flex items-start justify-between gap-2 ${
                        isCorrectOpt
                          ? "bg-[#545E4E]/12 border-[#545E4E]"
                          : isSelectedOpt
                          ? "bg-[#9E6B68]/12 border-[#9E6B68]"
                          : "bg-[#F6F3EC] border-[#E5DEC9]"
                      }`}
                    >
                      <span>
                        <strong className="font-mono mr-1.5">{opt.key}.</strong>
                        {opt.text}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.16em] shrink-0 font-mono">
                        {isCorrectOpt && isSelectedOpt
                          ? "Selected · Key"
                          : isCorrectOpt
                          ? "Answer Key"
                          : isSelectedOpt
                          ? "Selected"
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#F3EDE2]/75 border border-[#E5DEC9] rounded-sm text-xs space-y-1">
                <p className="text-[#1C1917]">
                  <strong>Explanation:</strong> {q.explanation}
                </p>
                <p className="text-[11px] text-[#8A8178]">
                  Syllabus Ref: {q.syllabusReference}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

