"use client";

import React from "react";
import { Lightbulb, ChevronRight, X, Sparkles } from "lucide-react";
import { getHintsForRound, RoundHints } from "@/lib/gameplay/hints-data";

interface ProgressiveHintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  unlockedHintsCount: number; // 0 to 5
  onUnlockNextHint: () => void;
}

const HINT_TIER_LABELS = [
  "Tier 1: General Direction",
  "Tier 2: Key Environmental Observation",
  "Tier 3: Logical Reasoning & Elimination",
  "Tier 4: Tactical Candidate Clue",
  "Tier 5: Specific Walkthrough Guidance",
];

export function ProgressiveHintsModal({
  isOpen,
  onClose,
  roundId,
  unlockedHintsCount,
  onUnlockNextHint,
}: ProgressiveHintsModalProps) {
  if (!isOpen) return null;

  const roundHints: RoundHints = getHintsForRound(roundId);
  const hintsRemaining = Math.max(0, 5 - unlockedHintsCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-amber-900/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 flex flex-col my-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Close hints"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-zinc-800 text-left">
          <div className="w-11 h-11 rounded-2xl bg-amber-950/70 border border-amber-700/80 flex items-center justify-center text-amber-400 shrink-0">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                Contextual Intelligence
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-amber-300 rounded-md">
                HINTS AVAILABLE: {hintsRemaining} / 5
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-amber-100">
              {roundHints.roundTitle}
            </h3>
          </div>
        </div>

        {/* Hint list */}
        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1 text-left">
          {unlockedHintsCount === 0 ? (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl text-center text-zinc-400 text-xs font-sans">
              No hints unlocked yet. Click below to reveal Tier 1 guidance. Each round permits up to 5 progressive hints.
            </div>
          ) : (
            roundHints.hints.slice(0, unlockedHintsCount).map((hintText, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-900/90 border border-amber-900/50 rounded-2xl animate-in fade-in"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold mb-1">
                  <span>{HINT_TIER_LABELS[idx]}</span>
                  <span className="text-zinc-500">#{idx + 1} of 5</span>
                </div>
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                  {hintText}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {hintsRemaining > 0 ? (
            <button
              type="button"
              onClick={onUnlockNextHint}
              className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reveal Next Clue ({hintsRemaining} Left)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full sm:flex-1 py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-xs text-center rounded-xl">
              All 5 Hints Revealed for this Chamber
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs rounded-xl transition-colors cursor-pointer"
          >
            Resume Chamber
          </button>
        </div>
      </div>
    </div>
  );
}

