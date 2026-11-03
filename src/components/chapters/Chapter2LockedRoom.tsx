"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/Button";
import { LockedRoomArtwork } from "@/components/artwork/SceneArtwork";
import { EventType } from "@/lib/types";

interface ChapterProps {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onComplete: () => void;
}

const CLUES = [
  {
    id: "broken_clock",
    title: "Pillar Regulator Clock",
    location: "West Rotunda",
    detail:
      "Its pendulum hangs motionless behind bevelled glass. The hour hand rests at 07 and the minute hand at 45.",
  },
  {
    id: "faded_note",
    title: "Faded Ink Note",
    location: "Librarian Desk",
    detail:
      "Handwritten on vellum: 'Four digits part the oak. Begin with the zeroed hour; conclude where the minute hand froze.'",
  },
  {
    id: "dusty_ledger",
    title: "Archive Vault Ledger",
    location: "Mahogany Lectern",
    detail:
      "Entry #402: 'Whenever mains power drops, the brass lock reverts to the exact 24-hour timestamp recorded on the pillar clock.'",
  },
];

const TARGET_CODE = "0745";

export function Chapter2LockedRoom({ onTrackEvent, onComplete }: ChapterProps) {
  const prefersReducedMotion = useReducedMotion();
  const mountTimeRef = useRef<number>(0);

  const [inspectedClues, setInspectedClues] = useState<string[]>([]);
  const [activeClueId, setActiveClueId] = useState<string | null>(null);
  const [digits, setDigits] = useState<[number, number, number, number]>([
    0, 0, 0, 0,
  ]);
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  const getElapsedMs = () =>
    Math.max(100, Math.round(performance.now() - mountTimeRef.current));

  const handleInspectClue = async (clueId: string) => {
    setActiveClueId(clueId);
    if (!inspectedClues.includes(clueId)) {
      const updated = [...inspectedClues, clueId];
      setInspectedClues(updated);
      await onTrackEvent("clue_inspected", {
        clueId,
        inspectionOrder: updated.length,
        clueSequence: updated,
        elapsedMs: getElapsedMs(),
      });
    }
  };

  const adjustDigit = (index: 0 | 1 | 2 | 3, delta: 1 | -1) => {
    if (isUnlocked) return;
    setErrorFeedback(null);
    setDigits((prev) => {
      const next = [...prev] as [number, number, number, number];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
  };

  const handleRequestHint = async () => {
    setShowHint(true);
    if (!hintUsed) {
      setHintUsed(true);
      await onTrackEvent("hint_used", {
        puzzle: "locked_room_tumbler",
        cluesSeenCount: inspectedClues.length,
        elapsedMs: getElapsedMs(),
      });
    }
  };

  const handleAttemptUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnlocked) return;

    const entered = digits.join("");
    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);

    const isCorrect = entered === TARGET_CODE;
    const timeToSolveMs = getElapsedMs();

    await onTrackEvent("puzzle_attempted", {
      puzzle: "locked_room_tumbler",
      attemptCount: nextAttempt,
      codeEntered: entered,
      isCorrect,
      cluesInspectedCount: inspectedClues.length,
      clueOrder: inspectedClues,
      hintUsed,
      timeToSolveMs,
    });

    if (isCorrect) {
      setErrorFeedback(null);
      setIsUnlocked(true);
    } else {
      setErrorFeedback(
        `Combination ${entered} met mechanical resistance. Examine the room's frozen timepiece and desk records.`
      );
    }
  };

  const handleFinishChapter = async () => {
    await onTrackEvent("chapter_completed", {
      attempts,
      cluesInspectedCount: inspectedClues.length,
      clueOrder: inspectedClues,
      hintUsed,
      durationMs: getElapsedMs(),
    });
    onComplete();
  };

  const activeClueObj = CLUES.find((c) => c.id === activeClueId) || null;

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 02 · Sub-Level Rotunda</span>
          <span className="inline-flex items-center gap-1.5 text-[#545E4E] font-mono">
            {isUnlocked ? (
              <Unlock className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{inspectedClues.length}/3 Clues Examined</span>
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Locked Room
        </h1>
      </div>

      {/* Interactive Architectural Scene */}
      <figure className="border border-[#DDD4C5] rounded-sm overflow-hidden bg-[#1A1715]">
        <LockedRoomArtwork
          inspectedClues={inspectedClues}
          isUnlocked={isUnlocked}
          onSelectClue={(id) => void handleInspectClue(id)}
        />
        <figcaption className="px-4 py-2.5 bg-[#141210] text-[#A89F93] text-[11px] flex flex-wrap items-center justify-between gap-2">
          <span>
            Select highlighted artifacts directly inside the rotunda or use the
            inspection index below.
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D6CEC0]">
            Attempts: {attempts}
          </span>
        </figcaption>
      </figure>

      <p className="font-serif text-lg leading-relaxed text-[#1C1917]">
        You stand inside a circular archive lined with tall folios. The single
        exit—a heavy oak door bound in brass—is held shut by a four-wheel
        mechanical cipher. Nothing moves, yet the room preserves the exact
        record of how it was sealed.
      </p>

      {/* Accessible Clue Cards + Active Detail Drawer */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLUES.map((clue) => {
            const seen = inspectedClues.includes(clue.id);
            const isSelected = activeClueId === clue.id;
            return (
              <button
                key={clue.id}
                type="button"
                onClick={() => void handleInspectClue(clue.id)}
                className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#F3EDE2] border-[#1C1917]"
                    : seen
                    ? "bg-[#F3EDE2]/65 border-[#545E4E]/50"
                    : "bg-[#FAF7F2] border-[#DDD4C5] hover:border-[#8A8178]"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                  {clue.location}
                </span>
                <span className="block font-medium text-sm text-[#1C1917] mt-1">
                  {clue.title}
                </span>
                <span className="block text-[11px] text-[#545E4E] mt-2">
                  {seen ? "Examined" : "Inspect →"}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeClueObj && (
            <motion.div
              key={activeClueObj.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              className="p-4 sm:p-5 bg-[#F3EDE2] border-l-2 border-[#1C1917] rounded-r-sm space-y-1"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8A8178]">
                {activeClueObj.title} · Observation Note
              </p>
              <p className="text-sm text-[#1C1917] leading-relaxed">
                {activeClueObj.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brass 4-Wheel Tumbler Lock */}
      {!isUnlocked ? (
        <form
          onSubmit={(e) => void handleAttemptUnlock(e)}
          className="p-6 sm:p-8 bg-[#F3EDE2]/75 border border-[#DDD4C5] rounded-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs uppercase tracking-[0.22em] text-[#1C1917] font-semibold">
                Four-Dial Brass Tumbler
              </h2>
              <p className="text-xs text-[#57524C] mt-0.5">
                Rotate each wheel to align the four-digit release timestamp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleRequestHint()}
              className="inline-flex items-center gap-1.5 text-xs text-[#57524C] hover:text-[#1C1917] cursor-pointer self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? "Hint Revealed" : "Request Hint"}</span>
            </button>
          </div>

          {/* Interactive Dial Wheels */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
            {([0, 1, 2, 3] as const).map((idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm px-3 py-2 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => adjustDigit(idx, 1)}
                  aria-label={`Increase digit ${idx + 1}`}
                  className="p-1.5 text-[#57524C] hover:text-[#1C1917] cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span
                  className="font-mono text-2xl sm:text-3xl text-[#1C1917] w-10 text-center py-1 select-none"
                  aria-live="polite"
                >
                  {digits[idx]}
                </span>
                <button
                  type="button"
                  onClick={() => adjustDigit(idx, -1)}
                  aria-label={`Decrease digit ${idx + 1}`}
                  className="p-1.5 text-[#57524C] hover:text-[#1C1917] cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showHint && (
            <p className="text-xs text-[#545E4E] bg-[#E9ECE6] px-4 py-3 rounded-sm border border-[#545E4E]/25">
              Hint: Combine the pillar clock&apos;s frozen hour (two digits with
              leading zero) and frozen minute: <strong>07</strong> and{" "}
              <strong>45</strong>.
            </p>
          )}

          {errorFeedback && (
            <p
              role="alert"
              className="text-xs text-[#9E6B68] bg-[#F5EBEA] px-4 py-3 rounded-sm border border-[#9E6B68]/30"
            >
              {errorFeedback}
            </p>
          )}

          <div className="flex justify-center">
            <Button type="submit" size="md" className="min-w-[220px]">
              Test Combination ({digits.join("")})
            </Button>
          </div>
        </form>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 bg-[#E9ECE6]/75 border border-[#545E4E]/40 rounded-sm space-y-4"
        >
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#545E4E] font-semibold">
            Tumbler Released · 0745
          </p>
          <p className="font-serif italic text-lg text-[#1C1917] leading-relaxed">
            With a resonant click, the brass bolt retracts inside the oak frame.
            Cool night air drifts down from an upper study staircase ahead.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => void handleFinishChapter()} size="md">
              <span>Continue to Chapter 03</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
