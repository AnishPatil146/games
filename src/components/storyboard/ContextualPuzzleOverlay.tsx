"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Key,
  RotateCcw,
  CheckCircle2,
  Flame,
  DoorClosed,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { ContextualPuzzleConfig } from "@/lib/storyboard/types";
import { SudokuBoard } from "@/components/gameplay/SudokuBoard";
import { ChessBoard } from "@/components/gameplay/ChessBoard";
import { InteractiveMaze } from "@/components/gameplay/InteractiveMaze";

interface PuzzleOverlayProps {
  config: ContextualPuzzleConfig;
  onSolve: (success: boolean, resultData: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ContextualPuzzleOverlay({
  config,
  onSolve,
  onCancel,
}: PuzzleOverlayProps) {
  const [solved, setSolved] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    config.timeLimitSeconds ?? null
  );
  const [hasFailed, setHasFailed] = useState<boolean>(false);
  const [keypadInput, setKeypadInput] = useState<string>("");

  // Time expiration handler - strictly prevents auto-advancing to victory
  const handleTimeExpire = useCallback(() => {
    setSolved(false);
    setHasFailed(true);
    setFeedback("TIME EXPIRED: Containment protocols activated. You must reset and retry.");
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || solved !== null || hasFailed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleTimeExpire();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, solved, hasFailed, handleTimeExpire]);

  // Retry after failure
  const handleRetry = () => {
    setSolved(null);
    setHasFailed(false);
    setFeedback(null);
    if (config.timeLimitSeconds) {
      setTimeLeft(config.timeLimitSeconds);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. FULL SUDOKU ENGINE
  // ---------------------------------------------------------------------------
  if (config.type === "sudoku_matrix" || config.type === "multiplayer_sudoku") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <SudokuBoard
          title={config.title}
          subtitle={config.instructions}
          onComplete={(stats) => {
            setSolved(true);
            setTimeout(() => onSolve(true, { sudoku: stats }), 1200);
          }}
          onExit={onCancel}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. FULL CHESS ENGINE
  // ---------------------------------------------------------------------------
  if (config.type === "chess_tactics" || config.type === "multiplayer_chess") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <ChessBoard
          title={config.title}
          onComplete={(stats) => {
            setSolved(true);
            setTimeout(() => onSolve(true, { chess: stats }), 1200);
          }}
          onExit={onCancel}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. FULL INTERACTIVE MAZE
  // ---------------------------------------------------------------------------
  if (config.type === "mirror_maze") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <InteractiveMaze
          onComplete={(stats) => {
            setSolved(true);
            setTimeout(() => onSolve(true, { maze: stats }), 1200);
          }}
          onExit={onCancel}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. KEYPAD COMBINATION
  // ---------------------------------------------------------------------------
  const handleKeypadPress = (val: string) => {
    if (hasFailed || solved) return;
    if (keypadInput.length < 4) {
      const next = keypadInput + val;
      setKeypadInput(next);
      if (next.length === 4) {
        const expected = String(config.solution.code || "0745");
        if (next === expected) {
          setSolved(true);
          setFeedback("ACCESS GRANTED: Magnetic deadbolt disengages with a heavy hydraulic hiss.");
          setTimeout(() => onSolve(true, { code: next }), 1200);
        } else {
          setFeedback("ACCESS DENIED: Sequence rejected. Tumblers reset.");
          setTimeout(() => {
            setKeypadInput("");
            setFeedback(null);
          }, 900);
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 5. THREE DOORS LOGICAL DEDUCTION
  // ---------------------------------------------------------------------------
  const handleDoorSelect = (doorKey: string) => {
    if (hasFailed || solved) return;
    const isCorrect = doorKey === config.solution.correctDoor;
    if (isCorrect) {
      setSolved(true);
      setFeedback("CORRECT: The Door of Chalk swings inward silently. The truth was concealed in the contradiction.");
      setTimeout(() => onSolve(true, { selectedDoor: doorKey }), 1300);
    } else {
      setFeedback("WRONG DOOR: A piercing siren echoes through the stone archway! Electric charges seal the threshold.");
      setHasFailed(true);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. MEMORY RECALL (Artifact missing)
  // ---------------------------------------------------------------------------
  const handlePropSelect = (propId: string) => {
    if (hasFailed || solved) return;
    const isCorrect = propId === config.solution.missingPropId;
    if (isCorrect) {
      setSolved(true);
      setFeedback("CORRECT: The brass mantel clock measured time that never transpired. Memory integrity validated.");
      setTimeout(() => onSolve(true, { identifiedProp: propId }), 1300);
    } else {
      setFeedback("INCORRECT: That object was never removed from the display setting. Try again.");
      setHasFailed(true);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. INTERROGATION CONTRADICTION
  // ---------------------------------------------------------------------------
  const handleDeductionSelect = (optionId: string) => {
    if (hasFailed || solved) return;
    const isCorrect = optionId === config.solution.contradictionId;
    if (isCorrect) {
      setSolved(true);
      setFeedback("CONTRADICTION EXPOSED: Halden claimed he locked the ledger at midnight, but the station log confirms the midnight train was delayed until 01:15!");
      setTimeout(() => onSolve(true, { contradictionId: optionId }), 1500);
    } else {
      setFeedback("That statement is logically consistent with earlier testimony. Look closer at the timeline.");
      setHasFailed(true);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. EMERGENCY DISPATCH / RESOURCE MATRIX
  // ---------------------------------------------------------------------------
  const handleDispatchSelect = (sector: string) => {
    if (hasFailed || solved) return;
    const isCorrect =
      !config.solution.correctSector || sector === config.solution.correctSector;
    if (isCorrect) {
      setSolved(true);
      setFeedback(`CRITICAL DISPATCH CONFIRMED: Power redirected to ${sector}. Systems stabilizing.`);
      setTimeout(() => onSolve(true, { prioritizedSector: sector }), 1300);
    } else {
      setFeedback(`POWER SURGE: Rerouting to ${sector} caused an auxiliary grid overload!`);
      setHasFailed(true);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. MORAL CHOICE
  // ---------------------------------------------------------------------------
  const handleMoralChoice = (choiceId: string) => {
    setSolved(true);
    const msg =
      choiceId === "MEDICINE"
        ? "You surrendered the antibiotics. Your personal reserves are depleted, but Mira's pulse strengthens."
        : "You withheld the medicine. Survival requires ruthless calculation, but the moral weight lingers.";
    setFeedback(msg);
    setTimeout(() => onSolve(true, { moralDecision: choiceId }), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl text-zinc-100 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-lg md:text-xl tracking-wider text-amber-100">
              {config.title}
            </h3>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${
                timeLeft < 6
                  ? "bg-red-950/80 border border-red-700 text-red-400 animate-pulse"
                  : "bg-zinc-900 border border-zinc-800 text-amber-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-xs sm:text-sm font-sans text-zinc-300 mb-6 leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/60">
          {config.instructions}
        </p>

        {/* Failure Retry Banner */}
        {hasFailed && (
          <div className="flex flex-col items-center justify-center p-4 mb-4 bg-red-950/80 border-2 border-red-700 rounded-xl text-center animate-shake">
            <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-sm mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span>CHALLENGE FAILED</span>
            </div>
            <p className="text-xs text-red-200 mb-3">{feedback}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET AND RETRY</span>
            </button>
          </div>
        )}

        {/* Success Banner */}
        {solved && feedback && (
          <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs sm:text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* PUZZLE CONTENT SWITCHER */}
        {/* ------------------------------------------------------------------- */}

        {/* 1. KEYPAD CODE */}
        {config.type === "keypad_code" && !hasFailed && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-12 bg-black text-amber-400 rounded-xl flex items-center justify-center font-mono text-2xl tracking-[0.5em] font-bold shadow-inner border border-amber-900/60">
              {keypadInput.padEnd(4, "-")}
            </div>
            <div className="grid grid-cols-3 gap-2.5 w-60">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(String(digit))}
                  className="h-11 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-amber-300 font-mono font-bold text-lg shadow-sm border border-zinc-700 hover:border-amber-500 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setKeypadInput("")}
                className="h-11 col-span-2 rounded-lg bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. THREE DOORS */}
        {config.type === "three_doors" && !hasFailed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "OAK", label: "Door of Oak", plaque: '"The iron door speaks absolute truth."' },
              { id: "WHITE", label: "Door of Chalk", plaque: '"The oak door speaks falsehood."' },
              { id: "IRON", label: "Door of Iron", plaque: '"The center door leads to salvation."' },
            ].map((door) => (
              <button
                key={door.id}
                type="button"
                onClick={() => handleDoorSelect(door.id)}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-500 hover:bg-zinc-800 text-left transition-all flex flex-col justify-between h-36 group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-amber-200 group-hover:text-amber-400">
                  <DoorClosed className="w-4 h-4 text-amber-500" />
                  <span>{door.label}</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 italic">
                  {door.plaque}
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Open Door →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 3. MEMORY RECALL */}
        {config.type === "memory_recall" && !hasFailed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "prop_portrait", title: "Founder's Oil Portrait", desc: "Heavy mahogany frame with cracked varnish." },
              { id: "prop_clock", title: "Brass Mantel Clock", desc: "Ornate dual-escapement clock stopped at 07:45." },
              { id: "prop_quill", title: "Silver Writing Quill", desc: "Blackened raven feather resting on blotter." },
              { id: "prop_globe", title: "Astronomical Celestial Globe", desc: "Iron rings charting constellations." },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePropSelect(item.id)}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-500 hover:bg-zinc-800 text-left transition-all cursor-pointer group"
              >
                <div className="font-serif font-bold text-sm text-zinc-200 group-hover:text-amber-300">
                  {item.title}
                </div>
                <div className="text-xs text-zinc-400 mt-1">{item.desc}</div>
                <div className="text-[10px] font-mono text-amber-400/80 mt-2 uppercase font-bold">
                  Select as Missing →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 4. INTERROGATION DEDUCTION */}
        {config.type === "interrogation_deduction" && !hasFailed && (
          <div className="space-y-2.5">
            {[
              {
                id: "BARRACKS_LOG",
                text: '"I went straight to sleep in the East Barracks before midnight."',
                hint: "Consistent with dormitory records.",
              },
              {
                id: "TRAIN_ARRIVAL",
                text: '"I locked the registry ledger at midnight after seeing off the midnight freight."',
                hint: "CONTRADICTION: Dispatch logs confirm the train was delayed until 01:15!",
              },
              {
                id: "KEY_RING",
                text: '"The mirror rotunda keys remained on the peg all night."',
                hint: "Plausible, but secondary.",
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleDeductionSelect(opt.id)}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-500 hover:bg-zinc-800 text-left transition-all cursor-pointer group flex flex-col gap-1"
              >
                <span className="text-xs sm:text-sm text-zinc-200 group-hover:text-amber-200 font-mono">
                  {opt.text}
                </span>
                <span className="text-[10px] text-zinc-500 group-hover:text-amber-400/70 font-mono uppercase">
                  Flag as Contradiction →
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 5. EMERGENCY DISPATCH */}
        {config.type === "emergency_dispatch" && !hasFailed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "SECTOR_A_ICU", label: "Sector A: Life-Support ICU", load: "78% Vital", critical: true },
              { id: "SECTOR_B_SECURITY", label: "Sector B: Perimeter Blast Doors", load: "52% Stable", critical: false },
              { id: "SECTOR_C_REACTOR", label: "Sector C: Coolant Core Turbines", load: "94% Overheat", critical: true },
              { id: "SECTOR_D_COMMS", label: "Sector D: Transmission Beacon", load: "30% Idle", critical: false },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleDispatchSelect(sec.id)}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-500 hover:bg-zinc-800 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-zinc-200 group-hover:text-amber-300">
                    {sec.label}
                  </span>
                  {sec.critical && <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">Status: {sec.load}</div>
                <div className="text-[10px] font-mono text-amber-400 mt-2 font-bold uppercase">
                  Reroute Priority Power →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 6. MORAL CHOICE */}
        {config.type === "moral_dilemma" && !hasFailed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleMoralChoice("MEDICINE")}
              className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/30 hover:border-amber-500 hover:bg-amber-950/60 text-left transition-all cursor-pointer"
            >
              <div className="text-sm font-serif font-bold text-amber-200 mb-1">
                Surrender the Antibiotics
              </div>
              <p className="text-xs text-zinc-300 mb-3">
                Save Mira from septic shock. Aarav continues with empty reserves.
              </p>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                Choose Altruism →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMoralChoice("KEEP")}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800 text-left transition-all cursor-pointer"
            >
              <div className="text-sm font-serif font-bold text-zinc-200 mb-1">
                Preserve Survival Kit
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Prioritize the expedition objective. The mission cannot afford vulnerability.
              </p>
              <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                Choose Survival →
              </span>
            </button>
          </div>
        )}

        {/* Footer Hint */}
        {config.hint && !hasFailed && (
          <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Hint: {config.hint}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
