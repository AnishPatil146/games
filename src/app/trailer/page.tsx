"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Maximize2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { createTrailerAudioEngine, TrailerAudioEngine } from "./trailerAudioEngine";

type SceneIndex = 0 | 1 | 2 | 3 | 4;

interface SceneConfig {
  id: SceneIndex;
  title: string;
  startTime: number;
  endTime: number;
  bgImage: string;
  speaker: string;
  dialogue: string;
  expression: "neutral" | "speaking" | "amused";
}

const SCENES: SceneConfig[] = [
  {
    id: 0,
    title: "Scene 1 — The Arrival",
    startTime: 0,
    endTime: 5.0,
    bgImage: "/art/environments/warden_gate_wide.jpg",
    speaker: "NARRATOR",
    dialogue: "THE WAIT IS OVER.",
    expression: "neutral",
  },
  {
    id: 1,
    title: "Scene 2 — The Warden Speaks",
    startTime: 5.0,
    endTime: 11.0,
    bgImage: "/art/environments/warden_gate_wide.jpg",
    speaker: "THE WARDEN",
    dialogue: "Hello, everyone. My name is The Warden.",
    expression: "speaking",
  },
  {
    id: 2,
    title: "Scene 3 — The Announcement",
    startTime: 11.0,
    endTime: 17.0,
    bgImage: "/art/environments/warden_gate_opening.jpg",
    speaker: "THE WARDEN",
    dialogue: "Finally... the wait is over.",
    expression: "speaking",
  },
  {
    id: 3,
    title: "Scene 4 — The Game Reveal",
    startTime: 17.0,
    endTime: 23.0,
    bgImage: "/art/environments/warden_gate_opening.jpg",
    speaker: "THE WARDEN",
    dialogue: "THE UNWRITTEN is officially LIVE!",
    expression: "amused",
  },
  {
    id: 4,
    title: "Scene 5 — The Invitation",
    startTime: 23.0,
    endTime: 30.0,
    bgImage: "/art/environments/warden_gate_opening.jpg",
    speaker: "THE WARDEN",
    dialogue:
      "Go check it out, experience the game, and don't forget to leave your honest review. I want to know what you think. I'll see you inside.",
    expression: "speaking",
  },
];

const TOTAL_DURATION = 30.0;

