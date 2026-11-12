"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface HeaderProps {
  currentChapter?: number;
  totalChapters?: number;
  hideNav?: boolean;
  tone?: "light" | "dark";
}

interface AmbientNodes {
  ctx: AudioContext;
  masterGain: GainNode;
  oscA: OscillatorNode;
  oscB: OscillatorNode;
}

export function Header({
  currentChapter,
  totalChapters = 6,
  hideNav = false,
  tone = "light",
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<AmbientNodes | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.oscA.stop();
          audioRef.current.oscB.stop();
          void audioRef.current.ctx.close();
        } catch {
          // Ignore already stopped audio context
        }
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = async () => {
    if (soundEnabled) {
      if (audioRef.current) {
        const { ctx, masterGain, oscA, oscB } = audioRef.current;
        try {
          masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
          setTimeout(() => {
            try {
              oscA.stop();
              oscB.stop();
              void ctx.close();
            } catch {
              // ignore
            }
          }, 220);
        } catch {
          // ignore
        }
        audioRef.current = null;
      }
      setSoundEnabled(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.0001;

      const oscA = ctx.createOscillator();
      oscA.type = "sine";
      oscA.frequency.value = 110; // Warm A2

      const oscB = ctx.createOscillator();
      oscB.type = "triangle";
      oscB.frequency.value = 164.81; // Fifth E3

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      oscA.start();
      oscB.start();
      masterGain.gain.setTargetAtTime(0.022, ctx.currentTime, 0.6);

      audioRef.current = { ctx, masterGain, oscA, oscB };
      setSoundEnabled(true);
    } catch {
      setSoundEnabled(false);
    }
  };

  const isDark = tone === "dark";

  return (
    <header
      className={`w-full sticky top-0 z-40 transition-colors border-b ${
        isDark
          ? "bg-[#12100E]/85 border-[#FAF7F2]/10 text-[#FAF7F2] backdrop-blur-md"
          : "bg-[#FAF7F2]/92 border-[#DDD4C5] text-[#1C1917] backdrop-blur-sm"
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="relative w-7 h-7 rounded-full border border-zinc-500/60 overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] uppercase tracking-[0.28em] font-medium ${
                isDark ? "text-[#FAF7F2]" : "text-[#1C1917]"
              }`}
            >
              THE UNWRITTEN
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#9E2A2B] font-bold">
              SILENCE
            </span>
          </div>
        </Link>

        {currentChapter !== undefined && currentChapter > 0 && (
          <div
            className="flex items-center space-x-3"
            aria-label={`Chapter ${currentChapter} of ${totalChapters}`}
          >
            <span
              className={`text-[11px] uppercase tracking-[0.22em] font-mono ${
                isDark ? "text-[#D6CEC0]" : "text-[#57524C]"
              }`}
            >
              CH. 0{currentChapter} / 0{totalChapters}
            </span>
            <div
              className="hidden sm:flex items-center space-x-1.5"
              role="progressbar"
              aria-valuenow={currentChapter}
              aria-valuemin={1}
              aria-valuemax={totalChapters}
              aria-label="Narrative chapter progress"
            >
              {Array.from({ length: totalChapters }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx + 1 === currentChapter
                      ? isDark
                        ? "bg-[#FAF7F2] w-7"
                        : "bg-[#1C1917] w-7"
                      : idx + 1 < currentChapter
                      ? "bg-[#545E4E] w-4"
                      : isDark
                      ? "bg-[#FAF7F2]/20 w-4"
                      : "bg-[#DDD4C5] w-4"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {!hideNav && (
          <nav
            aria-label="Experience utilities"
            className="flex items-center space-x-2 sm:space-x-4"
          >
            <button
              type="button"
              onClick={() => void toggleSound()}
              title={
                soundEnabled
                  ? "Mute atmospheric tone"
                  : "Enable subtle atmospheric tone"
              }
              aria-pressed={soundEnabled}
              aria-label={
                soundEnabled
                  ? "Mute atmospheric tone"
                  : "Enable subtle atmospheric tone"
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                isDark
                  ? "text-[#D6CEC0] hover:text-[#FAF7F2] hover:bg-[#FAF7F2]/10"
                  : "text-[#57524C] hover:text-[#1C1917] hover:bg-[#F3EDE2]"
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#545E4E]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {soundEnabled ? "Sound On" : "Atmosphere"}
              </span>
            </button>

            <Link
              href="/leaderboard"
              className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-sm transition-colors font-bold ${
                isDark
                  ? "text-amber-300 hover:text-amber-200 hover:bg-white/5"
                  : "text-amber-900 hover:text-amber-950 hover:bg-[#F3EDE2]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href="/privacy"
              className={`text-[11px] uppercase tracking-[0.18em] px-2 py-1.5 rounded-sm transition-colors ${
                isDark
                  ? "text-[#D6CEC0] hover:text-[#FAF7F2]"
                  : "text-[#57524C] hover:text-[#1C1917]"
              }`}
            >
              Privacy
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
