"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WardenCompositor } from "./WardenCompositor";
import {
  WARDEN_INTRO_CUES,
  TimelineCue,
} from "@/lib/cinematicTimelineEngine";
import {
  Volume2,
  VolumeX,
  FastForward,
  Play,
  Sparkles,
  Key,
} from "lucide-react";

interface WardenCinematicIntroProps {
  onComplete: () => void;
  isReplay?: boolean;
}

export function WardenCinematicIntro({
  onComplete,
  isReplay = false,
}: WardenCinematicIntroProps) {
  const prefersReduced = useReducedMotion();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicBedRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = 31.55;

  // Active cue
  const activeCue: TimelineCue =
    WARDEN_INTRO_CUES.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    ) || WARDEN_INTRO_CUES[WARDEN_INTRO_CUES.length - 1];

  // If user prefers reduced motion and this is not an explicit replay, skip immediately
  useEffect(() => {
    if (prefersReduced && !isReplay) {
      try {
        sessionStorage.setItem("unwritten_intro_seen", "true");
      } catch {
        // ignore
      }
      onComplete();
    }
  }, [prefersReduced, isReplay, onComplete]);

  // Audio ducking: Duck music bed volume during narration
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

  // Start Intro with Audio
  const startExperience = useCallback(() => {
    setHasStarted(true);
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

  // Time tracking loop
  useEffect(() => {
    let animId: number;

    const syncLoop = () => {
      if (isPlaying && voiceAudioRef.current) {
        const t = voiceAudioRef.current.currentTime;
        setCurrentTime(t);

        if (voiceAudioRef.current.ended || t >= totalDuration) {
          setIsPlaying(false);
          finishIntro();
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

  // Finish intro & transition cleanly
  const finishIntro = useCallback(() => {
    setIsEnding(true);
    try {
      sessionStorage.setItem("unwritten_intro_seen", "true");
    } catch {
      // ignore
    }
    if (musicBedRef.current) {
      try {
        musicBedRef.current.pause();
      } catch {
        // ignore
      }
    }
    if (voiceAudioRef.current) {
      try {
        voiceAudioRef.current.pause();
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [onComplete]);

  // Skip Intro
  const handleSkip = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  // Keyboard shortcut listener (ESC to skip, M to mute, Space to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Auto-attempt start on mount if browser allows
  useEffect(() => {
    if (!hasStarted) {
      const timer = setTimeout(() => {
        // Attempt instant start if user previously interacted or on replay
        if (isReplay) {
          startExperience();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, isReplay, startExperience]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isEnding ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-[#070608] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Audio Engine Elements */}
      <audio
        ref={voiceAudioRef}
        src="/video/warden_intro.mp3"
        preload="auto"
        onEnded={finishIntro}
      >
        <source src="/video/warden_intro.mp3" type="audio/mp3" />
        <source
          src="/video/the intro voice before game starts.wav"
          type="audio/wav"
        />
      </audio>

      <audio
        ref={musicBedRef}
        src="/video/warden_music_bed.mp3"
        preload="auto"
        loop
      />

      {/* ============================================================ */}
      {/* INITIAL START GATE (Permitted User Interaction for Audio)   */}
      {/* ============================================================ */}
      {!hasStarted && (
        <div
          onClick={startExperience}
          className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
        >
          {/* Subtle Ambient Gate Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-red-950/40 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-md mx-auto space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto filter drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C8B28E] block">
                THE DOORS OF SILENCE
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#FAF7F2] tracking-wide">
                THE UNWRITTEN
              </h1>
              <p className="font-serif text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                The gates have remained sealed for centuries. Enter to awaken the Warden and begin the experience.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startExperience();
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.75)] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Begin Cinematic Intro</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Skip to Game
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
      {/* OFFICIAL THE UNWRITTEN REVEAL & EMBLEM OVERLAY (17.5s–25s)  */}
      {/* (Positioned safely below face across lower-middle zone)      */}
      {/* ============================================================ */}
      <AnimatePresence>
        {currentTime >= 17.5 && currentTime < 25.0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-32 sm:bottom-36 inset-x-0 z-30 flex flex-col items-center justify-center text-center p-4 pointer-events-none select-none"
          >
            {/* Ambient Energy Flare */}
            <div className="absolute w-48 h-48 rounded-full bg-red-600/30 blur-3xl pointer-events-none" />

            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 filter drop-shadow-[0_0_40px_rgba(220,38,38,0.95)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.2em] text-[#FAF7F2] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] leading-tight">
              THE UNWRITTEN
            </h2>

            <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-red-500/80 bg-red-950/80 shadow-[0_0_25px_rgba(239,68,68,0.7)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-serif font-extrabold tracking-[0.28em] text-red-300 uppercase">
                THE GATES ARE OPEN
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* FLOATING SUBTITLES (Centered in lower third, crystal clear)  */}
      {/* ============================================================ */}
      <div className="absolute bottom-12 sm:bottom-16 inset-x-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`intro-sub-${activeCue.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto space-y-1.5"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
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

      {/* ============================================================ */}
      {/* TOP CONTROLS & HUD (Skip, Mute, Timeline Progress)           */}
      {/* ============================================================ */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 sm:p-6 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Brand Stamp */}
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
            THE UNWRITTEN · PROLOGUE
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mute Button */}
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

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-md group"
            title="Skip Intro (Escape)"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Subtle Progress Bar at bottom */}
      <div className="absolute bottom-0 inset-x-0 z-40 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-[#C8B28E] transition-all duration-150"
          style={{ width: `${(currentTime / totalDuration) * 100}%` }}
        />
      </div>
    </motion.div>
  );
}

