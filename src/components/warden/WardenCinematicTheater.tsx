"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Share2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";
import {
  CinematicMode,
  TimelineCue,
  WARDEN_INTRO_CUES,
  WARDEN_OUTRO_CUES,
  WARDEN_POSES_GALLERY,
} from "@/lib/cinematicTimelineEngine";

interface WardenCinematicTheaterProps {
  initialMode?: CinematicMode;
  onPoseChange?: (poseId: string) => void;
  externalTrigger?: { mode: CinematicMode; time: number; timestamp?: number } | null;
}

export function WardenCinematicTheater({
  initialMode = "intro",
  onPoseChange,
  externalTrigger,
}: WardenCinematicTheaterProps) {
  const [mode, setMode] = useState<CinematicMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicBedRef = useRef<HTMLAudioElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // External trigger effect to sync from Codex
  useEffect(() => {
    if (!externalTrigger) return;
    if (externalTrigger.mode !== mode) {
      setMode(externalTrigger.mode);
    }
    const t = externalTrigger.time;
    setCurrentTime(t);
    setHasStarted(true);
    setIsPlaying(true);

    if (voiceAudioRef.current) {
      voiceAudioRef.current.currentTime = t;
      voiceAudioRef.current.play().catch(() => {});
    }
    if (musicBedRef.current) {
      musicBedRef.current.currentTime = t % 45.0;
      musicBedRef.current.play().catch(() => {});
    }

    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [externalTrigger]);

  const cues = mode === "intro" ? WARDEN_INTRO_CUES : WARDEN_OUTRO_CUES;
  const totalDuration = mode === "intro" ? 31.55 : 19.52;

  // Active cue
  const activeCue: TimelineCue =
    cues.find((c) => currentTime >= c.startTime && currentTime < c.endTime) ||
    cues[cues.length - 1];

  // Notify parent of active pose
  useEffect(() => {
    onPoseChange?.(activeCue.poseId);
  }, [activeCue.poseId, onPoseChange]);

  // Audio source paths
  const voiceSrcMp3 =
    mode === "intro" ? "/video/warden_intro.mp3" : "/video/warden_outro.mp3";
  const voiceSrcWav =
    mode === "intro"
      ? "/video/the intro voice before game starts.wav"
      : "/video/the outro voice over.wav";
  const musicBedSrc = "/video/warden_music_bed.mp3";

  // Audio Ducking Automation
  useEffect(() => {
    if (!musicBedRef.current) return;
    if (isMuted) {
      musicBedRef.current.volume = 0;
      if (voiceAudioRef.current) voiceAudioRef.current.volume = 0;
      return;
    }

    if (voiceAudioRef.current) voiceAudioRef.current.volume = 1.0;

    // When voice is playing, duck the music bed to 0.18; in pauses, raise to 0.45
    if (isPlaying) {
      musicBedRef.current.volume = 0.22;
    } else {
      musicBedRef.current.volume = 0.0;
    }
  }, [isPlaying, isMuted, currentTime]);

  // Playback loop driven by voice audio currentTime
  useEffect(() => {
    let animId: number;

    const syncLoop = () => {
      if (isPlaying && voiceAudioRef.current) {
        const t = voiceAudioRef.current.currentTime;
        setCurrentTime(t);
        if (voiceAudioRef.current.ended || t >= totalDuration) {
          setIsPlaying(false);
          setCurrentTime(totalDuration);
          if (musicBedRef.current) {
            musicBedRef.current.pause();
          }
        }
      }
      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDuration]);

  // Start sequence
  const startPlayback = () => {
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
  };

  // Toggle pause/play
  const togglePlay = () => {
    if (!hasStarted) {
      startPlayback();
      return;
    }
    if (isPlaying) {
      voiceAudioRef.current?.pause();
      musicBedRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= totalDuration - 0.2) {
        if (voiceAudioRef.current) voiceAudioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      voiceAudioRef.current?.play().catch(() => {});
      musicBedRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Replay
  const handleReplay = () => {
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
  };

  // Switch Mode (Intro <-> Outro)
  const handleSwitchMode = (newMode: CinematicMode) => {
    if (newMode === mode) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setMode(newMode);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }
    if (musicBedRef.current) {
      musicBedRef.current.pause();
      musicBedRef.current.currentTime = 0;
    }
    // Auto restart if user has already started
    if (hasStarted) {
      setTimeout(() => {
        if (voiceAudioRef.current) {
          voiceAudioRef.current.play().catch(() => {});
        }
        if (musicBedRef.current) {
          musicBedRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }, 100);
    }
  };

  // Timeline scrub
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * totalDuration;
    setCurrentTime(newTime);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.currentTime = newTime;
    }
    if (musicBedRef.current) {
      musicBedRef.current.currentTime = newTime % 45.0;
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
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
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#070608] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.9)] select-none transition-all ${
        isFullscreen ? "h-screen max-w-none rounded-none" : "aspect-[16/10] sm:aspect-[16/9] min-h-[520px]"
      }`}
    >
      {/* Hidden Audio Elements */}
      <audio
        ref={voiceAudioRef}
        src={voiceSrcMp3}
        preload="auto"
        onEnded={() => setIsPlaying(false)}
      >
        <source src={voiceSrcMp3} type="audio/mp3" />
        <source src={voiceSrcWav} type="audio/wav" />
      </audio>

      <audio
        ref={musicBedRef}
        src={musicBedSrc}
        preload="auto"
        loop
      />

      {/* ========================================================== */}
      {/* 1. LAYERED ENVIRONMENT BACKGROUND                          */}
      {/* ========================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          key={`env-${activeCue.environment}`}
          initial={{ opacity: 0.75, scale: 1.0 }}
          animate={{
            opacity: 1,
            scale: isPlaying ? [1.0, 1.04] : 1.0,
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 12.0, ease: "linear", repeat: Infinity, repeatType: "reverse" },
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={
              activeCue.environment === "gate_opening"
                ? "/art/environments/warden_gate_opening.jpg"
                : "/art/environments/warden_gate_wide.jpg"
            }
            alt="The Warden's Gate"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-90 contrast-110"
          />
        </motion.div>

        {/* Ambient Dark Atmospheric Fog & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070608] via-black/40 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

        {/* Subtle Dynamic Rim Glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            boxShadow: `inset 0 0 120px ${activeCue.lightingColor}`,
          }}
        />
      </div>

      {/* ========================================================== */}
      {/* 2. THE WARDEN CHARACTER STAGE (100% Grounded, Zero Cutouts) */}
      {/* ========================================================== */}
      <div
        onClick={togglePlay}
        className="relative z-10 w-full h-full flex flex-col items-center justify-end cursor-pointer pb-6 sm:pb-8"
      >
        {/* Character Pose Texture */}
        <div className="relative w-full max-w-sm sm:max-w-md h-[82%] sm:h-[88%] flex items-end justify-center pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCue.poseId}
              initial={{ opacity: 0.7, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0.5, y: -4 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={activeCue.poseImage}
                alt={activeCue.speaker}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-contain object-bottom filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Floor Shadow Ring Grounding Boots */}
          <div className="absolute bottom-0 inset-x-8 h-8 rounded-full bg-black/80 blur-xl pointer-events-none" />
        </div>

        {/* ======================================================== */}
        {/* 3. DYNAMIC CENTERED VISUAL OVERLAYS                     */}
        {/* ======================================================== */}
        {/* Intro Mode: Official Title & LIVE Reveal */}
        {mode === "intro" && currentTime >= 17.5 && currentTime < 25.0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-30"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 filter drop-shadow-[0_0_35px_rgba(220,38,38,0.9)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-black tracking-[0.2em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.95)]">
              THE UNWRITTEN
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-500/80 bg-red-950/70 shadow-[0_0_20px_rgba(239,68,68,0.65)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-serif font-extrabold tracking-[0.28em] text-red-400 uppercase">
                THE GATES ARE OPEN
              </span>
            </div>
          </motion.div>
        )}

        {/* Outro Mode: Congratulations & Codex Stamp */}
        {mode === "outro" && currentTime >= 9.0 && currentTime < 13.5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-30"
          >
            <span className="text-[10px] font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-1 drop-shadow-md">
              ONE IN CENTURIES
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-black tracking-[0.2em] text-[#FAF7F2] drop-shadow-[0_0_30px_rgba(200,178,142,0.8)]">
              DUNGEON CONQUERED
            </h2>
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase mt-1">
              Honorary Explorer Recognized
            </span>
          </motion.div>
        )}

        {/* Outro Final Slate (End of Outro) */}
        {mode === "outro" && currentTime >= 17.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#080709]/92 z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
          >
            <div className="relative w-20 h-20 mb-3 filter drop-shadow-[0_0_35px_rgba(220,38,38,0.7)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-[0.22em] text-[#FAF7F2] mb-1">
              THE UNWRITTEN
            </h2>
            <p className="font-serif text-xs font-bold tracking-[0.32em] text-red-500 uppercase mb-2">
              WHERE SILENCE SPEAKS
            </p>
            <p className="font-mono text-[11px] text-[#C8B28E] tracking-widest uppercase mb-6 max-w-sm">
              &ldquo;Tell me about the Dungeon... honest words would be appreciated.&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/play"
                className="px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(220,38,38,0.7)]"
              >
                Enter the Game
              </Link>
              <button
                onClick={handleReplay}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all"
              >
                Replay Outro
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* 4. FLOATING SUBTITLES (Zero Boxes, Full Clarity)         */}
        {/* ======================================================== */}
        <div className="relative z-30 w-full max-w-2xl px-6 pointer-events-none text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`sub-${activeCue.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1 select-none"
            >
              {/* Speaker Indicator */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-serif font-bold text-[10px] uppercase tracking-[0.28em] text-[#C8B28E]">
                  {activeCue.speaker}
                </span>
              </div>

              {/* Subtitle Dialogue */}
              <p className="font-serif text-base sm:text-lg font-medium tracking-wide text-[#FAF7F2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.98),0_1px_4px_rgba(0,0,0,0.95)] leading-relaxed">
                &ldquo;{activeCue.subtitle}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 5. TOP MODE SWITCHER & HEADER BAR                          */}
      {/* ========================================================== */}
      <div
        className={`absolute top-0 inset-x-0 z-40 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Brand Stamp */}
        <Link
          href="/"
          className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C8B28E]/60 bg-black/60 shadow">
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain p-0.5"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xs tracking-[0.25em] text-[#C8B28E] uppercase">
              THE WARDEN
            </span>
            <span className="font-mono text-[9px] tracking-wider text-white/60 uppercase">
              CINEMATIC ARCHIVES
            </span>
          </div>
        </Link>

        {/* Dual Mode Switcher Pill */}
        <div className="flex items-center p-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleSwitchMode("intro")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === "intro"
                ? "bg-red-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Intro (31.5s)
          </button>
          <button
            onClick={() => handleSwitchMode("outro")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === "outro"
                ? "bg-red-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Outro (19.5s)
          </button>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#C8B28E]" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 6. BOTTOM TIMELINE & TRANSPORT CONTROLS                    */}
      {/* ========================================================== */}
      <div
        className={`absolute bottom-0 inset-x-0 z-40 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-auto transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Interactive Timeline Scrub Bar */}
        <div
          onClick={handleSeek}
          className="group relative w-full h-2 rounded-full bg-white/15 hover:h-2.5 transition-all cursor-pointer overflow-hidden mb-3"
          title="Click to seek"
        >
          {/* Cue Segment Markers */}
          {cues.map((c) => (
            <div
              key={c.id}
              className="absolute top-0 bottom-0 border-r border-black/40 z-10"
              style={{ left: `${(c.endTime / totalDuration) * 100}%` }}
            />
          ))}

          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-red-700 to-amber-500 rounded-full transition-all duration-75 relative"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>

        {/* Transport Toolbar */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Replay */}
            <button
              onClick={handleReplay}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time Stamp */}
            <span className="text-zinc-400">
              <span className="text-white font-semibold">{currentTime.toFixed(1)}s</span>
              <span className="mx-1 text-zinc-600">/</span>
              <span>{totalDuration.toFixed(1)}s</span>
            </span>

            {/* Active Pose Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#C8B28E]">
              <Sparkles className="w-3 h-3 text-red-400" />
              <span>{activeCue.poseId.replace(/_/g, " ")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Audio Download */}
            <a
              href={voiceSrcWav}
              download={`${mode}_voiceover.wav`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] transition-colors"
              title="Download uncompressed WAV recording"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Audio WAV</span>
            </a>

            {/* Enter Game CTA */}
            <Link
              href="/play"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.6)]"
            >
              <span>Play Game</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 7. INITIAL PLAY OVERLAY (Unlocks Browser Audio Interaction) */}
      {/* ========================================================== */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 bg-[#070608]/94 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative w-24 h-24 mb-5 filter drop-shadow-[0_0_45px_rgba(220,38,38,0.8)]">
            <Image
              src="/brand/emblem-silence.png"
              alt="THE UNWRITTEN Emblem"
              fill
              priority
              className="object-contain"
            />
          </div>

          <span className="text-xs font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-1.5">
            THE WARDEN CINEMATIC EXPERIENCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.2em] text-[#FAF7F2] mb-2">
            THE UNWRITTEN
          </h1>
          <p className="font-serif text-xs sm:text-sm text-[#D6CEC0] tracking-widest uppercase mb-6 max-w-sm leading-relaxed">
            Featuring original voice recordings, procedural acoustics &amp; the official Warden pose pack.
          </p>

          <button
            onClick={startPlayback}
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(220,38,38,0.75)] transform hover:scale-105 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current group-hover:animate-pulse" />
            <span>Begin Cinematic Experience</span>
          </button>
          <p className="mt-4 text-[10px] font-mono text-[#8A8178]">
            Spatial acoustics enabled. Headphones recommended.
          </p>
        </div>
      )}
    </div>
  );
}