export default function CinematicLaunchTrailerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  // Responsive Orientation State (auto-detects portrait vs landscape)
  const [isPortrait, setIsPortrait] = useState(false);
  // Manual framing override: "auto" | "16:9" | "9:16"
  const [viewFraming, setViewFraming] = useState<"auto" | "16:9" | "9:16">("auto");

  // Audio Engine References
  const audioEngineRef = useRef<TrailerAudioEngine | null>(null);
  const spokenFlagsRef = useRef<Record<string, boolean>>({});

  const getAudioEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = createTrailerAudioEngine();
    }
    return audioEngineRef.current;
  }, []);

  // Cleanup audio engine on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current?.cleanup();
    };
  }, []);

  // Detect viewport aspect ratio cleanly on mount and resize
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerWidth / window.innerHeight < 1;
      setIsPortrait(portrait);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const isVerticalEffective =
    viewFraming === "9:16" ? true : viewFraming === "16:9" ? false : isPortrait;

  // Determine current active scene
  const currentScene: SceneConfig =
    SCENES.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ) || SCENES[SCENES.length - 1];


  // Typewriter effect synced to active dialogue
  useEffect(() => {
    if (currentScene.id === 0) {
      setDisplayedText("");
      return;
    }
    const fullText = currentScene.dialogue;
    let idx = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      idx++;
      if (idx <= fullText.length) {
        setDisplayedText(fullText.slice(0, idx));
      } else {
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [currentScene.id, currentScene.dialogue]);

  // Audio Cue Synchronizer
  const checkAudioCues = useCallback(
    (t: number, prevT: number) => {
      const engine = getAudioEngine();

      // Scene 1: Heartbeats (sub-bass decay with visceral double-pulse)
      [0.8, 1.8, 2.8, 3.8].forEach((beat) => {
        if (prevT < beat && t >= beat) {
          engine.playHeartbeat();
        }
      });

      // Scene 2: Warden Speaks (5.4s) — deep authoritative baritone + supernatural vocal resonance
      if (prevT < 5.4 && t >= 5.4 && !spokenFlagsRef.current["scene2"]) {
        spokenFlagsRef.current["scene2"] = true;
        engine.speakWardenDialogue("Hello, everyone. My name is The Warden.");
      }

      // Scene 3: Colossal Iron-and-Stone Gate Grinding Rumble (11.0s)
      if (prevT < 11.0 && t >= 11.0) {
        engine.playColossalGateRumble();
      }

      // Scene 3: Wet flagstone footsteps synced with character walking strides
      const strides: Array<{ time: number; foot: "left" | "right" }> = [
        { time: 11.5, foot: "left" },
        { time: 12.3, foot: "right" },
        { time: 13.1, foot: "left" },
        { time: 13.9, foot: "right" },
      ];
      strides.forEach(({ time, foot }) => {
        if (prevT < time && t >= time) {
          engine.playWetFootstep(foot);
        }
      });

      if (prevT < 12.0 && t >= 12.0 && !spokenFlagsRef.current["scene3"]) {
        spokenFlagsRef.current["scene3"] = true;
        engine.speakWardenDialogue("Finally... the wait is over.");
      }

      // Scene 4: High-impact cinematic sub-boom (110Hz -> 24Hz) + metallic reverberation (17.0s)
      if (prevT < 17.0 && t >= 17.0) {
        engine.playCinematicSubBoom();
      }
      if (prevT < 17.4 && t >= 17.4 && !spokenFlagsRef.current["scene4"]) {
        spokenFlagsRef.current["scene4"] = true;
        engine.speakWardenDialogue("THE UNWRITTEN is officially LIVE!");
      }

      // Scene 5: Ethereal harmonic shimmer riser (23.0s) & Final Invitation
      if (prevT < 23.0 && t >= 23.0) {
        engine.playHarmonicShimmerRiser();
      }
      if (prevT < 23.5 && t >= 23.5 && !spokenFlagsRef.current["scene5"]) {
        spokenFlagsRef.current["scene5"] = true;
        engine.speakWardenDialogue(
          "Go check it out, experience the game, and don't forget to leave your honest review. I want to know what you think. I'll see you inside."
        );
      }

      // Smooth drone tail fade at trailer outro
      if (prevT < 28.5 && t >= 28.5) {
        engine.stopAtmosphericDrone(1.5);
      }
    },
    [getAudioEngine]
  );

  // Main Playback Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            getAudioEngine().stopAtmosphericDrone(1.0);
            return TOTAL_DURATION;
          }
          checkAudioCues(next, prev);
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, checkAudioCues]);

  // Sync mute state
  useEffect(() => {
    getAudioEngine().setMuted(isMuted);
  }, [isMuted, getAudioEngine]);

  // Start Playback
  const handleStart = () => {
    const engine = getAudioEngine();
    engine.init();
    engine.setMuted(isMuted);
    engine.startAtmosphericDrone();
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (!hasStarted) {
      handleStart();
      return;
    }
    const engine = getAudioEngine();
    engine.init();
    if (!isPlaying) {
      engine.startAtmosphericDrone();
      setIsPlaying(true);
    } else {
      engine.stopAtmosphericDrone(0.4);
      engine.stopAllVoice();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    const engine = getAudioEngine();
    engine.init();
    engine.stopAllVoice();
    spokenFlagsRef.current = {};
    setCurrentTime(0);
    setIsPlaying(true);
    engine.startAtmosphericDrone();
  };

  // Keyboard shortcut (Space to pause/play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Dynamic Scene Calculations
  const isScene1 = currentTime < 5.0;
  const isScene2 = currentTime >= 5.0 && currentTime < 11.0;
  const isScene3 = currentTime >= 11.0 && currentTime < 17.0;
  const isScene4 = currentTime >= 17.0 && currentTime < 23.0;
  const isScene5 = currentTime >= 23.0;

  // Scene Progress Fractions
  const scene1Progress = Math.min(1, Math.max(0, currentTime / 5.0));
  const scene2Progress = Math.min(1, Math.max(0, (currentTime - 5.0) / 6.0));
  const scene3Progress = Math.min(1, Math.max(0, (currentTime - 11.0) / 6.0));
  const scene4Progress = Math.min(1, Math.max(0, (currentTime - 17.0) / 6.0));
  const scene5Progress = Math.min(1, Math.max(0, (currentTime - 23.0) / 7.0));

  // Cinematic Camera Tracking
  let cameraScale = 1.0;
  let cameraY = 0;
  if (isScene1) {
    cameraScale = 1.0 + scene1Progress * 0.08;
    cameraY = -scene1Progress * 12;
  } else if (isScene2) {
    cameraScale = 1.05;
    cameraY = -10;
  } else if (isScene3) {
    cameraScale = 1.06 + scene3Progress * 0.12;
    cameraY = -10 - scene3Progress * 18;
  } else if (isScene4) {
    cameraScale = 1.02;
    cameraY = -6;
  } else if (isScene5) {
    cameraScale = 1.08 + scene5Progress * 0.16;
    cameraY = -scene5Progress * 28;
  }

  // Warden Sprite Selector
  const wardenSprite =
    currentScene.expression === "amused"
      ? "/art/characters/warden_amused.png"
      : currentScene.expression === "speaking"
      ? "/art/characters/warden_speaking.png"
      : "/art/characters/warden_neutral.png";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#070608] select-none flex flex-col justify-between font-sans">
      {/* ======================================================== */}
      {/* 1. CINEMATIC FULL-BLEED BACKGROUND & VOLUMETRIC LIGHTS   */}
      {/* ======================================================== */}
      <motion.div
        animate={{
          scale: cameraScale,
          y: cameraY,
        }}
        transition={{ duration: 0.5, ease: "linear" }}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.bgImage}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={currentScene.bgImage}
              alt="The Warden's Gate"
              fill
              priority
              sizes="100vw"
              className={`select-none transition-all duration-700 ${
                isVerticalEffective
                  ? "object-cover object-[center_34%]"
                  : "object-cover object-center"
              }`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/70 pointer-events-none" />

        {/* Scene 1: Moonlight Beam Through Archway */}
        {isScene1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.55, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-radial-gradient from-blue-100/15 via-slate-400/5 to-transparent pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse at 50% 36%, rgba(200, 220, 255, 0.22) 0%, rgba(140, 160, 200, 0.08) 45%, transparent 75%)",
            }}
          />
        )}

        {/* Scene 3 & 4: Unsealing Iron Gates Crimson & Silver Volumetric Beams */}
        {(isScene3 || isScene4) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Center Unsealing Light Pillar */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{
                opacity: isScene3 ? Math.min(1, scene3Progress * 1.6) : 0.95,
                scaleY: 1,
              }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-80 md:w-96 mix-blend-screen opacity-90"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(220,38,38,0.35) 45%, rgba(185,28,28,0.15) 85%, transparent 100%)",
              }}
            />

            {/* Fanning Crimson Light Shafts (Left & Right) */}
            <motion.div
              animate={{
                opacity: [0.4, 0.75, 0.45],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 mix-blend-screen pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(239,68,68,0.3) 0%, rgba(153,27,27,0.15) 40%, transparent 70%)",
              }}
            />

            {/* Radiant Silver Shaft */}
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 md:w-3 h-3/5 bg-gradient-to-b from-white via-red-300 to-transparent blur-sm mix-blend-screen"
            />
          </div>
        )}

        {/* Low Volumetric Ground Mist & Floating Atmosphere */}
        <div className="absolute bottom-0 inset-x-0 h-40 sm:h-52 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* ======================================================== */}
      {/* 2. TOP IN-GAME HUD BAR (Authentic, Minimal, Unclipped)   */}
      {/* ======================================================== */}
      <header className="relative z-40 w-full flex items-center justify-between p-4 sm:p-5 md:px-8 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-auto">
        {/* Brand & Chapter Stamp */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C8B28E]/60 overflow-hidden shadow-lg flex-shrink-0 bg-black/60 hover:border-[#C8B28E] transition-colors"
            title="Return to Hub"
          >
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain p-0.5"
            />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#C8B28E] uppercase flex items-center gap-1.5">
              <span>THE UNWRITTEN</span>
              <span className="text-[#8A8178]">•</span>
              <span className="text-red-500 font-semibold">LAUNCH TRAILER</span>
            </span>
            <h1 className="text-xs sm:text-sm font-serif font-bold tracking-wide text-[#FAF7F2] drop-shadow-sm">
              {currentScene.title}
            </h1>
          </div>
        </div>

        {/* Floating Minimal Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* View Mode Framing Switcher */}
          <button
            onClick={() => {
              if (viewFraming === "auto") {
                setViewFraming(isPortrait ? "16:9" : "9:16");
              } else if (viewFraming === "16:9") {
                setViewFraming("9:16");
              } else {
                setViewFraming("auto");
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-[#C8B28E]/40 hover:border-[#C8B28E] transition-all shadow-md cursor-pointer"
            title="Toggle between Auto-fit, 16:9 Cinematic, and 9:16 Reel Framing"
          >
            {isVerticalEffective ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#C8B28E]" />
                <span>9:16 Reel</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#C8B28E]" />
                <span>16:9 Wide</span>
              </>
            )}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 sm:px-2.5 rounded-full bg-black/70 hover:bg-black/90 text-[#FAF7F2] backdrop-blur-md border border-[#C8B28E]/40 hover:border-[#C8B28E] transition-all shadow-md cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#52B788]" />
            )}
          </button>

          {/* Restart / Replay */}
          <button
            onClick={handleRestart}
            className="p-2 sm:px-2.5 rounded-full bg-black/70 hover:bg-black/90 text-[#FAF7F2] backdrop-blur-md border border-[#C8B28E]/40 hover:border-[#C8B28E] transition-all shadow-md cursor-pointer"
            title="Restart Cinematic"
            aria-label="Restart Cinematic"
          >
            <RotateCcw className="w-4 h-4 text-[#C8B28E]" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. STAGE CHARACTER & REVEAL LAYER (Centered & Unclipped) */}
      {/* ======================================================== */}
      <div className="relative z-20 flex-1 w-full flex items-end justify-center pointer-events-none overflow-hidden pb-2 sm:pb-3">
        {/* ===================================================== */}
        {/* SCENE 1: Distance Silhouette Under Archway            */}
        {/* ===================================================== */}
        {isScene1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* The Warden standing in distance under the archway - motionless, imposing, monolithic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.32, y: 8 }}
              animate={{
                opacity: 1,
                scale: 0.33,
                y: 0,
              }}
              transition={{
                opacity: { duration: 1.8, ease: "easeOut" },
                scale: { duration: 5.0, ease: "linear" },
                y: { duration: 1.8, ease: "easeOut" },
              }}
              className={`absolute flex flex-col items-center filter contrast-150 drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                isVerticalEffective
                  ? "top-[32%] sm:top-[34%]"
                  : "top-[30%] sm:top-[32%] md:top-[34%]"
              }`}
            >
              {/* Moonbeam ray casting down upon him */}
              <div className="absolute -top-24 w-12 sm:w-20 h-40 bg-gradient-to-b from-blue-200/25 via-slate-300/10 to-transparent blur-md pointer-events-none" />

              <div className="relative w-40 h-64 sm:w-48 sm:h-72">
                {/* Silhouette body */}
                <Image
                  src="/art/characters/warden_neutral.png"
                  alt="The Warden Silhouette"
                  fill
                  priority
                  className="object-contain object-bottom select-none brightness-[0.25]"
                />

                {/* Subtle Silver Moonlight Glint on Mask */}
                <div className="absolute top-[8%] left-[28%] w-[44%] h-[18%] bg-gradient-to-r from-transparent via-[#E2E8F0]/70 to-transparent rounded-full blur-[2px] mix-blend-screen pointer-events-none" />

                {/* Silver moonlight edge highlight on coat shoulder */}
                <div className="absolute top-[18%] left-[20%] w-[60%] h-[35%] border-t border-l border-white/40 rounded-tl-full blur-[1px] pointer-events-none mix-blend-screen" />
              </div>

              {/* Distant Ground Mist around feet */}
              <div className="absolute -bottom-2 w-48 h-6 bg-slate-300/15 rounded-full blur-md" />
            </motion.div>

            {/* Scene 1 Grand Centered Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: currentTime > 1.2 ? 1 : 0, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className={`absolute inset-x-0 flex flex-col items-center justify-center text-center px-4 ${
                isVerticalEffective ? "top-[16%]" : "top-[18%] sm:top-[20%]"
              }`}
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-2 drop-shadow-md">
                FOLIO ARCHIVES · PROLOGUE
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.22em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.75)]">
                THE WAIT IS OVER.
              </h2>
            </motion.div>
          </div>
        )}

        {/* ===================================================== */}
        {/* SCENES 2, 3, 5: Fully Integrated Animated Character   */}
        {/* ===================================================== */}
        {(isScene2 || isScene3 || isScene5) && (
          <motion.div
            key="warden-stage-character"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              // Smooth, rock-solid scale push-in without hopping or bouncing
              scale: isScene5
                ? 1.15 + scene5Progress * 0.10 // Steady, intense cinematic push-in on mask
                : isScene3
                ? 1.0 + scene3Progress * 0.12  // Deliberate, smooth advance into the light
                : 1.0,                         // Steady medium shot in Scene 2
              y: 0,
              x: 0,
            }}
            transition={{
              duration: isScene3 ? 6.0 : isScene5 ? 7.0 : 0.8,
              ease: "linear",
            }}
            className="relative bottom-0 flex flex-col items-center select-none"
            style={{
              height: isVerticalEffective ? "56vh" : "min(70vh, 580px)",
              width: isVerticalEffective ? "88vw" : "min(52vw, 480px)",
              maxHeight: isVerticalEffective ? "540px" : "600px",
            }}
          >
            {/* Dynamic Ground Shadow (Smoothly widens with scale) */}
            <motion.div
              animate={{
                scaleX: isScene3 ? 1.0 + scene3Progress * 0.18 : isScene5 ? 1.25 : 1.0,
                opacity: 0.75,
              }}
              transition={{ duration: 0.5, ease: "linear" }}
              className="absolute -bottom-3 sm:-bottom-4 w-60 sm:w-80 md:w-96 h-8 sm:h-10 bg-black/80 rounded-full blur-xl"
            />

            {/* Controlled Micro-Breathing (imperceptible, realistic, zero rubber squishing) */}
            <motion.div
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 5.5,
                ease: "easeInOut",
              }}
              className="relative w-full h-full filter drop-shadow-[0_18px_40px_rgba(0,0,0,0.92)] brightness-105"
            >
              <Image
                src={wardenSprite}
                alt="The Warden"
                fill
                priority
                unoptimized
                className="object-contain object-bottom select-none"
              />

              {/* Scene 2: Controlled Eye Contact Gleam across Mask */}
              {isScene2 && scene2Progress >= 0.08 && scene2Progress <= 0.40 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-[18%] left-[34%] w-[32%] h-[6%] bg-gradient-to-r from-transparent via-red-500/80 to-transparent blur-[1.5px] mix-blend-screen pointer-events-none"
                />
              )}

              {/* Dramatic Rim Light Highlight (Crimson & Silver) */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-red-600/18 mix-blend-overlay pointer-events-none" />

              {/* Scene 3: Gate Light Reflections on Back and Shoulders */}
              {isScene3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: Math.min(1, scene3Progress * 1.5) }}
                  className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-red-600/20 via-white/10 to-transparent mix-blend-color-dodge pointer-events-none"
                />
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ===================================================== */}
        {/* SCENE 4: GAME REVEAL WITH THE WARDEN FULLY VISIBLE!   */}
        {/* ===================================================== */}
        {isScene4 && (
          <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-around px-4 sm:px-8 select-none pointer-events-none">
            {/* The Warden standing proudly and solidly before the unsealed portal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{
                opacity: 1,
                scale: 1.0,
                y: 0,
              }}
              transition={{
                opacity: { duration: 0.7, ease: "easeOut" },
                scale: { duration: 0.7, ease: "easeOut" },
              }}
              className={`relative z-20 flex flex-col items-center select-none ${
                isVerticalEffective
                  ? "order-2 h-[42vh] max-h-[380px] w-full"
                  : "order-1 h-[68vh] max-h-[560px] w-[45%]"
              }`}
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-3 w-52 sm:w-72 md:w-80 h-8 bg-black/85 rounded-full blur-xl" />

              <div className="relative w-full h-full filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
                <Image
                  src="/art/characters/warden_amused.png"
                  alt="The Warden Proud"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom select-none"
                />

                {/* Rim light glow from unsealed portal */}
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-transparent to-amber-300/20 mix-blend-color-dodge pointer-events-none" />
              </div>
            </motion.div>

            {/* Glowing Unsealed Portal Emblem & Grand Reveal Typography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`relative z-10 flex flex-col items-center justify-center text-center p-2 sm:p-4 ${
                isVerticalEffective
                  ? "order-1 max-w-sm mb-1"
                  : "order-2 max-w-xl"
              }`}
            >
              {/* Pulsing Portal Energy Halo behind Emblem */}
              <div className="absolute w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-red-600/25 blur-3xl animate-pulse pointer-events-none" />

              {/* Official Silence Emblem - Majestic, rock-solid, radiant */}
              <div
                className={`relative mb-3 sm:mb-5 filter drop-shadow-[0_0_45px_rgba(220,38,38,0.85)] ${
                  isVerticalEffective
                    ? "w-24 h-24 sm:w-32 sm:h-32"
                    : "w-32 h-32 md:w-44 md:h-44"
                }`}
              >
                <Image
                  src="/brand/emblem-silence.png"
                  alt="THE UNWRITTEN Emblem"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Grand Title Typography */}
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className={`font-serif font-black tracking-[0.18em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.95)] ${
                  isVerticalEffective
                    ? "text-3xl sm:text-4xl"
                    : "text-4xl sm:text-5xl md:text-6xl"
                }`}
              >
                THE UNWRITTEN
              </motion.h2>

              {/* LIVE Badge */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-2 sm:mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-red-500/80 bg-red-950/60 shadow-[0_0_25px_rgba(239,68,68,0.7)] backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs sm:text-sm md:text-base font-serif font-extrabold tracking-[0.3em] text-red-400 uppercase">
                  OFFICIALLY LIVE
                </span>
              </motion.div>

              <div className="mt-3 w-28 sm:w-40 h-0.5 bg-gradient-to-r from-transparent via-[#C8B28E] to-transparent opacity-85" />
            </motion.div>
          </div>
        )}

        {/* ===================================================== */}
        {/* SCENE 5 (Ending Outro): Cinematic Fade to Black Slate */}
        {/* ===================================================== */}
        {isScene5 && currentTime >= 27.2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#080706] z-50 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 filter drop-shadow-[0_0_35px_rgba(220,38,38,0.7)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.22em] text-[#FAF7F2] mb-2">
              THE UNWRITTEN
            </h2>
            <p className="font-serif text-sm sm:text-lg font-bold tracking-[0.32em] text-red-500 uppercase mb-2">
              PLAY NOW · WHERE SILENCE SPEAKS
            </p>
            <p className="font-mono text-xs text-[#C8B28E] tracking-widest uppercase mb-8">
              A Psychological Mystery Experiment
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/play"
                className="px-8 py-3 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm sm:text-base tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.7)] transform hover:scale-105 cursor-pointer"
              >
                Enter the Game
              </Link>
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-full bg-black/60 hover:bg-black/90 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider border border-[#C8B28E]/50 hover:border-[#C8B28E] transition-all cursor-pointer"
              >
                Replay Cinematic
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. IN-GAME HIGH-CONTRAST DIALOGUE BOX (Sharp Gold Border)*/}
      {/* ======================================================== */}
      <footer className="relative z-30 w-full p-3 sm:p-4 md:px-8 pb-4 sm:pb-6 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Dialogue Box for Scenes 2, 3, 4, 5 */}
          {!isScene1 && !(isScene5 && currentTime >= 27.2) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(200,178,142,0.16)] border-2 border-[#C8B28E]/85 bg-[#0a0807]/95 backdrop-blur-xl text-[#FAF7F2]"
            >
              {/* Sharp Corner Gold Filigree Brackets */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#C8B28E]" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#C8B28E]" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#C8B28E]" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#C8B28E]" />

              {/* Speaker Header with High-Contrast Gold & Pulsing Status Jewel */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#C8B28E]/25">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.9)]" />
                  <span className="font-serif font-bold text-xs sm:text-sm uppercase tracking-[0.24em] text-[#C8B28E]">
                    {currentScene.speaker}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#A89F93] hidden xs:inline">
                    • ARCHITECT OF THE EXPERIMENT
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#C8B28E]/80 font-bold">
                  {currentTime.toFixed(1)}s / 30.0s
                </span>
              </div>

              {/* Typewriter Prose (High-Contrast, Crisp Typography) */}
              <p className="font-serif text-base sm:text-lg md:text-xl font-medium leading-relaxed sm:leading-loose text-[#FAF7F2] min-h-[48px] sm:min-h-[56px] drop-shadow-md">
                &ldquo;{displayedText}&rdquo;
              </p>

              {/* Advance / Next hint */}
              <div className="mt-2 pt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#8A8178]">
                <span>THE WARDEN&apos;S GATE · OFFICIAL PROLOGUE</span>
                <span className="flex items-center gap-1 text-[#C8B28E] font-semibold">
                  <span>Scene {currentScene.id + 1} of 5</span>
                  <ChevronRight className="w-3.5 h-3.5 animate-bounce" />
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Scrub / Progress Bar */}
        <div className="w-full max-w-3xl mt-3 sm:mt-4 flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-[#FAF7F2] border border-[#C8B28E]/40 hover:border-[#C8B28E] transition-all cursor-pointer shadow-md"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-[#C8B28E]" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-[#C8B28E]" />
            )}
          </button>
          <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-500 to-[#C8B28E] transition-all duration-100 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-bold text-[#C8B28E]">
            {Math.floor(currentTime).toString().padStart(2, "0")}:
            {Math.floor((currentTime % 1) * 10)} / 30:0s
          </span>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 5. INITIAL START OVERLAY (Prevents Autoplay Block)        */}
      {/* ======================================================== */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 filter drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]">
            <Image
              src="/brand/emblem-silence.png"
              alt="THE UNWRITTEN Emblem"
              fill
              priority
              className="object-contain"
            />
          </div>

          <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-2">
            OFFICIAL CINEMATIC TRAILER
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.2em] text-[#FAF7F2] mb-3">
            THE UNWRITTEN
          </h2>
          <p className="font-serif text-sm sm:text-base text-[#D6CEC0] tracking-widest uppercase mb-8 max-w-lg leading-relaxed">
            A 30-Second Immersive Prelude Starring The Warden
          </p>

          <button
            onClick={handleStart}
            className="group flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm sm:text-base tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(220,38,38,0.7)] transform hover:scale-105 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current group-hover:animate-pulse" />
            <span>Watch Launch Cinematic</span>
          </button>
          <p className="mt-4 text-xs font-mono text-[#8A8178]">
            Includes spatial audio synthesis and The Warden&apos;s voice.
          </p>
        </div>
      )}
    </div>
  );
}
