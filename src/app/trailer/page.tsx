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
  Sparkles,
  Download,
} from "lucide-react";
import { createTrailerAudioEngine, TrailerAudioEngine } from "./trailerAudioEngine";

type SceneIndex = 0 | 1 | 2 | 3 | 4;

interface SceneConfig {
  id: SceneIndex;
  title: string;
  startTime: number;
  endTime: number;
  image: string;
  speaker: string;
  dialogue: string;
}

const SCENES: SceneConfig[] = [
  {
    id: 0,
    title: "The Wait Is Over",
    startTime: 0,
    endTime: 5.0,
    image: "/art/characters/launch/story_frames/scene1_neutral.jpg",
    speaker: "NARRATOR",
    dialogue: "THE WAIT IS OVER.",
  },
  {
    id: 1,
    title: "The Introduction",
    startTime: 5.0,
    endTime: 11.0,
    image: "/art/characters/launch/story_frames/scene2_welcome.jpg",
    speaker: "THE WARDEN",
    dialogue: "Hello, everyone. My name is The Warden.",
  },
  {
    id: 2,
    title: "The Announcement",
    startTime: 11.0,
    endTime: 17.0,
    image: "/art/characters/launch/story_frames/scene3_walking.jpg",
    speaker: "THE WARDEN",
    dialogue: "Finally... the wait is over.",
  },
  {
    id: 3,
    title: "Officially Live",
    startTime: 17.0,
    endTime: 23.0,
    image: "/art/characters/launch/story_frames/scene4_guarded.jpg",
    speaker: "THE WARDEN",
    dialogue: "THE UNWRITTEN is officially LIVE!",
  },
  {
    id: 4,
    title: "The Invitation",
    startTime: 23.0,
    endTime: 30.0,
    image: "/art/characters/launch/story_frames/scene5_pocket.jpg",
    speaker: "THE WARDEN",
    dialogue:
      "Go check it out, experience the game, and don't forget to leave your honest review. I want to know what you think. I'll see you inside.",
  },
];

const TOTAL_DURATION = 30.0;

