"use client";

import React from "react";
import { LogOut, AlertTriangle, Play } from "lucide-react";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
  startingScreenName?: string;
}

export function ExitConfirmationModal({
  isOpen,
  onCancel,
  onConfirmExit,
  startingScreenName = "Starting Screen",
}: ExitConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-950/70 border border-red-700/80 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/50">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-amber-100 mb-2">
          ABANDON INVESTIGATION?
        </h3>

        {/* Explanatory Prompt */}
        <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed mb-6 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
          Are you sure you want to exit to the {startingScreenName}? Your completed chambers and eligible telemetry remain preserved. Exiting now will not mark this round as a failed submission.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:border-zinc-500"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Playing</span>
          </button>

          <button
            type="button"
            onClick={onConfirmExit}
            className="w-full sm:flex-1 py-3 px-4 bg-red-900/80 hover:bg-red-800 border border-red-700 text-red-100 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/50 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Game</span>
          </button>
        </div>
      </div>
    </div>
  );
}
