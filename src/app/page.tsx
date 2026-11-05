"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles, Users } from "lucide-react";
import { HeroMonographArtwork } from "@/components/artwork/SceneArtwork";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { useGameSession } from "@/lib/useGameSession";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useGameSession({ recordLandingOnInit: true });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: normX * 14, y: normY * 10 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12100E] text-[#FAF7F2] selection:bg-[#FAF7F2] selection:text-[#12100E]">

      {/* 1. CINEMATIC HERO */}
      <section
        onMouseMove={handleMouseMove}
        className="relative min-h-[92vh] w-full flex flex-col justify-between overflow-hidden border-b border-[#FAF7F2]/10"
      >
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: prefersReducedMotion
              ? undefined
              : `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.03)`,
          }}
        >
          <HeroMonographArtwork />
        </div>

        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#12100E]/75 via-[#12100E]/40 to-[#12100E]/94"
          aria-hidden="true"
        />

        {/* Editorial Masthead */}
        <header className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pt-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.32em] text-[#FAF7F2] font-medium">
              THE UNWRITTEN
            </span>
            <span className="hidden md:inline text-[#8A8178]">·</span>
            <span className="hidden md:inline text-[11px] font-serif italic text-[#D6CEC0]">
              An experiment in human curiosity.
            </span>
          </div>

          <nav
            aria-label="Primary sections"
            className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em] text-[#D6CEC0]"
          >
            <Link
              href="/solo"
              className="text-[#FAF7F2] font-semibold flex items-center gap-1.5 hover:text-[#C8B28E] transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#C8B28E]" />
              <span>Solo Campaign</span>
            </Link>
            <Link
              href="/alliance"
              className="text-[#FAF7F2] font-semibold flex items-center gap-1.5 hover:text-[#52B788] transition-colors"
            >
              <Users className="w-3 h-3 text-[#52B788]" />
              <span>War Room</span>
            </Link>
            <Link
              href="/junior"
              className="text-[#FAF7F2] font-semibold flex items-center gap-1.5 hover:text-[#C8B28E] transition-colors"
            >
              <BookOpen className="w-3 h-3 text-[#C8B28E]" />
              <span>Learning Arena</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="hover:text-[#FAF7F2] transition-colors opacity-80"
            >
              Admin
            </Link>
          </nav>
        </header>

        {/* Central Editorial Statement */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 py-16 text-center space-y-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 rounded-full text-[10px] uppercase tracking-[0.3em] text-[#C8B28E]">
              <Sparkles className="w-3 h-3 text-[#C8B28E]" />
              <span>The Illustrated Storyboard Campaign Live</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-[4.35rem] leading-[1.05] tracking-[-0.02em] text-[#FAF7F2]">
              Every choice leaves a trace.
            </h1>

            <p className="text-base sm:text-lg text-[#D6CEC0] max-w-2xl mx-auto leading-relaxed font-light">
              Experience the fully illustrated visual novel storyboards. Play the 8-level
              Solo Campaign, team up in the synchronous Multiplayer Alliance, or explore
              curriculum reasoning in Class 11 Junior Mode.
            </p>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/solo" className="w-full sm:w-auto">
              <Button
                variant="ivory"
                size="lg"
                className="group w-full sm:min-w-[240px] shadow-lg shadow-[#000]/40"
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#8A5A36]" />
                <span>SOLO CAMPAIGN</span>
                <ArrowRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/alliance" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="group w-full sm:min-w-[240px] bg-[#1E2922] text-[#FAF7F2] border-[#52B788]/40 hover:bg-[#25362C]"
              >
                <Users className="w-4 h-4 mr-2 text-[#52B788]" />
                <span>MULTIPLAYER ALLIANCE</span>
                <ArrowRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/junior" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="group w-full sm:min-w-[210px] bg-transparent text-[#FAF7F2] border-[#FAF7F2]/30 hover:bg-[#FAF7F2]/10"
              >
                <BookOpen className="w-4 h-4 mr-2 text-[#C8B28E]" />
                <span>JUNIOR 11</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Monograph Colophon */}
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pb-7 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Illustrated Graphic-Novel Storyboard Platform</span>
          <span>Solo Mind Experiment · Multiplayer Alliance · Junior FYJC Studio</span>
        </div>
      </section>

      {/* 2. PRODUCT INTRODUCTION */}
      <section className="bg-[#FAF7F2] text-[#1C1917] py-20 px-6 sm:px-10 border-b border-[#DDD4C5] paper-grain">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
              01 · Platform Premise
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-[#1C1917]">
              Designed as an editorial inquiry, never an ordinary test.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-[#57524C] leading-relaxed">
            <p>
              <strong className="text-[#1C1917] font-medium">
                THE UNWRITTEN
              </strong>{" "}
              brings together two independent experiences under one roof.{" "}
              <span className="text-[#1C1917]">Senior Mode</span> places
              visitors inside six atmospheric narrative situations—midnight
              platforms, locked archives, and ten-second thresholds—observing
              the quiet signature of their decisions.
            </p>
            <p>
              <span className="text-[#1C1917]">Junior Mode — Class 11</span>{" "}
              reimagines Maharashtra State Board (FYJC) academic preparation as
              a calm, distraction-free reasoning studio across Science,
              Commerce, and Arts—delivering non-repeating 10-question
              explorations paired with evidence-mapped ability reflections.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MODE SELECTION — THREE CANONICAL EXPERIENCES */}
      <section
        id="modes"
        aria-label="Choose Your Experience Mode"
        className="bg-[#F3EDE2] text-[#1C1917] py-20 sm:py-24 px-6 sm:px-10 border-b border-[#DDD4C5]"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
                02 · The Three Pillars
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
                Three distinct gaming universes.
              </h2>
            </div>
            <p className="text-xs text-[#57524C] max-w-sm leading-relaxed">
              Dedicated gameplay engines, strict completion criteria, and zero-compromise
              puzzle validation—engineered for solo depth, squad tactical play, and academic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PILLAR 1: SOLO CAMPAIGN */}
            <article className="bg-[#141210] text-[#FAF7F2] border border-[#3D352E] rounded-sm p-7 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8B28E]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#C8B28E] border-b border-[#FAF7F2]/12 pb-3.5">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8B28E]" />
                    <span>Solo Mind Experiment</span>
                  </span>
                  <span>8 Chambers</span>
                </div>

                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D6CEC0]">
                    <span>SOLO CAMPAIGN</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">
                    The Mind Experiment
                  </h3>
                  <p className="text-xs sm:text-sm text-[#D6CEC0] leading-relaxed font-light">
                    Enter the high-security observation panopticon as Aarav alone.
                    Every chamber demands genuine gameplay—interactive keypad ciphers,
                    three-door logic deductions, memory matrix trials, and a navigable
                    spatial mirror maze. No auto-completion.
                  </p>
                </div>

                <div className="p-3.5 bg-[#1C1814] border border-[#FAF7F2]/10 rounded-sm space-y-1.5 text-xs text-[#D6CEC0]">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#C8B28E] font-medium">
                    Tactical Mechanics
                  </div>
                  <ul className="space-y-1 text-[#A89F93] text-[11px]">
                    <li>• 1 final submission per chamber with failure debrief</li>
                    <li>• 5 progressive hints modal per level</li>
                    <li>• Navigable spatial 2D Mirror Maze</li>
                    <li>• 4 distinct philosophical branching endings</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3 border-t border-[#FAF7F2]/12 relative z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#A89F93]">
                  Single-Player · Aarav Alone
                </span>
                <Link href="/solo">
                  <Button
                    variant="ivory"
                    size="md"
                    className="group w-full"
                  >
                    <span>Enter Solo Campaign</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </article>

            {/* PILLAR 2: MULTIPLAYER ALLIANCE */}
            <article className="bg-[#121A16] text-[#FAF7F2] border border-[#233B2E] rounded-sm p-7 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#52B788]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#52B788] border-b border-[#52B788]/20 pb-3.5">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#52B788]" />
                    <span>Live War Room</span>
                  </span>
                  <span>2–4 Players</span>
                </div>

                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#52B788]">
                    <span>MULTIPLAYER ALLIANCE</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">
                    The Last Alliance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#D6CEC0] leading-relaxed font-light">
                    Assemble your squad in a live War Room. Solve asymmetric 9x9 Sudoku
                    vaults, counter Count Vesper&apos;s live 8x8 Chess mate-in-2, identify the
                    imposter, and survive until Chamber 8: a live Prisoner&apos;s Dilemma betrayal matrix.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0F1713] border border-[#52B788]/20 rounded-sm space-y-1.5 text-xs text-[#D6CEC0]">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#52B788] font-medium">
                    Squad Mechanics
                  </div>
                  <ul className="space-y-1 text-[#A89F93] text-[11px]">
                    <li>• Real 9x9 Sudoku engine with conflict detection</li>
                    <li>• Real 8x8 Chessboard against Count Vesper</li>
                    <li>• Synchronous presence &amp; room codes</li>
                    <li>• Live Prisoner&apos;s Dilemma 4-quadrant resolution</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3 border-t border-[#52B788]/20 relative z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#52B788]">
                  Synchronous Co-Op · 2–4 Operatives
                </span>
                <Link href="/alliance">
                  <Button
                    variant="secondary"
                    size="md"
                    className="group w-full bg-[#1C2F24] text-[#FAF7F2] border-[#52B788]/50 hover:bg-[#253D30]"
                  >
                    <span>Deploy War Room</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </article>

            {/* PILLAR 3: JUNIOR MODE — THE LEARNING ARENA */}
            <article className="bg-[#FAF7F2] text-[#1C1917] border border-[#CFC5B4] rounded-sm p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#545E4E] border-b border-[#DDD4C5] pb-3.5 font-semibold">
                  <span>Class 11 &amp; 12 Arenas</span>
                  <span>14 Subjects · 1,400 Qs</span>
                </div>

                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#545E4E] font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>JUNIOR MODE</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
                    The Learning Arena
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                    Class 11 &amp; Class 12 Maharashtra State Board academic reasoning studio.
                    Science, Commerce, and Arts with 1,400 curated non-repeating questions,
                    built-in LaTeX mathematical typesetting, and competitive exam tracks.
                  </p>
                </div>

                <div className="p-3.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#545E4E] font-medium">
                    Curriculum &amp; Exam Tracks
                  </div>
                  <ul className="space-y-1 text-[#57524C] text-[11px]">
                    <li>• Science: JEE Main/Advanced &amp; NEET UG</li>
                    <li>• Commerce: CUET UG &amp; CA Foundation</li>
                    <li>• Arts: CUET UG &amp; CLAT preparation</li>
                    <li>• LaTeX typesetting for formulas &amp; matrices</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3 border-t border-[#DDD4C5]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Learn · Board Prep · Competitive
                </span>
                <Link href="/junior">
                  <Button
                    variant="primary"
                    size="md"
                    className="group w-full"
                  >
                    <span>Enter Learning Arena</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE EXPLANATION */}
      <section className="bg-[#FAF7F2] text-[#1C1917] py-20 px-6 sm:px-10 border-b border-[#DDD4C5] paper-grain">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
              03 · Architectural Principles
            </p>
            <h2 className="font-serif text-3xl text-[#1C1917]">
              How THE UNWRITTEN operates.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm space-y-3">
              <span className="font-mono text-xs text-[#8A8178]">01</span>
              <h3 className="font-serif text-xl text-[#1C1917]">
                Voluntary Identity &amp; Anonymity
              </h3>
              <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                Both modes work immediately without registration. You may sign
                your dossier with a name or handle via explicit consent, or
                remain completely anonymous.
              </p>
            </div>

            <div className="p-6 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm space-y-3">
              <span className="font-mono text-xs text-[#8A8178]">02</span>
              <h3 className="font-serif text-xl text-[#1C1917]">
                Non-Repeating Cycle Integrity
              </h3>
              <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                In Junior Mode, server-side selection guarantees 10 unique
                questions per run and zero repetition across consecutive runs
                until all 100 subject questions are completed.
              </p>
            </div>

            <div className="p-6 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8A8178]">03</span>
                <ShieldCheck className="w-4 h-4 text-[#545E4E]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1917]">
                Honest Interpretive Boundaries
              </h3>
              <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                Factual telemetry is separated from tentative game profiles. We
                never equate response speed with intelligence or claim clinical,
                IQ, or official board-exam endorsement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REFINED INVITATION TO ENTER */}
      <section className="bg-[#141210] text-[#FAF7F2] py-20 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#C8B28E]">
            Begin When Ready
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF7F2] leading-tight">
            Step into the mystery or test your academic reasoning.
          </h2>
          <p className="text-sm text-[#D6CEC0] max-w-xl mx-auto leading-relaxed">
            Every choice leaves a signature. Select your mode to begin.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link href="/solo">
              <Button
                variant="ivory"
                size="lg"
                className="group"
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#8A5A36]" />
                <span>Enter Solo Campaign</span>
              </Button>
            </Link>
            <Link href="/alliance">
              <Button
                variant="secondary"
                size="lg"
                className="group bg-[#1E2922] text-[#FAF7F2] border-[#52B788]/40 hover:bg-[#25362C]"
              >
                <Users className="w-4 h-4 mr-2 text-[#52B788]" />
                <span>Deploy War Room</span>
              </Button>
            </Link>
            <Link href="/junior">
              <Button
                variant="secondary"
                size="lg"
                className="group bg-transparent text-[#FAF7F2] border-[#FAF7F2]/35 hover:bg-[#FAF7F2]/10"
              >
                <BookOpen className="w-4 h-4 mr-2 text-[#C8B28E]" />
                <span>Learning Arena</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
