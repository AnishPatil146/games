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
  pose: string;
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
    pose: "/art/characters/launch/warden_01_neutral_standing.png",
  },
  {
    id: 1,
    title: "Scene 2 — The Warden Speaks",
    startTime: 5.0,
    endTime: 11.0,
    bgImage: "/art/environments/warden_gate_wide.jpg",
    speaker: "THE WARDEN",
    dialogue: "Hello, everyone. My name is The Warden.",
    pose: "/art/characters/launch/warden_03_welcoming_gesture.png",
  },
  {
    id: 2,
    title: "Scene 3 — The Announcement",
    startTime: 11.0,
    endTime: 17.0,
    bgImage: "/art/environments/warden_gate_opening.jpg",
    speaker: "THE WARDEN",
    dialogue: "Finally... the wait is over.",
    pose: "/art/characters/launch/warden_02_walking_forward.png",
  },
  {
    id: 3,
    title: "Scene 4 — The Game Reveal",
    startTime: 17.0,
    endTime: 23.0,
    bgImage: "/art/environments/warden_gate_opening.jpg",
    speaker: "THE WARDEN",
    dialogue: "THE UNWRITTEN is officially LIVE!",
    pose: "/art/characters/launch/warden_05_guarded_standing.png",
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
    pose: "/art/characters/launch/warden_04_three_quarter_hand_in_pocket.png",
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

  // Active pose mapped to narrative scene & sub-timing across all 6 official poses
  let currentPose = "/art/characters/launch/warden_01_neutral_standing.png";
  if (isScene1) {
    currentPose = "/art/characters/launch/warden_01_neutral_standing.png";
  } else if (isScene2) {
    currentPose = "/art/characters/launch/warden_03_welcoming_gesture.png";
  } else if (isScene3) {
    currentPose = "/art/characters/launch/warden_02_walking_forward.png";
  } else if (isScene4) {
    currentPose = "/art/characters/launch/warden_05_guarded_standing.png";
  } else if (isScene5) {
    if (currentTime < 26.5) {
      currentPose = "/art/characters/launch/warden_04_three_quarter_hand_in_pocket.png";
    } else if (currentTime < 28.5) {
      currentPose = "/art/characters/launch/warden_03_welcoming_gesture.png";
    } else {
      currentPose = "/art/characters/launch/warden_06_kneeling_pose.png";
    }
  }

  // Soft edge dissolving mask: seamlessly fades the studio vignette into the game environment
  const characterMaskStyle: React.CSSProperties = {
    maskImage:
      "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 98%, transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 98%, transparent 100%)",
  };

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
            className="absolute inset-0 pointer-events-none mix-blend-screen"
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
      {/* 2. TOP CINEMATIC OVERLAY (Discreet, Borderless, Box-Free) */}
      {/* ======================================================== */}
      <header className="relative z-40 w-full flex items-center justify-between p-4 sm:p-5 md:px-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        {/* Discreet Brand Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
            title="Return to Hub"
          >
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain"
            />
          </Link>
          <div className="flex flex-col select-none">
            <span className="text-[10px] sm:text-xs font-serif font-bold tracking-[0.28em] text-[#C8B28E] uppercase drop-shadow">
              THE UNWRITTEN
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#8A8178] uppercase">
              OFFICIAL LAUNCH CINEMATIC
            </span>
          </div>
        </div>

        {/* Minimal Unobtrusive Icon Controls (Zero Border Boxes) */}
        <div className="flex items-center gap-2 sm:gap-3 text-[#FAF7F2]">
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
            className="p-2 text-[#C8B28E] hover:text-white transition-colors cursor-pointer"
            title="Toggle Framing (Auto / 16:9 / 9:16)"
          >
            {isVerticalEffective ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 transition-colors cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#C8B28E] hover:text-white" />
            )}
          </button>

          {/* Restart / Replay */}
          <button
            onClick={handleRestart}
            className="p-2 text-[#C8B28E] hover:text-white transition-colors cursor-pointer"
            title="Restart Cinematic"
            aria-label="Restart Cinematic"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. STAGE CHARACTER & REVEAL LAYER (Centered & Grounded)  */}
      {/* ======================================================== */}
      <div
        onClick={handleTogglePlay}
        className="relative z-20 flex-1 w-full flex items-end justify-center pointer-events-auto cursor-pointer overflow-hidden pb-0 select-none"
      >
        {/* ===================================================== */}
        {/* SCENE 1: Distance Silhouette Under Archway            */}
        {/* ===================================================== */}
        {isScene1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* The Warden standing in distance under the archway */}
            <motion.div
              initial={{ opacity: 0, scale: 0.32, y: 8 }}
              animate={{
                opacity: 1,
                scale: 0.34,
                y: 0,
              }}
              transition={{
                opacity: { duration: 1.8, ease: "easeOut" },
                scale: { duration: 5.0, ease: "linear" },
                y: { duration: 1.8, ease: "easeOut" },
              }}
              className={`absolute flex flex-col items-center filter contrast-125 drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                isVerticalEffective
                  ? "top-[32%] sm:top-[34%]"
                  : "top-[30%] sm:top-[32%] md:top-[34%]"
              }`}
            >
              {/* Moonbeam ray casting down upon him */}
              <div className="absolute -top-24 w-12 sm:w-20 h-40 bg-gradient-to-b from-blue-200/25 via-slate-300/10 to-transparent blur-md pointer-events-none" />

              <div
                className="relative w-36 h-72 sm:w-44 sm:h-80"
                style={characterMaskStyle}
              >
                {/* Full-body Pose 1: warden_01_neutral_standing */}
                <Image
                  src="/art/characters/launch/warden_01_neutral_standing.png"
                  alt="The Warden Silhouette"
                  fill
                  priority
                  className="object-contain object-bottom select-none brightness-[0.35]"
                />

                {/* Subtle Silver Moonlight Glint on Mask */}
                <div className="absolute top-[8%] left-[28%] w-[44%] h-[18%] bg-gradient-to-r from-transparent via-[#E2E8F0]/70 to-transparent rounded-full blur-[2px] mix-blend-screen pointer-events-none" />
              </div>

              {/* Distant Ground Mist around feet */}
              <div className="absolute -bottom-2 w-48 h-6 bg-slate-300/15 rounded-full blur-md" />
            </motion.div>

            {/* Scene 1 Grand Centered Typography (Zero Box) */}
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
        {/* SCENES 2, 3, 5: Fully Integrated Character Poses      */}
        {/* ===================================================== */}
        {(isScene2 || isScene3 || isScene5) && (
          <motion.div
            key={currentPose}
            initial={{ opacity: 0.85 }}
            animate={{
              opacity: 1,
              scale: isScene5
                ? 1.12 + scene5Progress * 0.08
                : isScene3
                ? 1.0 + scene3Progress * 0.10
                : 1.0,
              y: 0,
            }}
            transition={{
              duration: isScene3 ? 6.0 : isScene5 ? 7.0 : 0.6,
              ease: "linear",
            }}
            className="relative bottom-0 flex flex-col items-center select-none"
            style={{
              height: isVerticalEffective ? "78vh" : "min(84vh, 740px)",
              width: isVerticalEffective ? "92vw" : "min(56vw, 540px)",
              maxHeight: isVerticalEffective ? "720px" : "800px",
            }}
          >
            {/* Dynamic Ground Shadow */}
            <motion.div
              animate={{
                scaleX: isScene3 ? 1.0 + scene3Progress * 0.18 : isScene5 ? 1.2 : 1.0,
                opacity: 0.8,
              }}
              transition={{ duration: 0.5, ease: "linear" }}
              className="absolute -bottom-2 w-64 sm:w-80 md:w-96 h-8 sm:h-10 bg-black/90 rounded-full blur-xl"
            />

            {/* Controlled Micro-Breathing */}
            <motion.div
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 5.5,
                ease: "easeInOut",
              }}
              className="relative w-full h-full filter drop-shadow-[0_18px_40px_rgba(0,0,0,0.95)]"
              style={characterMaskStyle}
            >
              {/* Full-Body Character Sprite from Pose Pack */}
              <Image
                src={currentPose}
                alt="The Warden"
                fill
                priority
                unoptimized
                className="object-contain object-bottom select-none"
              />

              {/* Scene 2: Eye Contact Gleam across Mask */}
              {isScene2 && scene2Progress >= 0.08 && scene2Progress <= 0.40 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-[18%] left-[34%] w-[32%] h-[6%] bg-gradient-to-r from-transparent via-red-500/80 to-transparent blur-[1.5px] mix-blend-screen pointer-events-none"
                />
              )}

              {/* Dramatic Rim Light Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-red-600/15 mix-blend-overlay pointer-events-none" />

              {/* Scene 3: Unsealing Gate Reflection */}
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
        {/* SCENE 4: GAME REVEAL WITH THE WARDEN GUARDED STANCE   */}
        {/* ===================================================== */}
        {isScene4 && (
          <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-around px-4 sm:px-8 select-none pointer-events-none">
            {/* The Warden in Guarded Standing Pose */}
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
                  ? "order-2 h-[58vh] max-h-[520px] w-full"
                  : "order-1 h-[82vh] max-h-[700px] w-[45%]"
              }`}
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-2 w-56 sm:w-72 md:w-80 h-8 bg-black/90 rounded-full blur-xl" />

              <div
                className="relative w-full h-full filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
                style={characterMaskStyle}
              >
                {/* Pose 5: warden_05_guarded_standing */}
                <Image
                  src="/art/characters/launch/warden_05_guarded_standing.png"
                  alt="The Warden Guarded"
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

              {/* Official Silence Emblem */}
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
      {/* 4. IN-GAME FLOATING CINEMATIC SUBTITLES (Zero Boxes)      */}
      {/* ======================================================== */}
      <div className="absolute bottom-8 sm:bottom-12 inset-x-0 z-30 flex flex-col items-center justify-end px-4 sm:px-8 pointer-events-none">
        {!isScene1 && !(isScene5 && currentTime >= 27.2) && (
          <motion.div
            key={`subtitle-${currentScene.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-4xl text-center select-none"
          >
            {/* Cinematic Speaker Name */}
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.9)]" />
              <span className="font-serif font-bold text-xs sm:text-sm uppercase tracking-[0.32em] text-[#C8B28E] drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)]">
                {currentScene.speaker}
              </span>
            </div>

            {/* Subtitle Dialogue */}
            <p className="font-serif text-lg sm:text-2xl md:text-3xl font-medium tracking-wide text-[#FAF7F2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.98),0_1px_4px_rgba(0,0,0,0.95)] leading-relaxed sm:leading-relaxed max-w-3xl mx-auto">
              &ldquo;{displayedText}&rdquo;
            </p>
          </motion.div>
        )}
      </div>

      {/* Hairline 2px Progress Bar (Pinned to screen bottom, zero boxes) */}
      <div className="fixed bottom-0 inset-x-0 h-[2px] bg-white/10 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-red-700 via-red-500 to-[#C8B28E] transition-all duration-100 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
        />
      </div>

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
