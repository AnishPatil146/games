"use client";

import { use, useEffect, useState } from "react";
import { ParticipantBreadcrumbs } from "@/components/admin/ParticipantBreadcrumbs";
import { SeniorChoiceMap } from "@/components/senior/SeniorChoiceMap";
import { formatDateTime } from "@/components/admin/formatters";
import { GameplayEvent, GameplayReport } from "@/lib/types";

interface ParticipantSeniorDashboardData {
  participant: {
    participantId: string;
    username: string;
    fullName: string;
    isAnonymous: boolean;
  };
  played: boolean;
  sessions: {
    id: string;
    status: string;
    currentChapter: number;
    archetype: string | null;
    startedAt: string;
    completedAt: string | null;
  }[];
  primarySession: {
    id: string;
    status: string;
    currentChapter: number;
    characterPresentation: string;
    startedAt: string;
    completedAt: string | null;
  } | null;
  chaptersProgress: {
    chapter: number;
    visited: boolean;
    completed: boolean;
  }[];
  decisions: {
    chapter: number;
    choiceKey: string;
    detail: Record<string, unknown>;
    timestamp: string;
  }[];
  cluesDiscovered: string[];
  challengesCompleted: {
    chapter: number;
    puzzle: string;
    isCorrect: boolean;
    attemptCount: number;
    timeToSolveMs: number | null;
  }[];
  seventhDoorStatus: {
    unlocked: boolean;
    completed: boolean;
    choice: string | null;
  };
  hiddenLetterStatus: {
    unlocked: boolean;
    read: boolean;
  };
  report: GameplayReport | null;
  timeline: GameplayEvent[];
}

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Last Train",
  2: "The Locked Room",
  3: "The Unknown Message",
  4: "The Empty Canvas",
  5: "The Final Ten Seconds",
  6: "The Unknown World",
};

export default function ParticipantSeniorDashboardPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const [data, setData] = useState<ParticipantSeniorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/admin/participants/${encodeURIComponent(
            playerId
          )}?view=senior`
        );
        if (res.ok) {
          const json = (await res.json()) as ParticipantSeniorDashboardData;
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
        Loading Individual Senior Narrative Dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center font-serif text-2xl">
        Participant not found.
      </div>
    );
  }

  const choiceMapSteps = data.chaptersProgress.map((cp) => {
    const dec = data.decisions.find((d) => d.chapter === cp.chapter);
    return {
      chapter: cp.chapter,
      title: CHAPTER_NAMES[cp.chapter] || `Chapter 0${cp.chapter}`,
      selectedLabel: dec?.choiceKey || (cp.completed ? "Completed" : null),
      alternatives: [],
      completed: cp.completed,
    };
  });

  return (
    <div className="space-y-8">
      <ParticipantBreadcrumbs
        participant={data.participant}
        activeTab="senior"
        extraCrumbs={[{ label: "Senior Mode Dashboard" }]}
      />

      {!data.played || !data.primarySession ? (
        <div className="p-12 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-center space-y-2">
          <p className="font-serif text-2xl text-[#1C1917]">
            No Senior Mode sessions recorded for this participant.
          </p>
          <p className="text-xs text-[#57524C]">
            This participant has only engaged with Junior Mode so far.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Strip */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
                Archetype
              </span>
              <span className="font-serif text-lg text-[#1C1917] mt-1 block">
                {data.report?.archetype || "In Progress"}
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
                Chapters Completed
              </span>
              <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
                {data.chaptersProgress.filter((c) => c.completed).length} / 6
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
                Clues Discovered
              </span>
              <span className="font-serif text-2xl text-[#1C1917] mt-1 block">
                {data.cluesDiscovered.length}
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
                Seventh Door
              </span>
              <span className="font-mono text-xs text-[#1C1917] mt-2 block">
                {data.seventhDoorStatus.completed
                  ? `Completed (${data.seventhDoorStatus.choice})`
                  : data.seventhDoorStatus.unlocked
                  ? "Unlocked"
                  : "Locked"}
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
                Hidden Letter
              </span>
              <span className="font-mono text-xs text-[#1C1917] mt-2 block">
                {data.hiddenLetterStatus.read
                  ? "Unsealed & Read"
                  : data.hiddenLetterStatus.unlocked
                  ? "Unlocked (Unread)"
                  : "Locked"}
              </span>
            </div>
          </section>

          {/* Visual Choice Map */}
          <SeniorChoiceMap
            steps={choiceMapSteps}
            seventhDoor={{
              unlocked: data.seventhDoorStatus.unlocked,
              completed: data.seventhDoorStatus.completed,
              choiceLabel: data.seventhDoorStatus.choice,
            }}
          />

          {/* Decisions & Puzzles */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
              <h2 className="font-serif text-xl text-[#1C1917] border-b border-[#E5DEC9] pb-2">
                Decisions &amp; Clues
              </h2>
              {data.decisions.length === 0 ? (
                <p className="text-xs text-[#8A8178]">No branch choices yet.</p>
              ) : (
                <ul className="space-y-2.5 text-xs">
                  {data.decisions.map((d, i) => (
                    <li
                      key={`${d.chapter}-${i}`}
                      className="p-3 bg-[#F6F3EC] border border-[#E5DEC9] rounded-sm flex items-center justify-between"
                    >
                      <span>
                        <strong className="font-mono mr-2">
                          Ch.0{d.chapter}
                        </strong>
                        {d.choiceKey}
                      </span>
                      <span className="text-[#8A8178]">
                        {formatDateTime(d.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {data.cluesDiscovered.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block mb-1.5">
                    Clue Identifiers Examined
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.cluesDiscovered.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm font-mono text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
              <h2 className="font-serif text-xl text-[#1C1917] border-b border-[#E5DEC9] pb-2">
                Session Event Timeline ({data.timeline.length})
              </h2>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {data.timeline.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="p-2.5 bg-[#F6F3EC] border border-[#E5DEC9] rounded-sm text-xs flex items-baseline justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-[#545E4E] mr-2">
                        [Ch.{ev.chapter}]
                      </span>
                      <span className="font-mono text-[#1C1917]">
                        {ev.event_type}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8178] shrink-0">
                      {formatDateTime(ev.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

