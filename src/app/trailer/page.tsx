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
  Download,
  Smartphone,
  Maximize2,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

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
  const [isVerticalMode, setIsVerticalMode] = useState(false); // Toggle 9:16 Reel vs Full Cinematic
  const [hasStarted, setHasStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  // Audio Context and Synth References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const spokenFlagsRef = useRef<Record<string, boolean>>({});

  // Canvas ref for video export capture
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current active scene
  const currentScene: SceneConfig =
    SCENES.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ) || SCENES[SCENES.length - 1];

  // Web Audio Initializer
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(isMuted ? 0 : 0.85, ctx.currentTime);
        master.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = master;
      }
    } else if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }
  }, [isMuted]);

  // Procedural Sound FX
  const playHeartbeat = useCallback(
    (offset = 0) => {
      if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.18);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.65, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start(t);
      osc.stop(t + 0.25);
    },
    [isMuted]
  );

  const playDoorRumble = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const dur = 4.0;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);
    noise.start(t);
    noise.stop(t + dur);
  }, [isMuted]);

  const playImpactBoom = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(26, t + 1.2);
    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 2.1);
  }, [isMuted]);

  const playRiser = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 2.5);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 2.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 2.6);
  }, [isMuted]);

  const playFootstep = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 0.15);
  }, [isMuted]);

  // Web Speech Baritone Voice Synthesis
  const speakDialogue = useCallback(
    (text: string) => {
      if (isMuted || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88;
      u.pitch = 0.72; // Deep, calm, mysterious host tone
      const voices = window.speechSynthesis.getVoices();
      const deepVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Male") ||
            v.name.includes("David") ||
            v.name.includes("George") ||
            v.name.includes("Daniel") ||
            v.name.includes("Guy"))
      );
      if (deepVoice) u.voice = deepVoice;
      window.speechSynthesis.speak(u);
    },
    [isMuted]
  );

  // Typewriter effect synced to active dialogue
  useEffect(() => {
    if (currentScene.id === 0) {
      // Scene 1: Handled by centered cinematic typography
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
      // Scene 1 Heartbeats
      [0.8, 1.8, 2.8, 3.8].forEach((beat) => {
        if (prevT < beat && t >= beat) {
          playHeartbeat(0);
        }
      });

      // Scene 2 Warden Greeting (5.5s)
      if (prevT < 5.4 && t >= 5.4 && !spokenFlagsRef.current["scene2"]) {
        spokenFlagsRef.current["scene2"] = true;
        speakDialogue("Hello, everyone. My name is The Warden.");
      }

      // Scene 3 Footsteps & Gate Unsealing (11.2s - 13.5s)
      if (prevT < 11.2 && t >= 11.2) {
        playDoorRumble();
      }
      [11.5, 12.3, 13.1].forEach((stepT) => {
        if (prevT < stepT && t >= stepT) {
          playFootstep();
        }
      });
      if (prevT < 12.0 && t >= 12.0 && !spokenFlagsRef.current["scene3"]) {
        spokenFlagsRef.current["scene3"] = true;
        speakDialogue("Finally... the wait is over.");
      }

      // Scene 4 Impact Sub-Boom & Game Reveal (17.0s)
      if (prevT < 17.0 && t >= 17.0) {
        playImpactBoom();
      }
      if (prevT < 17.4 && t >= 17.4 && !spokenFlagsRef.current["scene4"]) {
        spokenFlagsRef.current["scene4"] = true;
        speakDialogue("THE UNWRITTEN is officially LIVE!");
      }

      // Scene 5 Riser & Invitation (23.2s)
      if (prevT < 23.2 && t >= 23.2) {
        playRiser();
      }
      if (prevT < 23.5 && t >= 23.5 && !spokenFlagsRef.current["scene5"]) {
        spokenFlagsRef.current["scene5"] = true;
        speakDialogue(
          "Go check it out, experience the game, and don't forget to leave your honest review. I want to know what you think. I'll see you inside."
        );
      }
    },
    [playHeartbeat, playDoorRumble, playFootstep, playImpactBoom, playRiser, speakDialogue]
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
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : 0.85,
        audioCtxRef.current.currentTime
      );
    }
    if (isMuted && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // Start Playback
  const handleStart = () => {
    initAudio();
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (!hasStarted) {
      handleStart();
      return;
    }
    initAudio();
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    initAudio();
    spokenFlagsRef.current = {};
    setCurrentTime(0);
    setIsPlaying(true);
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

  // Scene 1 & Scene 3 Animation parameters
  const scene1Progress = currentTime / 5.0;
  const scene3Progress = (currentTime - 11.0) / 6.0;
  const scene5Progress = (currentTime - 23.0) / 7.0;

  // Camera Dolly Calculation (Subtle slow tracking forward)
  let cameraScale = 1.0;
  let cameraY = 0;
  if (isScene1) {
    cameraScale = 1.0 + scene1Progress * 0.08;
    cameraY = -scene1Progress * 15;
  } else if (isScene2) {
    cameraScale = 1.04;
    cameraY = -10;
  } else if (isScene3) {
    cameraScale = 1.06 + scene3Progress * 0.12;
    cameraY = -10 - scene3Progress * 20;
  } else if (isScene4) {
    cameraScale = 1.0;
    cameraY = 0;
  } else if (isScene5) {
    cameraScale = 1.05 + scene5Progress * 0.15;
    cameraY = -scene5Progress * 30;
  }

  // Warden Character Animation States
  const wardenSprite =
    currentScene.expression === "amused"
      ? "/art/characters/warden_amused.png"
      : currentScene.expression === "speaking"
      ? "/art/characters/warden_speaking.png"
      : "/art/characters/warden_neutral.png";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#070608] select-none flex items-center justify-center font-sans">
      {/* Outer Viewport Container (Switchable between Full-Screen In-Game and 9:16 Vertical Reel) */}
      <div
        className={`relative transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between ${
          isVerticalMode
            ? "w-full max-w-[440px] h-[92vh] max-h-[880px] rounded-2xl border border-white/15"
            : "w-full h-full"
        }`}
      >
        {/* ======================================================== */}
        {/* 1. CINEMATIC BACKGROUND LAYER WITH CAMERA DOLLY ZOOM     */}
        {/* ======================================================== */}
        <motion.div
          animate={{
            scale: cameraScale,
            y: cameraY,
          }}
          transition={{ duration: 0.5, ease: "linear" }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.bgImage}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.5 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={currentScene.bgImage}
                alt="The Warden's Gate"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center select-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Atmospheric Graphic Novel Tone & Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

          {/* Crimson & Silver Portal Light Shafts (Scenes 3 & 4) */}
          {(isScene3 || isScene4) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isScene3 ? Math.min(1, scene3Progress * 1.5) : 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-radial-gradient from-red-600/25 via-red-950/10 to-transparent pointer-events-none mix-blend-screen"
            />
          )}

          {/* Low Volumetric Ground Mist / Fog */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 via-white/5 to-transparent pointer-events-none opacity-80" />
        </motion.div>

        {/* ======================================================== */}
        {/* 2. TOP IN-GAME HUD BAR (Minimal, authentic to the game)  */}
        {/* ======================================================== */}
        <header className="relative z-40 w-full flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          {/* Brand & Chapter Stamp */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="relative w-9 h-9 rounded-full border border-[#C8B28E]/40 overflow-hidden shadow-md flex-shrink-0 bg-black/50"
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
              <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#C8B28E] uppercase">
                THE UNWRITTEN • OFFICIAL LAUNCH
              </span>
              <h1 className="text-xs md:text-sm font-serif font-bold tracking-wide text-[#FAF7F2]">
                {currentScene.title}
              </h1>
            </div>
          </div>

          {/* Floating Minimal Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle (9:16 Reel vs Full Cinematic) */}
            <button
              onClick={() => setIsVerticalMode(!isVerticalMode)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/15 transition-all shadow-md"
              title={isVerticalMode ? "Switch to Fullscreen Cinematic" : "Switch to 9:16 Vertical Reel Mode"}
            >
              {isVerticalMode ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#C8B28E]" />
                  <span>Cinematic</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#C8B28E]" />
                  <span>9:16 Reel</span>
                </>
              )}
            </button>

            {/* Audio Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-[#FAF7F2] backdrop-blur-md border border-white/15 transition-all shadow-md"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
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
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-[#FAF7F2] backdrop-blur-md border border-white/15 transition-all shadow-md"
              title="Restart Cinematic"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 3. STAGE CHARACTER LAYER (Real In-Game 2.5D Warden)      */}
        {/* ======================================================== */}
        <div className="relative z-20 flex-1 w-full flex items-end justify-center pointer-events-none overflow-hidden">
          {/* SCENE 1: Distance Silhouette */}
          {isScene1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.28, y: 30 }}
              animate={{ opacity: 1, scale: 0.32, y: 0 }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute bottom-28 md:bottom-32 flex flex-col items-center filter brightness-50 contrast-125"
            >
              <div className="relative w-48 h-72">
                <Image
                  src="/art/characters/warden_neutral.png"
                  alt="The Warden Silhouette"
                  fill
                  priority
                  className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                />
              </div>
            </motion.div>
          )}

          {/* SCENES 2, 3, 5: Fully Integrated Animated In-Game Character */}
          {(isScene2 || isScene3 || isScene5) && (
            <motion.div
              key="warden-stage-character"
              initial={{ opacity: 0, y: 25 }}
              animate={{
                opacity: 1,
                y: isScene3 ? [0, -8, 0, -8, 0] : 0, // Walking step-bobbing in Scene 3!
                scale: isScene5 ? 1.18 : isScene3 ? 1.08 : 1.0, // Walking forward towards camera
              }}
              transition={{
                duration: isScene3 ? 4.5 : 0.6,
                ease: "easeOut",
              }}
              className="relative bottom-0 flex flex-col items-center select-none"
              style={{
                height: isVerticalMode ? "58vh" : "min(72vh, 620px)",
                width: isVerticalMode ? "85vw" : "min(50vw, 480px)",
              }}
            >
              {/* Dynamic Ground Shadow */}
              <div className="absolute -bottom-4 w-56 sm:w-72 md:w-96 h-10 bg-black/60 rounded-full blur-xl" />

              {/* Natural Character Idle Breathing Cycle & Head Motion */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  rotate: isScene2 ? [0, 0.8, 0] : [0, -0.5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.2,
                  ease: "easeInOut",
                }}
                className="relative w-full h-full filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] brightness-105"
              >
                <Image
                  src={wardenSprite}
                  alt="The Warden"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom select-none"
                />

                {/* Subtle Rim Light Highlight on Mask and Trenchcoat */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-red-600/15 mix-blend-overlay pointer-events-none" />
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 4: Game Title & Emblem Grand Reveal */}
          {isScene4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
            >
              {/* Camera shake flash */}
              <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />

              {/* Central Official Emblem */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 80,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative w-36 h-36 md:w-52 md:h-52 mb-6 filter drop-shadow-[0_0_50px_rgba(220,38,38,0.7)]"
              >
                <Image
                  src="/brand/emblem-silence.png"
                  alt="THE UNWRITTEN Emblem"
                  fill
                  priority
                  className="object-contain"
                />
              </motion.div>

              {/* Grand Typography */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.16em] text-white drop-shadow-[0_0_35px_rgba(220,38,38,0.9)]"
              >
                THE UNWRITTEN
              </motion.h2>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-3 text-lg sm:text-2xl font-serif font-extrabold tracking-[0.35em] text-red-500 uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              >
                OFFICIALLY LIVE
              </motion.div>

              <div className="mt-4 w-32 h-0.5 bg-gradient-to-r from-transparent via-[#C8B28E] to-transparent opacity-75" />
            </motion.div>
          )}

          {/* SCENE 1: Centered Atmospheric Title Card */}
          {isScene1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: currentTime > 1.8 ? 1 : 0, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/3 inset-x-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
            >
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.25em] text-[#FAF7F2] drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]">
                THE WAIT IS OVER.
              </h2>
            </motion.div>
          )}

          {/* SCENE 5 (Ending): Final Fade to Black and Outro Slate */}
          {isScene5 && currentTime >= 27.5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative w-24 h-24 mb-4 filter drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]">
                <Image
                  src="/brand/emblem-silence.png"
                  alt="THE UNWRITTEN"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.2em] text-[#FAF7F2] mb-2">
                THE UNWRITTEN
              </h2>
              <p className="font-serif text-base sm:text-xl font-bold tracking-[0.3em] text-red-500 uppercase mb-4">
                PLAY NOW.
              </p>
              <p className="font-serif text-xs sm:text-sm tracking-[0.4em] text-[#A89F93] uppercase">
                WHERE SILENCE SPEAKS
              </p>

              <div className="mt-8 flex items-center gap-4 pointer-events-auto">
                <Link
                  href="/play"
                  className="px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(220,38,38,0.6)]"
                >
                  Enter the Game
                </Link>
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all"
                >
                  Replay Cinematic
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. IN-GAME DIALOGUE SYSTEM (Exact THE UNWRITTEN UI)      */}
        {/* ======================================================== */}
        <footer className="relative z-30 w-full p-4 md:p-6 pb-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-auto flex flex-col items-center">
          <div className="w-full max-w-3xl">
            {/* Show dialogue box for Scenes 2, 3, 4, 5 */}
            {!isScene1 && !(isScene5 && currentTime >= 27.5) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] border-2 bg-[#181614]/95 text-[#FAF7F2] border-[#574E45] backdrop-blur-md"
              >
                {/* Speaker Header with In-Game Red Status Pulse */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="font-serif font-bold text-xs uppercase tracking-[0.2em] text-[#C8B28E]">
                      {currentScene.speaker}
                    </span>
                    <span className="text-[10px] font-mono text-[#8A8178] hidden sm:inline">
                      • ARCHITECT OF THE EXPERIMENT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A89F93]">
                    {currentTime.toFixed(1)}s / 30.0s
                  </span>
                </div>

                {/* Typewriter Prose */}
                <p className="font-serif text-base sm:text-lg md:text-xl leading-relaxed text-[#FAF7F2] min-h-[54px]">
                  &ldquo;{displayedText}&rdquo;
                </p>

                {/* Advance / Next hint */}
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#8A8178]">
                  <span>THE WARDEN&apos;S GATE · OFFICIAL PROLOGUE</span>
                  <span className="flex items-center gap-1 text-[#C8B28E]">
                    <span>Scene {currentScene.id + 1} of 5</span>
                    <ChevronRight className="w-3.5 h-3.5 animate-bounce" />
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Floating Scrub / Progress Bar Line */}
          <div className="w-full max-w-3xl mt-4 flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] transition-all"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
            <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-100"
                style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#A89F93]">
              {Math.floor(currentTime)}s / 30s
            </span>
          </div>
        </footer>

        {/* Initial Start Overlay (Prevents browser autoplay block) */}
        {!hasStarted && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-28 h-28 mb-6 filter drop-shadow-[0_0_35px_rgba(220,38,38,0.7)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="THE UNWRITTEN Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-[0.2em] text-[#FAF7F2] mb-3">
              THE UNWRITTEN
            </h2>
            <p className="font-serif text-sm sm:text-base text-[#C8B28E] tracking-widest uppercase mb-8 max-w-md">
              Official 30-Second Launch Cinematic Starring The Warden
            </p>

            <button
              onClick={handleStart}
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-base tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(220,38,38,0.6)] transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current group-hover:animate-pulse" />
              <span>Watch Launch Cinematic</span>
            </button>
            <p className="mt-4 text-xs font-mono text-[#8A8178]">
              Includes procedural spatial sound effects and The Warden&apos;s speech.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
