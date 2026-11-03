"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Key, Eye, HelpCircle, ArrowRight, BookOpen, Clock, FileText } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter2Props {
  onComplete: (data: {
    cluesInspected: string[];
    attempts: number;
    hintsUsed: number;
    timeMs: number;
  }) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
}

export function Chapter2LockedRoom({ onComplete, onEvent }: Chapter2Props) {
  const [inspectedClues, setInspectedClues] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", ""]);
  const [attempts, setAttempts] = useState<number>(0);
  const [hintsCount, setHintsCount] = useState<number>(0);
  const [hintShown, setHintShown] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string>("");
  const startTimeRef = useRef<number>(0);

  const CORRECT_CODE = "0745";

  useEffect(() => {
    startTimeRef.current = Date.now();
    onEvent("chapter_started", { chapter: 2, title: "The Locked Room" });
  }, [onEvent]);

  const inspectClue = (clueId: string) => {
    setActiveModal(clueId);
    if (!inspectedClues.includes(clueId)) {
      const updated = [...inspectedClues, clueId];
      setInspectedClues(updated);
      onEvent("clue_inspected", {
        chapter: 2,
        clueId,
        order: updated.length,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleUseHint = () => {
    if (!hintShown) {
      setHintShown(true);
      setHintsCount((prev) => prev + 1);
      onEvent("hint_used", {
        chapter: 2,
        hintType: "clock_time_hint",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newDigits = [...codeDigits];
    newDigits[index] = val;
    setCodeDigits(newDigits);
    setErrorFeedback("");

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`digit-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyCode = () => {
    const entered = codeDigits.join("");
    const newAttemptCount = attempts + 1;
    setAttempts(newAttemptCount);

    const isCorrect = entered === CORRECT_CODE;
    const elapsed = Date.now() - startTimeRef.current;

    onEvent("puzzle_attempted", {
      chapter: 2,
      enteredCode: entered,
      isCorrect,
      attemptNumber: newAttemptCount,
      hintsUsed: hintsCount,
      timeToSolveMs: elapsed,
    });

    if (isCorrect) {
      setIsUnlocked(true);
      setErrorFeedback("");
    } else {
      setErrorFeedback("The lock mechanism clicks resistance. The code is incorrect.");
    }
  };

  const handleFinish = () => {
    const elapsed = Date.now() - startTimeRef.current;
    onComplete({
      cluesInspected: inspectedClues,
      attempts,
      hintsUsed: hintsCount,
      timeMs: elapsed,
    });
  };

  return (
    <div className="space-y-8">
      {/* Narrative Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <Lock className="w-3.5 h-3.5" />
          <span>The Whispering Archives • Sub-Level B</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Locked Room
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          Dust hangs suspended in shafts of dim light. A heavy mahogany door bars your passage.
        </p>
      </div>

      {/* Atmospheric Context */}
      <div className="text-sm sm:text-base font-serif text-[#292524] leading-relaxed space-y-3">
        <p>
          You step into the quiet heart of the old library. Towering bookshelves
          line the perimeter, filled with leather-bound manuscripts. Ahead, an iron-banded
          oak door is fastened with an antique mechanical four-dial tumbler.
        </p>
        <p>
          To unlock the chamber, you must examine the room, piece together the
          environmental traces, and deduce the four-digit sequence.
        </p>
      </div>

      {/* Interactive Clues Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
            Examine Environmental Clues ({inspectedClues.length} of 3 inspected)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => inspectClue("faded_note")}
            className={`p-4 rounded border text-left transition-all duration-200 ${
              inspectedClues.includes("faded_note")
                ? "border-[#5B6356] bg-[#EDF0EB]/60"
                : "border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7]"
            }`}
          >
            <div className="flex items-center space-x-2 text-[#5B6356] mb-1.5">
              <FileText className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                A Faded Note
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Resting on the librarian&apos;s desk, written in faded sepia ink.
            </p>
          </button>

          <button
            onClick={() => inspectClue("broken_clock")}
            className={`p-4 rounded border text-left transition-all duration-200 ${
              inspectedClues.includes("broken_clock")
                ? "border-[#5B6356] bg-[#EDF0EB]/60"
                : "border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7]"
            }`}
          >
            <div className="flex items-center space-x-2 text-[#5B6356] mb-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                The Broken Clock
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Mounted upon the stone pillar, its pendulum forever frozen.
            </p>
          </button>

          <button
            onClick={() => inspectClue("dusty_ledger")}
            className={`p-4 rounded border text-left transition-all duration-200 ${
              inspectedClues.includes("dusty_ledger")
                ? "border-[#5B6356] bg-[#EDF0EB]/60"
                : "border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7]"
            }`}
          >
            <div className="flex items-center space-x-2 text-[#5B6356] mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                The Vault Ledger
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              An open ledger indexing historical departures and room codes.
            </p>
          </button>
        </div>
      </div>

      {/* Clue Detail Modal / Card */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded border border-[#8C827A] bg-[#F4EFE7] space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-2">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#1C1917] font-semibold">
                <Eye className="w-3.5 h-3.5 text-[#5B6356]" />
                <span>
                  {activeModal === "faded_note" && "The Faded Note"}
                  {activeModal === "broken_clock" && "The Broken Clock"}
                  {activeModal === "dusty_ledger" && "The Vault Ledger"}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-[#78716C] hover:text-[#1C1917] uppercase tracking-wider"
              >
                Close Clue ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm font-serif text-[#292524] leading-relaxed">
              {activeModal === "faded_note" && (
                <p>
                  &ldquo;To whoever comes after: the sanctuary is sealed under
                  the silent hour. When the great pendulum halted, the hour hand
                  was locked between the seven and eight, and the minute hand stood
                  rigid upon the forty-fifth division. Let the four numbers of that
                  hour be your key.&rdquo;
                </p>
              )}
              {activeModal === "broken_clock" && (
                <div className="space-y-2">
                  <p>
                    You wipe away the cobwebs from the round brass bezel. The hour
                    hand points directly to <strong>07</strong>. The long minute
                    hand is frozen at the 9-marker, indicating exactly{" "}
                    <strong>45</strong> minutes.
                  </p>
                  <div className="p-3 bg-[#FAF8F5] rounded border border-[#E0D7CB] text-center font-mono text-base tracking-widest text-[#1C1917]">
                    FROZEN TIME: 07:45
                  </div>
                </div>
              )}
              {activeModal === "dusty_ledger" && (
                <p>
                  The folio reads: &ldquo;Record 1894. The secondary chamber
                  combination uses standard four-digit notation (HHMM) reflecting
                  the master timepiece upon the stone pillar.&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock Mechanism Panel */}
      <div className="p-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#1C1917] font-medium">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-[#5B6356]" />
            ) : (
              <Lock className="w-4 h-4 text-[#8C827A]" />
            )}
            <span>Tumbler Mechanism (4 Digits)</span>
          </div>

          {!isUnlocked && !hintShown && (
            <button
              onClick={handleUseHint}
              className="inline-flex items-center space-x-1 text-[11px] text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Consult Observation Note (Hint)</span>
            </button>
          )}
        </div>

        {hintShown && (
          <div className="p-3 bg-[#EDF0EB] text-[#3F463A] rounded text-xs space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Note Excerpt:
            </span>
            <p>
              The time shown on the clock is 07:45. In four-digit format, enter
              the digits in order: 0, 7, 4, 5.
            </p>
          </div>
        )}

        {!isUnlocked ? (
          <div className="space-y-4">
            <div className="flex justify-center space-x-3 sm:space-x-4">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`digit-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-semibold bg-[#F4EFE7] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917] text-[#1C1917] transition-colors"
                />
              ))}
            </div>

            {errorFeedback && (
              <p className="text-center text-xs text-[#A37070] font-medium">
                {errorFeedback}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleVerifyCode}
                disabled={codeDigits.some((d) => d === "")}
              >
                TURN TUMBLER
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded bg-[#EDF0EB] border border-[#5B6356]/40 text-[#2C3328] space-y-3 text-center"
          >
            <div className="inline-flex p-2 rounded-full bg-[#FAF8F5] text-[#5B6356] mb-1">
              <Key className="w-5 h-5" />
            </div>
            <h4 className="text-sm uppercase tracking-widest font-semibold text-[#1C1917]">
              The Iron Bolts Retract
            </h4>
            <p className="text-xs sm:text-sm font-serif max-w-md mx-auto leading-relaxed">
              With a deep metallic groan, the internal counterweights shift.
              The heavy oak door swings inward, revealing a dimly lit corridor
              scented with dry parchment and rain.
            </p>

            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleFinish}>
                <span>PROCEED TO CHAPTER 03</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

