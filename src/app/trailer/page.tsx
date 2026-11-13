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

type SceneIndex = 0 | 1 | 2 | 3 | 4 | 5;

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
    title: "Introduction",
    startTime: 0,
    endTime: 3.8,
    image: "/art/characters/launch/story_frames/scene2_welcome.jpg",
    speaker: "THE WARDEN",
    dialogue: "Hello everyone, I am The Warden.",
  },
  {
    id: 1,
    title: "The Doors of Silence",
    startTime: 3.8,
    endTime: 12.8,
    image: "/art/characters/launch/story_frames/scene1_neutral.jpg",
    speaker: "THE WARDEN",
    dialogue: "For a long time, the doors have remained closed. The wait... the silence... the mystery...",
  },
  {
    id: 2,
    title: "Officially Live",
    startTime: 12.8,
    endTime: 17.5,
    image: "/art/characters/launch/story_frames/scene4_guarded.jpg",
    speaker: "THE WARDEN",
    dialogue: "Finally, the moment has arrived. THE UNWRITTEN is officially LIVE!",
  },
  {
    id: 3,
    title: "The Doors Open",
    startTime: 17.5,
    endTime: 23.5,
    image: "/art/characters/launch/story_frames/scene3_walking.jpg",
    speaker: "THE WARDEN",
    dialogue: "The doors are open. The experience is yours to discover.",
  },
  {
    id: 4,
    title: "Explore the Unknown",
    startTime: 23.5,
    endTime: 28.5,
    image: "/art/characters/launch/story_frames/scene5_pocket.jpg",
    speaker: "THE WARDEN",
    dialogue: "Explore the unknown. Experience the game for yourself...",
  },
  {
    id: 5,
    title: "Honest Review & Invitation",
    startTime: 28.5,
    endTime: 38.92,
    image: "/art/characters/launch/story_frames/scene5_kneel.jpg",
    speaker: "THE WARDEN",
    dialogue: "Share your honest thoughts, leave a review, tell us what you loved, and what we can make better. I'll be waiting. Until we meet... welcome to THE UNWRITTEN.",
  },
];

const TOTAL_DURATION = 38.92;

export default function OfficialStoryLaunchPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Main Playback Loop synced directly to audio element
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (isPlaying && audioRef.current) {
        const t = audioRef.current.currentTime;
        setCurrentTime(t);
        if (t >= TOTAL_DURATION || audioRef.current.ended) {
          setIsPlaying(false);
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Start Playback
  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTogglePlay = () => {
    if (!hasStarted) {
      handleStart();
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      audioRef.current?.play().catch(() => {});
    } else {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
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
    if (currentTime < 3.8) {
      return "/art/characters/launch/story_frames/scene2_welcome.jpg";
    }
    if (currentTime < 12.8) {
      return "/art/characters/launch/story_frames/scene1_neutral.jpg";
    }
    if (currentTime < 17.5) {
      return "/art/characters/launch/story_frames/scene4_guarded.jpg";
    }
    if (currentTime < 23.5) {
      return "/art/characters/launch/story_frames/scene3_walking.jpg";
    }
    if (currentTime < 28.5) {
      return "/art/characters/launch/story_frames/scene5_pocket.jpg";
    }
    if (currentTime < 34.0) {
      return "/art/characters/launch/story_frames/scene2_welcome.jpg";
    }
    return "/art/characters/launch/story_frames/scene5_kneel.jpg";
  };

  const getActiveSubtitle = (): string => {
    if (currentTime < 3.8) return "Hello everyone, I am The Warden.";
    if (currentTime < 8.0) return "For a long time, the doors have remained closed.";
    if (currentTime < 12.8) return "The wait... the silence... the mystery...";
    if (currentTime < 17.5) return "Finally, the moment has arrived. THE UNWRITTEN is officially LIVE!";
    if (currentTime < 23.5) return "The doors are open. The experience is yours to discover.";
    if (currentTime < 28.5) return "Explore the unknown. Experience the game for yourself...";
    if (currentTime < 34.0) return "Share your honest thoughts, leave a review, tell us what you loved, and what we can make better.";
    if (currentTime < 38.92) return "I'll be waiting. Until we meet... welcome to THE UNWRITTEN.";
    return "";
  };

  const activeFrame = getActiveStoryFrame();
  const activeSubtitle = getActiveSubtitle();

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
            {/* Direct MP4 Download */}
            <a
              href="/video/the_unwritten_official_launch_story.mp4"
              download="the_unwritten_official_launch_story.mp4"
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Download 1080x1920 MP4 Video"
            >
              <Download className="w-4 h-4 text-[#C8B28E]" />
            </a>

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

          {/* Scene 1: Grand Centered Story Typography */}
          {currentTime >= 4.5 && currentTime < 12.0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="absolute inset-x-0 top-[20%] text-center px-4 pointer-events-none z-20"
            >
              <span className="text-[10px] font-mono font-bold tracking-[0.35em] text-[#C8B28E] uppercase mb-2 block drop-shadow-md">
                THE DOORS OF SILENCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-[0.22em] text-[#FAF7F2] drop-shadow-[0_0_35px_rgba(220,38,38,0.85)]">
                THE WAIT IS OVER.
              </h2>
            </motion.div>
          )}

          {/* Scene 2: Officially LIVE Game Reveal Layer (12.8–17.5s) */}
          {currentTime >= 12.8 && currentTime < 17.5 && (
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

          {/* Scene 6 Outro Screen (35.5–38.92s) */}
          {currentTime >= 35.5 && (
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
                <a
                  href="/video/the_unwritten_official_launch_story.mp4"
                  download="the_unwritten_official_launch_story.mp4"
                  className="w-full py-2.5 rounded-full border border-[#C8B28E]/40 bg-black/40 hover:bg-black/60 text-[#C8B28E] font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4 Story</span>
                </a>
                <button
                  onClick={handleRestart}
                  className="w-full py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
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
          {activeSubtitle && currentTime < 35.5 && (
            <motion.div
              key={`sub-${activeSubtitle.slice(0, 15)}`}
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
                  THE WARDEN
                </span>
              </div>

              {/* Subtitle Dialogue */}
              <p className="font-serif text-lg sm:text-xl font-medium tracking-wide text-[#FAF7F2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.98),0_1px_4px_rgba(0,0,0,0.95)] leading-relaxed">
                &ldquo;{activeSubtitle}&rdquo;
              </p>
            </motion.div>
          )}
        </div>

        {/* Audio Element linked directly to user soundtrack */}
        <audio
          ref={audioRef}
          src="/video/soundtrack.mp3"
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />

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
              Official Launch Announcement Video
            </p>

            <button
              onClick={handleStart}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(220,38,38,0.75)] transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current group-hover:animate-pulse" />
              <span>Watch Launch Story</span>
            </button>
            <p className="mt-4 text-[10px] font-mono text-[#8A8178]">
              Includes official Warden narration &amp; soundtrack.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
