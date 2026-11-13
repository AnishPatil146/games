"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WardenCompositor } from "./WardenCompositor";
import {
  WARDEN_OUTRO_CUES,
  TimelineCue,
} from "@/lib/cinematicTimelineEngine";
import {
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Home,
  MessageSquare,
} from "lucide-react";

interface WardenCinematicOutroProps {
  onComplete: () => void;
  onRequestReview?: () => void;
}

export function WardenCinematicOutro({
  onComplete,
  onRequestReview,
}: WardenCinematicOutroProps) {
  const prefersReduced = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicBedRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = 19.52;

  // Active cue
  const activeCue: TimelineCue =
    WARDEN_OUTRO_CUES.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    ) || WARDEN_OUTRO_CUES[WARDEN_OUTRO_CUES.length - 1];

  // Audio ducking
  useEffect(() => {
    if (!musicBedRef.current) return;
    if (isMuted) {
      musicBedRef.current.volume = 0;
      if (voiceAudioRef.current) voiceAudioRef.current.volume = 0;
      return;
    }

    if (voiceAudioRef.current) voiceAudioRef.current.volume = 1.0;

    if (isPlaying) {
      musicBedRef.current.volume = 0.22;
    } else {
      musicBedRef.current.volume = 0.0;
    }
  }, [isPlaying, isMuted]);

  // Start outro playback on mount
  useEffect(() => {
    setIsPlaying(true);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.currentTime = 0;
      voiceAudioRef.current.play().catch(() => {});
    }
    if (musicBedRef.current) {
      musicBedRef.current.currentTime = 0;
      musicBedRef.current.play().catch(() => {});
    }
  }, []);

  // Time loop
  useEffect(() => {
    let animId: number;

    const syncLoop = () => {
      if (isPlaying && voiceAudioRef.current) {
        const t = voiceAudioRef.current.currentTime;
        setCurrentTime(t);

        if (voiceAudioRef.current.ended || t >= totalDuration) {
          setIsPlaying(false);
          setHasReachedEnd(true);
          return;
        }
      }
      animId = requestAnimationFrame(syncLoop);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(syncLoop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Replay
  const handleReplay = useCallback(() => {
    setHasReachedEnd(false);
    setCurrentTime(0);
    setIsPlaying(true);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.currentTime = 0;
      voiceAudioRef.current.play().catch(() => {});
    }
    if (musicBedRef.current) {
      musicBedRef.current.currentTime = 0;
      musicBedRef.current.play().catch(() => {});
    }
  }, []);

  // Close & Clean up
  const handleClose = useCallback(() => {
    if (voiceAudioRef.current) {
      try {
        voiceAudioRef.current.pause();
      } catch {
        // ignore
      }
    }
    if (musicBedRef.current) {
      try {
        musicBedRef.current.pause();
      } catch {
        // ignore
      }
    }
    try {
      sessionStorage.setItem("unwritten_outro_seen", "true");
    } catch {
      // ignore
    }
    onComplete();
  }, [onComplete]);

  // Close and open player review
  const handleProceedToReview = useCallback(() => {
    handleClose();
    onRequestReview?.();
  }, [handleClose, onRequestReview]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleReplay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleReplay]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-[#070608] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Hidden Audio Elements */}
      <audio
        ref={voiceAudioRef}
        src="/video/warden_outro.mp3"
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
          setHasReachedEnd(true);
        }}
      >
        <source src="/video/warden_outro.mp3" type="audio/mp3" />
        <source src="/video/the outro voice over.wav" type="audio/wav" />
      </audio>

      <audio
        ref={musicBedRef}
        src="/video/warden_music_bed.mp3"
        preload="auto"
        loop
      />

      {/* ============================================================ */}
      {/* 5-LAYER CINEMATIC COMPOSITOR (Clean RGBA Warden Poses)       */}
      {/* ============================================================ */}
      <WardenCompositor
        cue={activeCue}
        isPlaying={isPlaying}
        reducedMotion={prefersReduced ?? false}
        className="absolute inset-0 z-10"
      />

      {/* ============================================================ */}
      {/* CLIMAX OVERLAY: DUNGEON CONQUERED (9.0s–13.5s)               */}
      {/* ============================================================ */}
      <AnimatePresence>
        {currentTime >= 9.0 && currentTime < 13.5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2 inset-x-0 z-30 flex flex-col items-center justify-center text-center p-4 pointer-events-none select-none"
          >
            <span className="text-[11px] font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-1 drop-shadow-md">
              ONE IN CENTURIES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.2em] text-[#FAF7F2] drop-shadow-[0_4px_35px_rgba(200,178,142,0.85)]">
              DUNGEON CONQUERED
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono tracking-widest text-emerald-300 uppercase font-bold">
                Honorary Explorer Recognized
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* FLOATING SUBTITLES (Centered in lower third)                 */}
      {/* ============================================================ */}
      {!hasReachedEnd && (
        <div className="absolute bottom-16 sm:bottom-20 inset-x-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`outro-sub-${activeCue.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8B28E] animate-pulse" />
                <span className="font-serif font-bold text-[10px] uppercase tracking-[0.25em] text-[#C8B28E]">
                  {activeCue.speaker}
                </span>
              </div>

              <p className="font-serif text-base sm:text-xl font-medium tracking-wide text-[#FAF7F2] drop-shadow-[0_2px_18px_rgba(0,0,0,0.98),0_1px_4px_rgba(0,0,0,0.95)] leading-relaxed">
                &ldquo;{activeCue.subtitle}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ============================================================ */}
      {/* FINAL SLATE (At end of Outro narration: 19.52s)              */}
      {/* ============================================================ */}
      <AnimatePresence>
        {hasReachedEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#070608]/94 z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 filter drop-shadow-[0_0_40px_rgba(220,38,38,0.7)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.22em] text-[#FAF7F2] mb-1">
              THE UNWRITTEN
            </h2>

            <p className="font-serif text-xs font-bold tracking-[0.35em] text-red-500 uppercase mb-4">
              WHERE SILENCE SPEAKS
            </p>

            <blockquote className="font-serif italic text-sm sm:text-base text-[#C8B28E] tracking-wide mb-8 max-w-md mx-auto leading-relaxed">
              &ldquo;Tell me about the Dungeon... honest words would be appreciated.&rdquo;
            </blockquote>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleProceedToReview}
                className="px-6 py-3 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(220,38,38,0.7)] flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Share Honest Review</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>View Dossier & Debrief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="px-4 py-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Replay Outro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* TOP CONTROLS & HUD                                           */}
      {/* ============================================================ */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 sm:p-6 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#C8B28E]/60 bg-black/60 shadow">
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-serif font-bold text-xs tracking-[0.25em] text-[#C8B28E] uppercase hidden sm:inline">
            THE WARDEN · CONQUEST OUTRO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white/80 hover:text-white transition-all backdrop-blur-md cursor-pointer"
            title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#C8B28E]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-md group"
            title="Close / Skip Outro (Escape)"
          >
            <span>Skip Outro</span>
            <FastForward className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 z-40 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-[#C8B28E] transition-all duration-150"
          style={{ width: `${(currentTime / totalDuration) * 100}%` }}
        />
      </div>
    </motion.div>
  );
}

