"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useGameSession } from "@/lib/useGameSession";
import { CreatorIdentitySection } from "@/components/common/CreatorIdentitySection";
import { PlayerReviewsSection } from "@/components/reviews/PlayerReviewsSection";
import { CinematicCreatorIntro } from "./CinematicCreatorIntro";
import { PlayerRegistrationModal, RegisteredPlayer } from "./PlayerRegistrationModal";

export type CharacterIdentityId = "junior" | "senior";

interface CharacterIdentityConfig {
  id: CharacterIdentityId;
  badge: string;
  badgeColor: string;
  badgeBorder: string;
  badgeBg: string;
  title: string;
  callsign: string;
  modeName: string;
  tagline: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  route: string;
  environmentUrl: string;
  characterSpriteUrl: string;
  characterScale: number;
  glowColor: string;
  buttonLabel: string;
}

const IDENTITIES: Record<CharacterIdentityId, CharacterIdentityConfig> = {
  junior: {
    id: "junior",
    badge: "LEARNING ARENA",
    badgeColor: "text-emerald-400",
    badgeBorder: "border-emerald-500/40",
    badgeBg: "bg-emerald-950/60",
    title: "THE SCHOLAR",
    callsign: "Academic Reasoning Specialist",
    modeName: "Class 11 & Class 12 Arena",
    tagline: "Intellectual deduction, board excellence, and competitive entrance mastery.",
    description:
      "A calm, focused reasoning studio covering 14 subjects aligned to the MSBSHSE curriculum. Features 1,400 curated non-repeating questions, 3 difficulty tiers (Learn & Understand, Board Prep, Competitive Entrance: JEE, NEET, CUET, CLAT), and high-performance LaTeX mathematical typesetting.",
    features: [
      "Independent Class 11 (FYJC) & Class 12 (HSC) Arenas",
      "EASY, MEDIUM & HARD (JEE / NEET / CUET / CLAT) Calibration",
      "1,400 Questions · Zero Repetition Across 100-Question Cycles",
      "Notebook & Pen Recommended For Scratch Derivations & Formulas",
    ],
    specs: [
      { label: "Target Audience", value: "Secondary & Higher Sec" },
      { label: "Curriculum Pool", value: "1,400 Questions" },
      { label: "Evaluation", value: "Evidence-Mapped Skills" },
    ],
    route: "/junior",
    environmentUrl: "/art/environments/env_junior_academy.jpg",
    characterSpriteUrl: "/art/characters/junior_student.png",
    characterScale: 1.0,
    glowColor: "rgba(82, 183, 136, 0.45)",
    buttonLabel: "Enter Learning Arena",
  },
  senior: {
    id: "senior",
    badge: "SOLO CAMPAIGN",
    badgeColor: "text-amber-400",
    badgeBorder: "border-amber-500/40",
    badgeBg: "bg-amber-950/60",
    title: "THE INVESTIGATOR",
    callsign: "Aarav Kulkarni · Alone",
    modeName: "The Mind Experiment",
    tagline: "8 subterranean chambers of pure deduction, logic terminals, and moral thresholds.",
    description:
      "Awaken inside a subterranean observation panopticon. Navigate 8 chambers strictly alone—no automated progress, no partner bailouts. Solve interactive keypad ciphers, three-doors logic elimination, memory matrix puzzles, and a navigable 2D spatial mirror maze under strict 1-final-submission failure debrief rules.",
    features: [
      "Aarav Alone · Zero Co-Op Partner Contamination",
      "NO GAMEPLAY = NO LEVEL COMPLETION Rule Enforcement",
      "Interactive 2D Spatial Mirror Labyrinth & Keypad Locks",
      "5 Progressive Hints & Single-Submission Failure Debriefs",
    ],
    specs: [
      { label: "Experience", value: "Single-Player Detective" },
      { label: "Chambers", value: "8 Mystery Levels" },
      { label: "Endings", value: "4 Philosophical Codices" },
    ],
    route: "/solo",
    environmentUrl: "/art/environments/env_senior_investigation.jpg",
    characterSpriteUrl: "/art/characters/aarav_neutral.png",
    characterScale: 1.05,
    glowColor: "rgba(200, 178, 142, 0.45)",
    buttonLabel: "Enter Solo Campaign",
  },
};

