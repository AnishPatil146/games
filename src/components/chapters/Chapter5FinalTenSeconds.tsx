"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Timer, HelpCircle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter5Props {
  onComplete: (data: {
    isCorrect: boolean;
    durationMs: number;
    attempts: number;
    hintsUsed: number;
  }) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
}

export function Chapter5FinalTenSeconds({ onComplete, onEvent }: Chapter5Props) {
  const [hasStartedTimer, setHasStartedTimer] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [_selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [hintsCount, setHintsCount] = useState<number>(0);
  const [hintShown, setHintShown] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [hasConcluded, setHasConcluded] = useState<boolean>(false);
  const startTimeRef = useRef<number>(0);

  const CORRECT_ANSWER = 6;
  const OPTIONS = [4, 6, 8, 10];

  const handleTimeExpire = useCallback(() => {
    if (hasConcluded) return;
    const elapsed = Date.now() - startTimeRef.current;
    setHasConcluded(true);
    setIsAnswerCorrect(false);

    onEvent("puzzle_attempted", {
      chapter: 5,
      selectedAnswer: "expired",
      isCorrect: false,
      attemptNumber: attempts + 1,
      hintsUsed: hintsCount,
      durationMs: elapsed,
    });
  }, [attempts, hasConcluded, hintsCount, onEvent]);

  useEffect(() => {
    onEvent("chapter_started", { chapter: 5, title: "The Final Ten Seconds" });
  }, [onEvent]);

  // Countdown timer hook
  useEffect(() => {
    if (!hasStartedTimer || hasConcluded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStartedTimer, hasConcluded, handleTimeExpire]);

  const handleStartChallenge = () => {
    setHasStartedTimer(true);
    startTimeRef.current = Date.now();
  };

  const handleUseHint = () => {
    if (!hintShown) {
      setHintShown(true);
      setHintsCount((prev) => prev + 1);
      onEvent("hint_used", {
        chapter: 5,
        hintType: "algebraic_substitution_hint",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSelectAnswer = (option: number) => {
    if (hasConcluded) return;

    const elapsed = Date.now() - startTimeRef.current;
    const isCorrect = option === CORRECT_ANSWER;
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setSelectedAnswer(option);
    setIsAnswerCorrect(isCorrect);
    setHasConcluded(true);

    onEvent("puzzle_attempted", {
      chapter: 5,
      selectedAnswer: option,
      isCorrect,
      attemptNumber: newAttempts,
      hintsUsed: hintsCount,
      durationMs: elapsed,
    });
  };

  const handleProceed = () => {
    const elapsed = Date.now() - startTimeRef.current;
    onComplete({
      isCorrect: isAnswerCorrect === true,
      durationMs: elapsed,
      attempts: Math.max(attempts, 1),
      hintsUsed: hintsCount,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <Timer className="w-3.5 h-3.5" />
          <span>The Vault Antechamber • High Pressure</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Final Ten Seconds
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          A timed reasoning threshold. Clarity of mind when urgency peaks.
        </p>
      </div>

      {!hasStartedTimer ? (
        /* Briefing before starting the timer */
        <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-5 text-center max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-full bg-[#E0D7CB] flex items-center justify-center mx-auto text-[#1C1917]">
            <Timer className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-[#1C1917]">
              Protocol Briefing
            </h3>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-serif">
              Ahead lies an automated vault relay. When you initiate the sequence,
              a ten-second timer will commence. Deduce the missing dial value
              from three relational clues.
            </p>
            <p className="text-[11px] text-[#8C827A] pt-1">
              Take a breath. Accuracy matters more than frantic speed.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartChallenge}
              className="w-full sm:w-auto"
            >
              START TEN-SECOND CHALLENGE
            </Button>
          </div>
        </div>
      ) : (
        /* Active Timed Challenge */
        <div className="space-y-6">
          {/* Timer Bar */}
          <div className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="uppercase tracking-wider text-[#78716C]">
                Pressure Vent Countdown
              </span>
              <span
                className={`text-base font-bold ${
                  timeLeft <= 3 ? "text-[#A37070] animate-pulse" : "text-[#1C1917]"
                }`}
              >
                00:0{timeLeft}
              </span>
            </div>

            <div className="w-full bg-[#E8E2D8] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 3 ? "bg-[#A37070]" : "bg-[#5B6356]"
                }`}
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Puzzle Clue Card */}
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7]/80 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#1C1917]">
                Relay Equations:
              </span>
              {!hasConcluded && !hintShown && (
                <button
                  onClick={handleUseHint}
                  className="text-[11px] text-[#78716C] hover:text-[#1C1917] flex items-center space-x-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Use Hint (-Accuracy metric)</span>
                </button>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs sm:text-sm text-[#292524] bg-[#FAF8F5] p-4 rounded border border-[#E0D7CB]">
              <p>• Dial A = 2 × Dial B</p>
              <p>• Dial B + Dial C = 5</p>
              <p>• Dial C = 2</p>
              <div className="pt-2 text-xs font-serif italic text-[#57534E]">
                What is the numeric value of <strong>Dial A</strong>?
              </div>
            </div>

            {hintShown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded bg-[#EDF0EB] text-[#3F463A] text-xs"
              >
                <strong>Deduction Step:</strong> Since C = 2, B must equal (5 - 2) = 3. Now multiply B by 2.
              </motion.div>
            )}
          </div>

          {/* Options */}
          {!hasConcluded ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelectAnswer(num)}
                  className="py-4 px-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#1C1917] hover:text-[#FAF8F5] font-mono text-xl font-bold transition-all text-center group"
                >
                  {num}
                </button>
              ))}
            </div>
          ) : (
            /* Concluded State */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-4"
            >
              <div className="flex items-center space-x-2">
                {isAnswerCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#5B6356]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#A37070]" />
                )}
                <span className="text-sm font-semibold uppercase tracking-wider text-[#1C1917]">
                  {isAnswerCorrect
                    ? "Calculation Verified: Dial A = 6"
                    : timeLeft === 0
                    ? "Sequence Expired"
                    : "Calculation Error: Dial A = 6"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-serif text-[#57534E] leading-relaxed">
                {isAnswerCorrect
                  ? "You retained complete logical composure while the clock ticked down. Your deductive response was verified and accepted by the relay."
                  : "Under time compression, pressure introduces variance. The door mechanism responds to your presence regardless of perfection."}
              </p>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="md" onClick={handleProceed}>
                  <span>ENTER CHAPTER 06: THE UNKNOWN WORLD</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
