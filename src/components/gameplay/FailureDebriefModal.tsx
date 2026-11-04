"use client";

import React from "react";
import { ShieldAlert, RotateCcw, XCircle, CheckCircle2, HelpCircle } from "lucide-react";

export interface FailureDebriefData {
  roundTitle: string;
  submittedAnswer: string;
  correctAnswer: string;
  failureExplanation: string;
  correctSolutionExplanation: string;
}

interface FailureDebriefModalProps {
  data: FailureDebriefData;
  onReturnToStart: () => void;
  startingScreenName?: string;
}

export function FailureDebriefModal({
  data,
  onReturnToStart,
  startingScreenName = "Starting Screen",
}: FailureDebriefModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto select-none animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 flex flex-col my-auto">
        {/* Header Alert */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-red-900/60">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 font-bold">
              Final Submission Locked • Failed
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-100">
              {data.roundTitle}
            </h3>
          </div>
        </div>

        {/* Submission Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Submitted Answer */}
          <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 uppercase font-bold mb-1">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Your Submission</span>
            </div>
            <div className="text-sm font-mono font-bold text-red-200 break-words">
              {data.submittedAnswer}
            </div>
          </div>

          {/* Correct Answer */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Correct Solution</span>
            </div>
            <div className="text-sm font-mono font-bold text-emerald-200 break-words">
              {data.correctAnswer}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3 mb-6 text-left">
          {/* Why it failed */}
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
            <div className="text-xs font-mono font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Why Your Answer Failed:</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {data.failureExplanation}
            </p>
          </div>

          {/* Correct Explanation */}
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proof of Correct Solution:</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {data.correctSolutionExplanation}
            </p>
          </div>
        </div>

        {/* Final Round Status Badge */}
        <div className="flex items-center justify-between p-3 bg-black/60 border border-zinc-800 rounded-xl mb-6 text-xs font-mono text-zinc-400">
          <span>ATTEMPTS RECORDED: 1 / 1</span>
          <span className="text-red-400 font-bold">STATUS: FAILED</span>
        </div>

        {/* Return to Start CTA */}
        <button
          type="button"
          onClick={onReturnToStart}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-red-800 via-red-700 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return to {startingScreenName} (Start New Run)</span>
        </button>
      </div>
    </div>
  );
}