export function CharacterSelectScreen() {
  const router = useRouter();
  const { session } = useGameSession({ recordLandingOnInit: true });

  const [selectedId, setSelectedId] = useState<CharacterIdentityId>("senior");
  const [hoveredId, setHoveredId] = useState<CharacterIdentityId | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Cinematic Creator Intro session gate
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [isReplayingIntro, setIsReplayingIntro] = useState(false);

  // Player Registration Gate (Part 4)
  const [registeredPlayer, setRegisteredPlayer] = useState<RegisteredPlayer | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string>("/solo");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("the_unwritten_player");
      if (stored) {
        const parsed = JSON.parse(stored) as RegisteredPlayer;
        if (parsed.username) setRegisteredPlayer(parsed);
      } else {
        // Check /api/player/me
        fetch("/api/player/me")
          .then((r) => r.json())
          .then((d) => {
            if (d.registered && d.player) {
              setRegisteredPlayer(d.player);
              localStorage.setItem("the_unwritten_player", JSON.stringify(d.player));
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDeployIdentity = (route: string) => {
    if (registeredPlayer) {
      router.push(route);
    } else {
      setPendingRoute(route);
      setShowRegModal(true);
    }
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceIntro = params.get("intro") === "1" || params.get("replay") === "1";
      if (forceIntro) {
        setShowIntro(true);
        return;
      }
      const seen = sessionStorage.getItem("unwritten_intro_seen");
      setShowIntro(seen !== "true");
    } catch {
      setShowIntro(false);
    }
  }, []);

  const activeIdentity = IDENTITIES[hoveredId || selectedId];

  // Keyboard navigation: Left/Right to cycle, Enter to deploy
  useEffect(() => {
    if (showIntro || showRegModal) return; // Prevent character selection keys while modals are active
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedId((prev) => (prev === "junior" ? "senior" : "junior"));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleDeployIdentity(IDENTITIES[selectedId].route);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, router, showIntro, showRegModal, registeredPlayer]);

  // Determine active background environment
  const currentBgUrl = hoveredId
    ? IDENTITIES[hoveredId].environmentUrl
    : selectedId
    ? IDENTITIES[selectedId].environmentUrl
    : "/art/environments/env_initial_selection.jpg";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0D12] text-[#FAF7F2] select-none flex flex-col justify-between">
      {/* 0. CINEMATIC CREATOR INTRO OVERLAY */}
      <AnimatePresence>
        {showIntro && (
          <CinematicCreatorIntro
            key="cinematic-intro"
            isReplay={isReplayingIntro}
            onComplete={() => {
              setShowIntro(false);
              setIsReplayingIntro(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 1. CINEMATIC ILLUSTRATED ENVIRONMENT BACKGROUND WITH CROSS-FADE */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBgUrl}
            initial={{ opacity: 0.25, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentBgUrl}
              alt="Game Environment"
              fill
              unoptimized
              priority
              sizes="100vw"
              className="object-cover object-center brightness-75 contrast-105"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Film Vignette & Stage Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-transparent to-[#0A0D12]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette opacity-60 pointer-events-none" />
      </div>

      {/* 2. TOP MASTHEAD & STATUS HUD */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full border border-zinc-500/80 shadow-md transition-transform group-hover:scale-105 overflow-hidden flex-shrink-0">
              <Image
                src="/brand/logo-header.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-[0.35em] font-bold text-[#FAF7F2] block">
                  THE UNWRITTEN
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-bold">
                  SILENCE
                </span>
              </div>
              <span className="text-[10px] font-serif italic text-zinc-400 block -mt-0.5">
                Where Silence Speaks
              </span>
            </div>
          </Link>
        </div>

        {/* Global Section Links & Audio Toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          {registeredPlayer && (
            <div className="flex items-center gap-2 bg-[#1C1613] border border-amber-500/50 px-3 py-1.5 rounded-full text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">{registeredPlayer.username}</span>
            </div>
          )}

          <nav className="hidden md:flex items-center gap-5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#DDD4C5]">
            <Link
              href="/warden"
              className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-red-300 font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>The Warden</span>
            </Link>
            <Link
              href="/solo"
              className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Solo Campaign</span>
            </Link>
            <Link
              href="/junior"
              className="hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Learning Arena</span>
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-[#FAF7F2] border border-white/15 backdrop-blur-md transition-all shadow-md cursor-pointer"
            title={isAudioMuted ? "Enable ambient audio" : "Mute ambient audio"}
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* 3. CENTRAL CHARACTER SELECTION STAGE */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col justify-center">
        {/* Header Heading */}
        <div className="text-center space-y-1.5 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 border border-white/15 text-[10px] sm:text-xs font-mono uppercase tracking-[0.28em] text-[#C8B28E] backdrop-blur-md shadow-md"
          >
            <Compass className="w-3 h-3 text-[#C8B28E]" />
            <span>PLAYER SELECT · CHOOSE YOUR IDENTITY</span>
          </motion.div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FAF7F2] drop-shadow-md">
            Enter the Unwritten World.
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#DDD4C5] max-w-xl mx-auto">
            Select a character identity to step into their world. Each path commands an independent
            engine, gameplay rules, and narrative stakes.
          </p>
        </div>

        {/* Two Interactive Character Figures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-end justify-center max-w-4xl mx-auto w-full pt-4">
          {(["junior", "senior"] as CharacterIdentityId[]).map((id) => {
            const config = IDENTITIES[id];
            const isSelected = selectedId === id;
            const isHovered = hoveredId === id;
            const isHighlight = isSelected || isHovered;

            return (
              <div
                key={id}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(id)}
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  isSelected ? "z-20 scale-100 md:scale-105" : "z-10 opacity-80 hover:opacity-100 hover:scale-102"
                }`}
              >
                {/* Character Portrait Pedestal Card */}
                <div
                  className={`w-full max-w-[320px] rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col items-center p-5 backdrop-blur-md ${
                    isSelected
                      ? `bg-[#141210]/90 ${config.badgeBorder} shadow-[0_0_35px_${config.glowColor}] ring-2 ${config.badgeBorder}`
                      : "bg-[#141210]/60 border-white/10 hover:border-white/25 hover:bg-[#141210]/80 shadow-lg"
                  }`}
                >
                  {/* Badge */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeColor} ${config.badgeBorder} font-bold`}
                    >
                      {config.badge}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {isSelected ? "SELECTED ✓" : "CLICK TO SELECT"}
                    </span>
                  </div>

                  {/* Character Sprite Display Box */}
                  <div className="relative w-full h-56 sm:h-64 flex items-end justify-center my-3 overflow-hidden">
                    {/* Atmospheric Glow Under Figure */}
                    <div
                      className="absolute bottom-0 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-opacity duration-300"
                      style={{
                        backgroundColor: isHighlight ? config.glowColor : "transparent",
                        opacity: isHighlight ? 0.6 : 0.1,
                      }}
                    />

                    {/* Character Sprite */}
                    <motion.div
                      animate={{
                        y: isSelected ? [0, -6, 0] : 0,
                      }}
                      transition={{
                        repeat: isSelected ? Infinity : 0,
                        duration: 4,
                        ease: "easeInOut",
                      }}
                      style={{ transform: `scale(${config.characterScale || 1})` }}
                      className="relative w-full h-full flex items-end justify-center origin-bottom"
                    >
                      <Image
                        src={config.characterSpriteUrl}
                        alt={config.title}
                        fill
                        unoptimized
                        priority
                        className={`object-contain object-bottom transition-all duration-300 ${
                          isSelected
                            ? "brightness-105 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                            : "brightness-85 contrast-95"
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Identity Header */}
                  <div className="text-center w-full space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF7F2]">
                      {config.title}
                    </h3>
                    <p className={`text-xs font-mono font-medium ${config.badgeColor}`}>
                      {config.callsign}
                    </p>
                    <p className="text-[11px] font-sans text-zinc-400 line-clamp-2 pt-1 leading-snug">
                      {config.tagline}
                    </p>
                  </div>

                  {/* Select / Active Indicator */}
                  <div className="w-full pt-3 mt-3 border-t border-white/10 flex items-center justify-center">
                    {isSelected ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold ${config.badgeColor}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>READY TO DEPLOY</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 group-hover:text-white">
                        Select Identity →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. ACTIVE IDENTITY DOSSIER & DEPLOY ACTION (EXPANDED FOOTER CARD) */}
        <motion.div
          key={activeIdentity.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-6 max-w-4xl mx-auto w-full p-6 sm:p-7 rounded-2xl bg-[#141210]/95 border border-[#453D35] backdrop-blur-xl shadow-2xl space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-[0.22em] font-bold ${activeIdentity.badgeColor}`}>
                  {activeIdentity.modeName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  Target Destination
                </span>
                {activeIdentity.id === "senior" && session?.status === "in_progress" && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded-full">
                    Active Run · Chamber 0{session.current_chapter || 1}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
                {activeIdentity.title} — {activeIdentity.callsign}
              </h2>
            </div>

            {/* Direct Action Button */}
            <button
              type="button"
              onClick={() => handleDeployIdentity(activeIdentity.route)}
              className="px-8 py-3.5 rounded-full bg-[#FAF7F2] text-[#12100E] font-sans font-bold text-sm tracking-wide hover:bg-[#E7E0D3] transition-all shadow-[0_4px_20px_rgba(250,247,242,0.25)] flex items-center justify-center gap-2.5 cursor-pointer group active:scale-95"
            >
              <span>
                {activeIdentity.id === "senior" && session?.status === "in_progress"
                  ? `Continue Solo Campaign (Chamber 0${session.current_chapter || 1})`
                  : activeIdentity.buttonLabel}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <p className="text-xs sm:text-sm text-[#DDD4C5] leading-relaxed font-light">
                {activeIdentity.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                {activeIdentity.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className={activeIdentity.badgeColor}>•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-5 grid grid-cols-3 gap-2 bg-black/40 p-4 rounded-xl border border-white/10 text-center">
              {activeIdentity.specs.map((sp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="block text-[9px] uppercase tracking-wider font-mono text-zinc-500">
                    {sp.label}
                  </span>
                  <span className="block text-xs font-serif font-bold text-[#FAF7F2]">
                    {sp.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 4.5. THE WARDEN CINEMATIC ARCHIVE CALLOUT */}
        <section className="w-full max-w-5xl mx-auto my-12 px-4">
          <Link
            href="/warden"
            className="group block relative rounded-3xl overflow-hidden border border-red-900/50 bg-gradient-to-r from-red-950/70 via-[#100D13] to-[#0A090C] p-6 sm:p-8 transition-all hover:border-red-600/80 hover:shadow-[0_0_35px_rgba(220,38,38,0.35)]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-red-500/40 bg-black/80 flex-shrink-0">
                  <Image
                    src="/art/characters/launch/warden_01_neutral_standing.png"
                    alt="The Warden"
                    fill
                    sizes="80px"
                    className="object-contain object-bottom filter drop-shadow"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-900/60 text-[10px] font-mono uppercase tracking-[0.2em] text-red-300 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span>Cinematic Experience · Sealed Gates Open</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF7F2] group-hover:text-red-300 transition-colors">
                    The Warden of the Dungeon
                  </h3>
                  <p className="font-serif text-xs sm:text-sm text-zinc-400 max-w-xl mt-1">
                    Listen to the official vocal intro and outro narrations, explore all six canon stances in the Pose Codex, and watch the launch announcement story.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 group-hover:bg-red-600 text-white font-serif text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(220,38,38,0.6)] flex-shrink-0">
                <span>Enter Archive</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </section>

        {/* 5. PLAYER REVIEWS & COMMUNITY DISPATCHES */}
        <PlayerReviewsSection />

        {/* 6. INDEPENDENT CREATOR IDENTITY & AI DESIGN RECOGNITION */}
        <CreatorIdentitySection
          onWatchIntro={() => {
            setIsReplayingIntro(true);
            setShowIntro(true);
          }}
        />
      </main>

      {/* 7. MINIMAL COLOPHON FOOTER */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 border-t border-white/10 mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#FAF7F2] font-semibold">THE UNWRITTEN</span>
          <span>•</span>
          <span className="text-[#8FA184] font-bold">Created by Anish Patil</span>
          <span>•</span>
          <span>Human Vision × AI-Assisted Architecture</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
            Privacy &amp; Data Governance
          </Link>
          <a
            href="mailto:anishpatil146@gmail.com"
            className="hover:text-zinc-200 transition-colors lowercase tracking-normal font-mono"
          >
            anishpatil146@gmail.com
          </a>
        </div>
      </footer>

      {/* 7. DEDICATED PLAYER REGISTRATION GATE (PART 4) */}
      <AnimatePresence>
        {showRegModal && (
          <PlayerRegistrationModal
            isOpen={showRegModal}
            targetModeName={activeIdentity.modeName}
            onRegistered={(player) => {
              setRegisteredPlayer(player);
              setShowRegModal(false);
              router.push(pendingRoute);
            }}
            onClose={() => setShowRegModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
