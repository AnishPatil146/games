"use client";

import React, { useState } from "react";
import { Lock, Unlock, ChevronUp, ChevronDown, KeyRound, AlertTriangle } from "lucide-react";

interface DialLockModalProps {
  correctCode?: string;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  hint?: string;
}

export function DialLockModal({
  correctCode = "0745",
  onSuccess,
  onClose,
  title = "STEEL DOOR COMBINATION TUMBLER",
  hint = "Enter the 4-digit access sequence recovered from the cell observation records.",
}: DialLockModalProps) {
  const [digits, setDigits] = useState<number[]>([0, 0, 0, 0]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const incrementDigit = (index: number) => {
    if (isUnlocked) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 1) % 10;
      return next;
    });
    setErrorStatus(null);
  };

  const decrementDigit = (index: number) => {
    if (isUnlocked) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 9) % 10;
      return next;
    });
    setErrorStatus(null);
  };

  const handleUnlock = () => {
    const entered = digits.join("");
    if (entered === correctCode) {
      setIsUnlocked(true);
      setErrorStatus(null);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setErrorStatus("INVALID SEQUENCE: Lock tumblers jammed. Verify clock and journal evidence.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border-2 border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <KeyRound className="w-5 h-5" />
          <h3 className="font-serif font-bold text-lg tracking-wider text-amber-200">
            {title}
          </h3>
        </div>
        <p className="text-xs text-zinc-400 text-center mb-6">{hint}</p>

        {/* Tumbler Dials */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-4 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-inner">
          {digits.map((digit, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => incrementDigit(idx)}
                disabled={isUnlocked}
                className="w-10 h-8 sm:w-12 sm:h-9 bg-zinc-800 hover:bg-amber-600/30 border border-zinc-700 hover:border-amber-500 rounded-t flex items-center justify-center text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                aria-label={`Increment digit ${idx + 1}`}
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              <div className="w-12 h-14 sm:w-14 sm:h-16 bg-black border-2 border-amber-900/70 rounded-md flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold text-amber-400 shadow-inner select-none">
                {digit}
              </div>

              <button
                type="button"
                onClick={() => decrementDigit(idx)}
                disabled={isUnlocked}
                className="w-10 h-8 sm:w-12 sm:h-9 bg-zinc-800 hover:bg-amber-600/30 border border-zinc-700 hover:border-amber-500 rounded-b flex items-center justify-center text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                aria-label={`Decrement digit ${idx + 1}`}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Error / Status */}
        {errorStatus && (
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/70 border border-red-800/80 p-2.5 rounded-lg mb-4 text-center">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUnlocked}
            className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-mono tracking-wider transition-colors cursor-pointer"
          >
            DISENGAGE
          </button>

          <button
            type="button"
            onClick={handleUnlock}
            disabled={isUnlocked}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isUnlocked
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 active:scale-95"
            }`}
          >
            {isUnlocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>CYLINDER OPENED</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>DISENGAGE BOLT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

