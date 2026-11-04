"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Key,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { ContextualPuzzleConfig } from "@/lib/storyboard/types";

interface PuzzleOverlayProps {
  config: ContextualPuzzleConfig;
  onSolve: (success: boolean, resultData: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ContextualPuzzleOverlay({
  config,
  onSolve,
}: PuzzleOverlayProps) {
  const [solved, setSolved] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    config.timeLimitSeconds ?? null
  );

  const handleTimeExpire = useCallback(() => {
    setSolved(false);
    setFeedback("Time expired! Emergency protocols triggered.");
    setTimeout(() => {
      onSolve(false, { timedOut: true });
    }, 1200);
  }, [onSolve]);

  // Timer countdown if applicable
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || solved !== null) return;
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
  }, [timeLeft, solved, handleTimeExpire]);

  // ---------------------------------------------------------------------------
  // 1. KEYPAD CODE (Level 1)
  // ---------------------------------------------------------------------------
  const [keypadInput, setKeypadInput] = useState("");
  const handleKeypadPress = (val: string) => {
    if (keypadInput.length < 4) {
      const next = keypadInput + val;
      setKeypadInput(next);
      if (next.length === 4) {
        const expected = String(config.solution.code || "0745");
        if (next === expected) {
          setSolved(true);
          setFeedback("Access Granted. The heavy lock disengages with a hollow metallic click.");
          setTimeout(() => onSolve(true, { code: next }), 1200);
        } else {
          setFeedback("Access Denied. Incorrect sequence.");
          setTimeout(() => {
            setKeypadInput("");
            setFeedback(null);
          }, 900);
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 2. THREE DOORS (Level 2)
  // ---------------------------------------------------------------------------
  const handleDoorSelect = (doorKey: string) => {
    const isCorrect = doorKey === config.solution.correctDoor;
    if (isCorrect) {
      setSolved(true);
      setFeedback("The door swings inward silently. The truth was in the contradiction.");
      setTimeout(() => onSolve(true, { selectedDoor: doorKey }), 1200);
    } else {
      setSolved(false);
      setFeedback("A dull metallic chime echoes. This passage loops into a dead-end.");
      setTimeout(() => onSolve(false, { selectedDoor: doorKey }), 1400);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. MEMORY RECALL (Level 3)
  // ---------------------------------------------------------------------------
  const handlePropSelect = (propId: string) => {
    const isCorrect = propId === config.solution.missingPropId;
    if (isCorrect) {
      setSolved(true);
      setFeedback("Correct! The vintage brass clock was taken from the mantelpiece.");
      setTimeout(() => onSolve(true, { identifiedProp: propId }), 1200);
    } else {
      setSolved(false);
      setFeedback("Incorrect. That object was never removed.");
      setTimeout(() => onSolve(false, { identifiedProp: propId }), 1400);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. INTERROGATION DEDUCTION (Level 4)
  // ---------------------------------------------------------------------------
  const handleDeductionSelect = (optionId: string) => {
    const isCorrect = optionId === config.solution.contradictionId;
    if (isCorrect) {
      setSolved(true);
      setFeedback("Contradiction exposed! Mr. Halden claimed the logbook was sealed at midnight, yet the station train was delayed until 01:15.");
      setTimeout(() => onSolve(true, { contradictionId: optionId }), 1400);
    } else {
      setFeedback("That statement is logically consistent with earlier records. Look closer at the timeline.");
    }
  };

  // ---------------------------------------------------------------------------
  // 5. MIRROR MAZE (Level 5)
  // ---------------------------------------------------------------------------
  const [mazeSteps, setMazeSteps] = useState<string[]>([]);
  const handleMazeStep = (dir: string) => {
    const nextSteps = [...mazeSteps, dir];
    setMazeSteps(nextSteps);
    const expected = (config.solution.path as string[]) || ["NORTH", "EAST", "NORTH", "WEST"];
    if (nextSteps[nextSteps.length - 1] !== expected[nextSteps.length - 1]) {
      setFeedback("You collided with an illusory reflection! The path resets.");
      setTimeout(() => {
        setMazeSteps([]);
        setFeedback(null);
      }, 700);
      return;
    }
    if (nextSteps.length === expected.length) {
      setSolved(true);
      setFeedback("You broke through the geometric center of the hall of mirrors!");
      setTimeout(() => onSolve(true, { path: nextSteps }), 1200);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. MORAL DILEMMA (Level 6)
  // ---------------------------------------------------------------------------
  const handleMoralChoice = (choiceId: string) => {
    setSolved(true);
    const msg = choiceId === "MEDICINE"
      ? "You surrendered the antibiotics to Mira. Your survival kit is diminished, but her fever stabilizes."
      : "You kept the medicine for the road ahead. Mira's condition remains precarious.";
    setFeedback(msg);
    setTimeout(() => onSolve(true, { moralDecision: choiceId }), 1500);
  };

  // ---------------------------------------------------------------------------
  // 7. EMERGENCY DISPATCH (Level 7)
  // ---------------------------------------------------------------------------
  const handleDispatchSelect = (sector: string) => {
    setSolved(true);
    setFeedback(`Emergency power rerouted to ${sector}. Auxiliary generators online.`);
    setTimeout(() => onSolve(true, { prioritizedSector: sector }), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#FAF7F2] text-[#1C1917] rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-[#DDD4C5]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#545E4E]" />
            <h3 className="font-serif font-bold text-lg md:text-xl tracking-tight text-[#12100E]">
              {config.title}
            </h3>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${
                timeLeft < 6
                  ? "bg-red-100 text-red-700 animate-pulse"
                  : "bg-[#E7E0D3] text-[#545E4E]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm font-serif text-[#57524C] mb-6 leading-relaxed">
          {config.instructions}
        </p>

        {/* ------------------------------------------------------------------- */}
        {/* PUZZLE CONTENT SWITCHER */}
        {/* ------------------------------------------------------------------- */}

        {/* 1. KEYPAD */}
        {config.type === "keypad_code" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-12 bg-[#1C1917] text-[#52B788] rounded-xl flex items-center justify-center font-mono text-2xl tracking-[0.5em] font-bold shadow-inner border border-[#3E3834]">
              {keypadInput.padEnd(4, "-")}
            </div>
            <div className="grid grid-cols-3 gap-2.5 w-56">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(String(digit))}
                  className="h-11 rounded-lg bg-[#E7E0D3] hover:bg-[#DDD4C5] active:scale-95 text-[#1C1917] font-mono font-bold text-lg shadow-sm border border-[#DDD4C5] transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setKeypadInput("")}
                className="h-11 col-span-2 rounded-lg bg-[#F5EBEA] hover:bg-red-100 text-[#9E6B68] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-[#DDD4C5]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. THREE DOORS */}
        {config.type === "three_doors" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "OAK", label: "Door of Oak", plaque: '"The iron door tells the truth."' },
              { id: "WHITE", label: "Door of Chalk", plaque: '"The oak door speaks falsehood."' },
              { id: "IRON", label: "Door of Iron", plaque: '"The center door leads to salvation."' },
            ].map((door) => (
              <button
                key={door.id}
                onClick={() => handleDoorSelect(door.id)}
                className="p-4 rounded-2xl border-2 border-[#DDD4C5] bg-white hover:border-[#545E4E] hover:bg-[#F3EDE2] text-left transition-all flex flex-col justify-between h-36 group"
              >
                <div className="font-serif font-bold text-sm text-[#1C1917] group-hover:text-[#545E4E]">
                  {door.label}
                </div>
                <div className="text-xs font-mono text-[#8A8178] italic">
                  {door.plaque}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#545E4E] font-bold">
                  Open Door →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 3. MEMORY RECALL */}
        {config.type === "memory_recall" && (
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#8A8178] mb-3">
              Which artifact is missing from the observation table?
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "prop_clock", label: "Brass Mantel Clock" },
                { id: "prop_typewriter", label: "Vintage Typewriter" },
                { id: "prop_candelabra", label: "Three-Arm Candelabra" },
                { id: "prop_key", label: "Ornate Iron Key" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePropSelect(item.id)}
                  className="p-3 rounded-xl border border-[#DDD4C5] bg-white hover:bg-[#F3EDE2] text-left text-xs font-serif font-semibold text-[#1C1917] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. INTERROGATION DEDUCTION */}
        {config.type === "interrogation_deduction" && (
          <div className="flex flex-col gap-2.5">
            {[
              {
                id: "TIME_STAMP",
                label: "Statement A",
                text: '"I personally sealed the station register at 23:59 before retiring."',
              },
              {
                id: "DISPATCH_LOG",
                label: "Statement B",
                text: '"Platform 4 was deserted when the emergency whistle blew."',
              },
              {
                id: "TRAIN_ARRIVAL",
                label: "Contradiction (Statement C)",
                text: '"Yet station telegraph records verify the freight engine arrived at 01:15 with fresh coal dust on your coat."',
              },
            ].map((stmt) => (
              <button
                key={stmt.id}
                onClick={() => handleDeductionSelect(stmt.id)}
                className="p-3.5 rounded-xl border border-[#DDD4C5] bg-white hover:bg-[#F3EDE2] text-left transition-all"
              >
                <div className="text-xs font-bold font-mono text-[#545E4E]">
                  {stmt.label}
                </div>
                <div className="text-xs font-serif text-[#1C1917] mt-1">
                  {stmt.text}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 5. MIRROR MAZE */}
        {config.type === "mirror_maze" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs font-mono text-[#8A8178]">
              Current Trajectory: {mazeSteps.length > 0 ? mazeSteps.join(" → ") : "Entrance"}
            </div>
            <div className="grid grid-cols-3 gap-2 w-48">
              <div />
              <button
                onClick={() => handleMazeStep("NORTH")}
                className="h-10 rounded-lg bg-[#E7E0D3] hover:bg-[#DDD4C5] font-mono font-bold text-xs"
              >
                ▲ North
              </button>
              <div />
              <button
                onClick={() => handleMazeStep("WEST")}
                className="h-10 rounded-lg bg-[#E7E0D3] hover:bg-[#DDD4C5] font-mono font-bold text-xs"
              >
                ◀ West
              </button>
              <button
                onClick={() => handleMazeStep("SOUTH")}
                className="h-10 rounded-lg bg-[#E7E0D3] hover:bg-[#DDD4C5] font-mono font-bold text-xs"
              >
                ▼ South
              </button>
              <button
                onClick={() => handleMazeStep("EAST")}
                className="h-10 rounded-lg bg-[#E7E0D3] hover:bg-[#DDD4C5] font-mono font-bold text-xs"
              >
                ▶ East
              </button>
            </div>
          </div>
        )}

        {/* 6. MORAL DILEMMA */}
        {config.type === "moral_dilemma" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleMoralChoice("MEDICINE")}
              className="p-4 rounded-2xl border-2 border-[#545E4E] bg-[#E9ECE6] hover:bg-[#dbe0d7] text-left transition-all"
            >
              <div className="font-serif font-bold text-sm text-[#1C1917]">
                Surrender Antibiotics to Mira
              </div>
              <div className="text-xs font-serif text-[#57524C] mt-1.5">
                Save an injured stranger now. You will face subsequent chambers without healing reserves.
              </div>
            </button>
            <button
              onClick={() => handleMoralChoice("CONSERVE")}
              className="p-4 rounded-2xl border-2 border-[#8A8178] bg-white hover:bg-[#F3EDE2] text-left transition-all"
            >
              <div className="font-serif font-bold text-sm text-[#1C1917]">
                Conserve Medical Supplies
              </div>
              <div className="text-xs font-serif text-[#57524C] mt-1.5">
                Prioritize self-preservation. Mira must endure the night with makeshift splints alone.
              </div>
            </button>
          </div>
        )}

        {/* 7. EMERGENCY DISPATCH */}
        {config.type === "emergency_dispatch" && (
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "SECTOR_1", label: "Sector 1 — Cryo-Preservation Bank", risk: "Critical power failure in 2 minutes" },
              { id: "SECTOR_2", label: "Sector 2 — Perimeter Air Filtration", risk: "Toxic mist containment breaching" },
              { id: "SECTOR_3", label: "Sector 3 — Archives Data Core", risk: "System purge sequence initiating" },
            ].map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleDispatchSelect(sector.id)}
                className="p-3 rounded-xl border border-[#DDD4C5] bg-white hover:bg-[#F3EDE2] text-left flex justify-between items-center transition-all"
              >
                <div>
                  <div className="font-serif font-bold text-xs text-[#1C1917]">
                    {sector.label}
                  </div>
                  <div className="text-[11px] font-mono text-red-700">
                    {sector.risk}
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-[#545E4E] uppercase">
                  Reroute →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 p-3.5 rounded-xl text-xs font-serif leading-relaxed flex items-start gap-2.5 ${
              solved === true
                ? "bg-[#E9ECE6] text-[#2D3A29] border border-[#545E4E]/30"
                : solved === false
                ? "bg-[#F5EBEA] text-[#7A3230] border border-[#9E6B68]/30"
                : "bg-[#F3EDE2] text-[#57524C] border border-[#DDD4C5]"
            }`}
          >
            {solved === true ? (
              <CheckCircle2 className="w-4 h-4 text-[#545E4E] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#9E6B68] shrink-0 mt-0.5" />
            )}
            <div>{feedback}</div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
