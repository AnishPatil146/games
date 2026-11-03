"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HelpCircle, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { VaultChronometerArtwork } from "@/components/artwork/SceneArtwork";
import { EventType } from "@/lib/types";

interface Chapter5Props {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onComplete: () => void;
}

const TOTAL_SECONDS = 10;
const CORRECT_ANSWER = 8;
const CANDIDATE_VALUES = [6, 8, 10, 12];

export function Chapter5FinalTenSeconds({
  onTrackEvent,
  onComplete,
}: Chapter5Props) {
  const prefersReducedMotion = useReducedMotion();
  const sequenceStartRef = useRef<number>(0);

  const [phase, setPhase] = useState<"briefing" | "active" | "resolved">(
    "briefing"
  );
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [attempts, setAttempts] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleTimeout = useCallback(
    async (currentAttempts: number, usedHint: boolean) => {
      setTimedOut(true);
      setIsCorrect(false);
      setPhase("resolved");
      await onTrackEvent("puzzle_attempted", {
        puzzle: "ten_second_vault_relay",
        attemptCount: currentAttempts + 1,
        selectedAnswer: "timeout",
        isCorrect: false,
        timedOut: true,
        hintUsed: usedHint,
        timeToSolveMs: TOTAL_SECONDS * 1000,
      });
      setAttempts((prev) => prev + 1);
    },
    [onTrackEvent]
  );

  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) {
      const timer = setTimeout(() => {
        void handleTimeout(attempts, hintUsed);
      }, 0);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timeLeft, attempts, hintUsed, handleTimeout]);

  const startCountdown = () => {
    sequenceStartRef.current = performance.now();
    setTimedOut(false);
    setSelectedValue(null);
    setTimeLeft(TOTAL_SECONDS);
    setPhase("active");
  };

  const handleRequestHint = async () => {
    setShowHint(true);
    if (!hintUsed) {
      setHintUsed(true);
      await onTrackEvent("hint_used", {
        puzzle: "ten_second_vault_relay",
        timeRemainingSeconds: timeLeft,
      });
    }
  };

  const handleSelectCandidate = async (val: number) => {
    if (phase !== "active") return;

    const elapsedMs = Math.max(
      120,
      Math.round(performance.now() - sequenceStartRef.current)
    );
    const nextAttempt = attempts + 1;
    const solved = val === CORRECT_ANSWER;

    setAttempts(nextAttempt);
    setSelectedValue(val);
    setIsCorrect(solved);
    setTimedOut(false);
    setPhase("resolved");

    await onTrackEvent("puzzle_attempted", {
      puzzle: "ten_second_vault_relay",
      attemptCount: nextAttempt,
      selectedAnswer: val,
      isCorrect: solved,
      timedOut: false,
      hintUsed,
      timeToSolveMs: elapsedMs,
    });
  };

  const handleProceed = async () => {
    const elapsedMs =
      sequenceStartRef.current > 0
        ? Math.max(120, Math.round(performance.now() - sequenceStartRef.current))
        : 0;

    await onTrackEvent("chapter_completed", {
      attempts,
      isCorrect,
      timedOut,
      hintUsed,
      durationMs: elapsedMs,
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 05 · Pressure Relay</span>
          <span className="font-mono text-[#9E6B68]">
            {phase === "active"
              ? `00:${String(timeLeft).padStart(2, "0")}`
              : `Attempts: ${attempts}`}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Final Ten Seconds
        </h1>
      </div>

      {/* Live Schematic Artwork */}
      <figure className="border border-[#DDD4C5] rounded-sm overflow-hidden bg-[#181614]">
        <VaultChronometerArtwork
          timeLeft={timeLeft}
          totalSeconds={TOTAL_SECONDS}
          resolvedValue={phase === "resolved" ? selectedValue : null}
        />
      </figure>

      {phase === "briefing" && (
        <div className="p-6 sm:p-8 bg-[#F3EDE2]/75 border border-[#DDD4C5] rounded-sm space-y-5">
          <p className="font-serif text-lg text-[#1C1917] leading-relaxed">
            Beyond the atelier lies a counterweighted bulkhead governed by three
            linked dials. The moment you release the safety catch, you will have
            exactly <strong>ten seconds</strong> to set Dial A before the
            solenoid resets.
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#57524C]">
              Ready your focus before initiating the timer.
            </span>
            <Button type="button" onClick={startCountdown} size="md">
              <Play className="w-3.5 h-3.5 mr-2" />
              Initiate 10-Second Sequence
            </Button>
          </div>
        </div>
      )}

      {phase === "active" && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#1C1917] rounded-sm space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#9E6B68] font-semibold">
                Relay Conditions
              </p>
              <ul className="space-y-1.5 text-sm sm:text-base text-[#1C1917] font-mono">
                <li>1. Dial C is fixed at 2.</li>
                <li>2. Dial B equals three times Dial C.</li>
                <li>3. Dial A equals Dial B plus Dial C.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => void handleRequestHint()}
              className="inline-flex items-center gap-1.5 text-xs text-[#57524C] hover:text-[#1C1917] cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hint</span>
            </button>
          </div>

          {showHint && (
            <p className="text-xs text-[#545E4E] bg-[#E9ECE6] px-3.5 py-2.5 rounded-sm">
              Hint: Dial B = 2 × 3 = 6. Add Dial C (2) to find Dial A.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#57524C]">
              Lock Dial A Value:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CANDIDATE_VALUES.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => void handleSelectCandidate(candidate)}
                  className="py-4 px-5 border border-[#DDD4C5] bg-[#F3EDE2]/65 hover:bg-[#1C1917] hover:text-[#FAF7F2] hover:border-[#1C1917] rounded-sm font-mono text-xl transition-colors cursor-pointer"
                >
                  {candidate}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {phase === "resolved" && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 sm:p-7 border rounded-sm space-y-5 ${
            isCorrect
              ? "bg-[#E9ECE6]/75 border-[#545E4E]/45"
              : "bg-[#F3EDE2]/85 border-[#DDD4C5]"
          }`}
        >
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#57524C] font-semibold">
              {isCorrect
                ? "Equilibrium Verified · Dial A = 8"
                : timedOut
                ? "Chronometer Expired · Emergency Bypass Engaged"
                : `Dial A = ${selectedValue} · Counterweight Mismatch`}
            </p>
            <p className="font-serif italic text-lg text-[#1C1917] leading-relaxed">
              {isCorrect
                ? "The three brass needles align without tremor. With four quiet clicks, the bulkhead parts onto an open terrace overlooking four distant horizons."
                : "The solenoid catches half an inch shy of equilibrium. You may reset the relay to solve the equation cleanly, or pull the manual bypass lever and continue onward."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {!isCorrect ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={startCountdown}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Retry 10-Second Relay
              </Button>
            ) : (
              <span />
            )}

            <Button
              type="button"
              size="md"
              onClick={() => void handleProceed()}
            >
              <span>Continue to Final Chapter</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