export default function OfficialStoryLaunchPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isExporting, setIsExporting] = useState(false);

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

  // Active scene calculation
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

      // Scene 2: Warden Speaks (5.4s) — deep authoritative baritone + supernatural resonance
      if (prevT < 5.4 && t >= 5.4 && !spokenFlagsRef.current["scene2"]) {
        spokenFlagsRef.current["scene2"] = true;
        engine.speakWardenDialogue("Hello, everyone. My name is The Warden.");
      }

      // Scene 3: Colossal Iron-and-Stone Gate Grinding Rumble (11.0s)
      if (prevT < 11.0 && t >= 11.0) {
        engine.playColossalGateRumble();
      }

      // Scene 3: Wet footsteps synced with character walking strides
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

      // Scene 4: High-impact cinematic sub-boom + metallic clang (17.0s)
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
  }, [isPlaying, checkAudioCues, getAudioEngine]);

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

  // Active Pose Image Selection (Seamless 1080x1920 Story Frames)
  const getActiveStoryFrame = (): string => {
    if (currentTime < 5.0) {
      return "/art/characters/launch/story_frames/scene1_neutral.jpg";
    }
    if (currentTime < 11.0) {
      return "/art/characters/launch/story_frames/scene2_welcome.jpg";
    }
    if (currentTime < 17.0) {
      return "/art/characters/launch/story_frames/scene3_walking.jpg";
    }
    if (currentTime < 23.0) {
      return "/art/characters/launch/story_frames/scene4_guarded.jpg";
    }
    // Scene 5 progression
    if (currentTime < 26.5) {
      return "/art/characters/launch/story_frames/scene5_pocket.jpg";
    }
    if (currentTime < 28.2) {
      return "/art/characters/launch/story_frames/scene2_welcome.jpg";
    }
    return "/art/characters/launch/story_frames/scene5_kneel.jpg";
  };

  const activeFrame = getActiveStoryFrame();

  return (
    <main className="fixed inset-0 w-full h-full bg-[#050406] flex items-center justify-center overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 9:16 VERTICAL STORY CONTAINER (Mobile-Native Story View) */}
      {/* ======================================================== */}
      <div className="relative w-full h-full max-w-[480px] md:h-[94vh] md:max-h-[960px] md:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-[0_0_100px_rgba(0,0,0,0.98)] md:border md:border-white/10">
        {/* ====================================================== */}
        {/* TOP SEGMENTED STORY BARS (Instagram/TikTok Story Style) */}
        {/* ====================================================== */}
        <div className="absolute top-3 inset-x-0 z-40 px-3 flex items-center gap-1.5 pointer-events-none">
          {SCENES.map((scene) => {
            let pct = 0;
            if (currentTime >= scene.endTime) {
              pct = 1;
            } else if (
              currentTime >= scene.startTime &&
              currentTime < scene.endTime
            ) {
              pct =
                (currentTime - scene.startTime) /
                (scene.endTime - scene.startTime);
            }
            return (
              <div
                key={scene.id}
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* ====================================================== */}
        {/* TOP HEADER OVERLAY (Clean, Discreet, Borderless)       */}
        {/* ====================================================== */}
        <header className="absolute top-6 inset-x-0 z-40 px-4 py-2 flex items-center justify-between text-white pointer-events-auto bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          {/* Avatar and Channel Stamp */}
          <Link
            href="/"
            className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity"
            title="Return to Hub"
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
                THE UNWRITTEN
              </span>
              <span className="font-mono text-[9px] tracking-wider text-white/60 uppercase">
                OFFICIAL LAUNCH STORY
              </span>
            </div>
          </Link>

          {/* Minimal Controls */}
          <div className="flex items-center gap-1">
            {/* Audio Mute */}
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

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Replay Story"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ====================================================== */}
        {/* MAIN CINEMATIC STORY STAGE (Tap anywhere to pause/play)*/}
        {/* ====================================================== */}
        <div
          onClick={handleTogglePlay}
          className="relative flex-1 w-full h-full cursor-pointer overflow-hidden z-10"
        >
          {/* Active Story Frame (Full Bleed 9:16 Vertical Artwork) */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeFrame}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1, scale: [1.0, 1.04] }}
              exit={{ opacity: 0.85 }}
              transition={{
                opacity: { duration: 0.6, ease: "easeInOut" },
                scale: { duration: 6.0, ease: "linear" },
              }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={activeFrame}
                alt="The Warden Story Frame"
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover object-bottom select-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />

          {/* Scene 1: Grand Centered Story Typography (0–5s) */}
          {currentTime < 5.0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: currentTime > 1.2 ? 1 : 0, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="absolute inset-x-0 top-[20%] text-center px-4 pointer-events-none z-20"
            >
              <span className="text-[10px] font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-2 block drop-shadow-md">
                FOLIO ARCHIVES · PROLOGUE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.22em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.85)]">
                THE WAIT IS OVER.
              </h2>
            </motion.div>
          )}

          {/* Scene 4: Game Reveal Layer (17–23s) */}
          {currentTime >= 17.0 && currentTime < 23.0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-x-0 top-[18%] flex flex-col items-center justify-center text-center p-4 z-20 pointer-events-none"
            >
              {/* Pulsing Energy Halo */}
              <div className="absolute w-44 h-44 rounded-full bg-red-600/30 blur-3xl animate-pulse pointer-events-none" />

              {/* Official Silence Emblem */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 filter drop-shadow-[0_0_40px_rgba(220,38,38,0.9)]">
                <Image
                  src="/brand/emblem-silence.png"
                  alt="THE UNWRITTEN Emblem"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Grand Typography */}
              <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.2em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.95)]">
                THE UNWRITTEN
              </h2>

              {/* LIVE Badge */}
              <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-red-500/80 bg-red-950/70 shadow-[0_0_25px_rgba(239,68,68,0.7)] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-serif font-extrabold tracking-[0.3em] text-red-400 uppercase">
                  OFFICIALLY LIVE
                </span>
              </div>
            </motion.div>
          )}

          {/* Scene 5 Outro Screen (27.8–30s) */}
          {currentTime >= 27.8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#080706]/95 z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
            >
              <div className="relative w-24 h-24 mb-4 filter drop-shadow-[0_0_35px_rgba(220,38,38,0.7)]">
                <Image
                  src="/brand/emblem-silence.png"
                  alt="THE UNWRITTEN"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <h2 className="font-serif text-3xl font-black tracking-[0.22em] text-[#FAF7F2] mb-1">
                THE UNWRITTEN
              </h2>
              <p className="font-serif text-sm font-bold tracking-[0.32em] text-red-500 uppercase mb-2">
                PLAY NOW · WHERE SILENCE SPEAKS
              </p>
              <p className="font-mono text-xs text-[#C8B28E] tracking-widest uppercase mb-8">
                Swipe Up / Link In Bio
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link
                  href="/play"
                  className="w-full py-3 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.7)] text-center cursor-pointer"
                >
                  Enter the Game
                </Link>
                <button
                  onClick={handleRestart}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Replay Story
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ====================================================== */}
        {/* FLOATING CINEMATIC SUBTITLES (Zero Boxes, Full Clarity)*/}
        {/* ====================================================== */}
        <div className="absolute bottom-10 inset-x-0 z-30 flex flex-col items-center justify-end px-5 pointer-events-none text-center">
          {currentTime >= 5.0 && currentTime < 27.8 && (
            <motion.div
              key={`subtitle-${currentScene.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-sm select-none"
            >
              {/* Speaker Label */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.9)]" />
                <span className="font-serif font-bold text-xs uppercase tracking-[0.3em] text-[#C8B28E] drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)]">
                  {currentScene.speaker}
                </span>
              </div>

              {/* Subtitle Dialogue */}
              <p className="font-serif text-lg sm:text-xl font-medium tracking-wide text-[#FAF7F2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.98),0_1px_4px_rgba(0,0,0,0.95)] leading-relaxed">
                &ldquo;{displayedText}&rdquo;
              </p>
            </motion.div>
          )}
        </div>

        {/* ====================================================== */}
        {/* INITIAL PLAY OVERLAY (Unlocks Audio on User Tap)       */}
        {/* ====================================================== */}
        {!hasStarted && (
          <div className="absolute inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="relative w-24 h-24 mb-5 filter drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="THE UNWRITTEN Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>

            <span className="text-xs font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-1.5">
              OFFICIAL STORY LAUNCH
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.2em] text-[#FAF7F2] mb-2">
              THE UNWRITTEN
            </h1>
            <p className="font-serif text-xs sm:text-sm text-[#D6CEC0] tracking-widest uppercase mb-8 max-w-xs leading-relaxed">
              30-Second Cinematic Story Announcement
            </p>

            <button
              onClick={handleStart}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(220,38,38,0.75)] transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current group-hover:animate-pulse" />
              <span>Watch Launch Story</span>
            </button>
            <p className="mt-4 text-[10px] font-mono text-[#8A8178]">
              Includes spatial acoustics &amp; The Warden voice narration.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
