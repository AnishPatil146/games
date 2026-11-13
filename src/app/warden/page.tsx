"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { WardenCinematicTheater } from "@/components/warden/WardenCinematicTheater";
import { WardenPoseCodex } from "@/components/warden/WardenPoseCodex";
import {
  CinematicMode,
  PoseDetail,
  WARDEN_INTRO_CUES,
  WARDEN_OUTRO_CUES,
} from "@/lib/cinematicTimelineEngine";
import {
  Sparkles,
  Shield,
  Play,
  Volume2,
  ChevronRight,
  ArrowRight,
  Scroll,
  Award,
  Download,
  Share2,
  Compass,
  Key,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function WardenCinematicPage() {
  const [activePoseId, setActivePoseId] = useState<string>("warden_01_neutral_standing");
  const [theaterTrigger, setTheaterTrigger] = useState<{
    mode: CinematicMode;
    time: number;
    timestamp: number;
  } | null>(null);

  const handleSelectPose = (pose: PoseDetail) => {
    setActivePoseId(pose.id);
    setTheaterTrigger({
      mode: pose.mode,
      time: pose.audioTime,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-[#070608] text-[#FAF7F2] font-sans selection:bg-red-900 selection:text-white relative overflow-x-hidden">
      {/* Global Header */}
      <Header hideNav={false} tone="dark" />

      {/* Atmospheric Background Noise & Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(180,20,20,0.12)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_bottom,rgba(200,178,142,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <main className="relative z-10 pt-20 pb-28">
        {/* ======================================================== */}
        {/* SECTION 1: OPENING REVEAL & HERO BANNER                  */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 pt-12 pb-16 max-w-7xl mx-auto text-center">
          {/* Subtle Category Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 border border-red-700/50 text-red-300 text-xs font-mono tracking-[0.25em] uppercase mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Cinematic Archive & Official Voices</span>
          </motion.div>

          {/* Grand Header */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#FAF7F2] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-4xl mx-auto leading-[1.08]"
          >
            THE WARDEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8B28E] via-[#FAF7F2] to-red-400">
              OF THE DUNGEON
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-serif text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed"
          >
            &ldquo;These doors have remained sealed for centuries... but you, young explorer, have finally unclosed them.&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest text-[#C8B28E]"
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-500" />
              Intro Narration · 31.55s
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Outro Narration · 19.52s
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              6 Canon Stances
            </span>
          </motion.div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2 & 3: WARDEN&apos;S GATE CINEMATIC THEATER           */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 max-w-6xl mx-auto mb-24">
          <div className="relative">
            {/* Cinematic Frame Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-900/30 via-white/5 to-red-900/30 blur-xl opacity-60" />

            {/* Reusable Cinematic Timeline & Ducking Theater */}
            <div className="relative">
              <WardenCinematicTheater
                initialMode="intro"
                onPoseChange={(p) => setActivePoseId(p)}
                externalTrigger={theaterTrigger}
              />
            </div>
          </div>

          {/* Quick Theater Help & Specs */}
          <div className="mt-4 px-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Space: Play / Pause</span>
              <span>M: Mute</span>
              <span>R: Replay</span>
            </div>
            <div className="flex items-center gap-2 text-[#C8B28E]">
              <Volume2 className="w-3.5 h-3.5 text-red-400" />
              <span>Real-Time Voice Ducking & Orchestration Enabled</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: NARRATIVE SCRIPT & SYNCHRONIZED TIMELINES     */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 max-w-5xl mx-auto mb-24">
          <div className="border border-white/10 rounded-3xl bg-[#0D0B10]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-400 block mb-1">
                  Master Vocal Transcripts
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#FAF7F2]">
                  Dual Narration Orchestration
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setTheaterTrigger({
                      mode: "intro",
                      time: 0,
                      timestamp: Date.now(),
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-red-950/70 border border-red-700/60 hover:bg-red-900/80 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-red-400" />
                  <span>Play Intro (31.5s)</span>
                </button>
                <button
                  onClick={() =>
                    setTheaterTrigger({
                      mode: "outro",
                      time: 0,
                      timestamp: Date.now(),
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/80 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-amber-400" />
                  <span>Play Outro (19.5s)</span>
                </button>
              </div>
            </div>

            {/* Transcript Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {/* Intro Narration Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#C8B28E] uppercase tracking-wider pb-2 border-b border-white/5">
                  <span>Part I · Prologue & Gate Opening</span>
                  <span>31.55s</span>
                </div>
                <div className="space-y-3">
                  {WARDEN_INTRO_CUES.map((cue) => (
                    <div
                      key={cue.id}
                      onClick={() =>
                        setTheaterTrigger({
                          mode: "intro",
                          time: cue.startTime,
                          timestamp: Date.now(),
                        })
                      }
                      className="group p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-red-600/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                        <span className="text-red-400/90 font-semibold group-hover:text-red-300">
                          {cue.startTime.toFixed(1)}s – {cue.endTime.toFixed(1)}s
                        </span>
                        <span className="uppercase text-zinc-400">
                          {cue.poseId.replace("warden_", "").replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="font-serif text-sm text-zinc-300 group-hover:text-white leading-relaxed">
                        &ldquo;{cue.subtitle}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outro Narration Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#C8B28E] uppercase tracking-wider pb-2 border-b border-white/5">
                  <span>Part II · Dungeon Conquest & Debrief</span>
                  <span>19.52s</span>
                </div>
                <div className="space-y-3">
                  {WARDEN_OUTRO_CUES.map((cue) => (
                    <div
                      key={cue.id}
                      onClick={() =>
                        setTheaterTrigger({
                          mode: "outro",
                          time: cue.startTime,
                          timestamp: Date.now(),
                        })
                      }
                      className="group p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-600/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                        <span className="text-amber-400/90 font-semibold group-hover:text-amber-300">
                          {cue.startTime.toFixed(1)}s – {cue.endTime.toFixed(1)}s
                        </span>
                        <span className="uppercase text-zinc-400">
                          {cue.poseId.replace("warden_", "").replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="font-serif text-sm text-zinc-300 group-hover:text-white leading-relaxed">
                        &ldquo;{cue.subtitle}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: OFFICIAL LAUNCH ANNOUNCEMENT & STORY VIDEO    */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 max-w-6xl mx-auto mb-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/60 via-[#120F15] to-[#0A090C] border border-red-700/40 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center gap-10">
            {/* Left Story Presentation */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-600/60 text-red-200 text-xs font-mono uppercase tracking-[0.25em]">
                <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Launch Announcement Story</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#FAF7F2] leading-tight">
                Where Silence Speaks. <br />
                <span className="text-red-400">The Experience Is Yours.</span>
              </h2>

              <p className="font-serif text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                Ready for Instagram, TikTok, and WhatsApp Stories. The official 9:16 launch announcement video synchronizes the full 38.9-second custom orchestral soundtrack with all six Warden poses, framed with centered typography designed to keep the porcelain mask completely clear.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="/video/the_unwritten_official_launch_story.mp4"
                  download="the_unwritten_official_launch_story.mp4"
                  className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(220,38,38,0.7)] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Story Video (MP4)</span>
                </a>
                <Link
                  href="/trailer"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Interactive Story Theater</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Video Mockup / Player */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
              <video
                src="/video/the_unwritten_official_launch_story.mp4"
                controls
                preload="metadata"
                className="w-full h-full object-cover"
                poster="/art/characters/launch/story_frames/scene1_neutral.jpg"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/80 pointer-events-none">
                1080 × 1920 HD
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: THE POSE CODEX INTERACTIVE GALLERY            */}
        {/* ======================================================== */}
        <WardenPoseCodex
          onSelectPose={handleSelectPose}
          selectedPoseId={activePoseId}
        />

        {/* ======================================================== */}
        {/* SECTION 7: WARDEN PHILOSOPHY & LORE CARD                 */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 max-w-4xl mx-auto mb-24 text-center">
          <div className="relative rounded-3xl bg-black/60 border border-white/10 p-8 sm:p-12 backdrop-blur-xl">
            <div className="relative w-16 h-16 mx-auto mb-6 filter drop-shadow-[0_0_20px_rgba(200,178,142,0.6)]">
              <Image
                src="/brand/emblem-silence.png"
                alt="Emblem"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#FAF7F2] tracking-wide mb-4">
              The Code of The Dungeon Gate
            </h3>

            <p className="font-serif text-sm sm:text-base text-zinc-300 leading-relaxed italic max-w-2xl mx-auto mb-8">
              &ldquo;The wait... the silence... the mystery... all lies in there beyond the door. Explore the unknown. Experience the game for yourself. And remember: honest words would be appreciated.&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-[#C8B28E]">
              <span>Guardian of the Threshold</span>
              <span>·</span>
              <span>Architect of Silence</span>
              <span>·</span>
              <span>Immortal Witness</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: FINAL BRANDING & GAME ENTRYPOINTS             */}
        {/* ======================================================== */}
        <section className="relative px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="pt-12 border-t border-white/10">
            <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-[#FAF7F2] mb-3">
              THE UNWRITTEN
            </h2>
            <p className="font-serif text-xs font-bold tracking-[0.35em] text-red-500 uppercase mb-8">
              WHERE SILENCE SPEAKS
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/play"
                className="px-8 py-3.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.7)] flex items-center gap-2 cursor-pointer"
              >
                <span>Enter The Game</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/solo"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all"
              >
                Solo Campaign
              </Link>
              <Link
                href="/leaderboard"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider transition-all"
              >
                Hall of Explorers
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Colophon */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs font-mono text-zinc-500">
        <p className="tracking-widest uppercase">
          THE UNWRITTEN · The Warden Cinematic Archive · All Canon Poses & Audio Synchronized
        </p>
      </footer>
    </div>
  );
}

