"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";
import { HeroMonographArtwork } from "@/components/artwork/SceneArtwork";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { useGameSession } from "@/lib/useGameSession";

const SENIOR_CHAPTER_PLATES = [
  { numeral: "I", title: "The Last Train", motif: "Urgency & Regard" },
  { numeral: "II", title: "The Locked Room", motif: "Scrutiny & Cipher" },
  { numeral: "III", title: "The Unknown Message", motif: "Signal & Restraint" },
  { numeral: "IV", title: "The Empty Canvas", motif: "Form & Atmosphere" },
  { numeral: "V", title: "The Final Ten Seconds", motif: "Composure & Logic" },
  { numeral: "VI", title: "The Unknown World", motif: "Horizon & Relic" },
];

const JUNIOR_STREAMS_PREVIEW = [
  {
    name: "Science",
    subjects: "Physics · Chemistry · Biology · Mathematics & Statistics",
  },
  {
    name: "Commerce",
    subjects: "Accountancy · OCM · Economics · Secretarial Practice · Maths",
  },
  {
    name: "Arts & Humanities",
    subjects: "History · Geography · Political Science · Psychology · Sociology",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [transitionMode, setTransitionMode] = useState<
    "senior" | "junior" | null
  >(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useGameSession({ recordLandingOnInit: true });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: normX * 14, y: normY * 10 });
  };

  const handleSelectMode = async (mode: "senior" | "junior") => {
    if (transitionMode) return;
    setTransitionMode(mode);

    try {
      await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
    } catch {
      // Non-blocking fallback
    }

    const delayMs = prefersReducedMotion ? 60 : 480;
    setTimeout(() => {
      router.push(mode === "senior" ? "/play" : "/junior");
    }, delayMs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12100E] text-[#FAF7F2] selection:bg-[#FAF7F2] selection:text-[#12100E]">
      {transitionMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0.05 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center pointer-events-none"
          aria-live="polite"
        >
          <span className="text-[11px] uppercase tracking-[0.34em] text-[#57524C]">
            {transitionMode === "senior"
              ? "Opening Senior Narrative Folio"
              : "Entering Junior Reasoning Studio"}
          </span>
        </motion.div>
      )}

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
            <a
              href="#modes"
              className="hover:text-[#FAF7F2] transition-colors hidden sm:inline"
            >
              Experiences
            </a>
            <Link
              href="/play"
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Senior
            </Link>
            <Link
              href="/junior"
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Junior
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Privacy
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
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.36em] text-[#C8B28E]">
              An experiment in human curiosity.
            </p>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-[4.35rem] leading-[1.05] tracking-[-0.02em] text-[#FAF7F2]">
              Every choice leaves a trace.
            </h1>

            <p className="text-base sm:text-lg text-[#D6CEC0] max-w-2xl mx-auto leading-relaxed font-light">
              Two distinct interactive editions built on a single premise: how we
              investigate uncertainty, reason under constraint, and make sense of
              unfamiliar worlds.
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
            <Button
              variant="ivory"
              size="lg"
              onClick={() => void handleSelectMode("senior")}
              className="group min-w-[248px]"
            >
              <span>ENTER SENIOR MODE</span>
              <ArrowRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => void handleSelectMode("junior")}
              className="group min-w-[248px] bg-transparent text-[#FAF7F2] border-[#FAF7F2]/35 hover:bg-[#FAF7F2]/10"
            >
              <span>JUNIOR MODE · CLASS 11</span>
              <ArrowRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Bottom Monograph Colophon */}
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pb-7 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Dual-Edition Interactive Platform</span>
          <span>Senior Narrative Monograph · Junior Class 11 Studio</span>
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

      {/* 3. MODE SELECTION — TWO DISTINCT EXPERIENCE PANELS */}
      <section
        id="modes"
        aria-label="Choose Your Experience Mode"
        className="bg-[#F3EDE2] text-[#1C1917] py-20 sm:py-24 px-6 sm:px-10 border-b border-[#DDD4C5]"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
                02 · Select Edition
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
                Two independent thresholds.
              </h2>
            </div>
            <p className="text-xs text-[#57524C] max-w-sm leading-relaxed">
              Separate engines, content banks, and synthesis models—united by
              privacy-first session architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PANEL A: SENIOR MODE */}
            <article className="bg-[#141210] text-[#FAF7F2] border border-[#2E2924] rounded-sm p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-[#C8B28E] border-b border-[#FAF7F2]/12 pb-4">
                  <span>Edition A · Interactive Fiction</span>
                  <span>6 Chapters + 7th Door</span>
                </div>

                <div className="h-32 w-full rounded-sm bg-[#1B1815] border border-[#FAF7F2]/10 flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 420 120"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    <line
                      x1="40"
                      y1="96"
                      x2="380"
                      y2="96"
                      stroke="#3E3730"
                      strokeWidth="1"
                    />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <path
                        key={i}
                        d={`M ${68 + i * 48} 96 L ${68 + i * 48} 48 A 16 16 0 0 1 ${
                          100 + i * 48
                        } 48 L ${100 + i * 48} 96`}
                        fill={i === 5 ? "#545E4E" : "none"}
                        fillOpacity={i === 5 ? "0.28" : "0"}
                        stroke={i === 5 ? "#C8B28E" : "#8A8178"}
                        strokeWidth="1.2"
                      />
                    ))}
                    <circle
                      cx="352"
                      cy="62"
                      r="5"
                      fill="none"
                      stroke="#9E6B68"
                      strokeWidth="1.3"
                    />
                  </svg>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D6CEC0]">
                    <Compass className="w-3.5 h-3.5 text-[#C8B28E]" />
                    <span>SENIOR MODE</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">
                    The Narrative Monograph
                  </h3>
                  <p className="text-sm text-[#D6CEC0] leading-relaxed font-light">
                    Step into six fictional chapters—from a departing midnight
                    express to a locked curator&apos;s study. Examine hidden
                    correspondence, solve tactile ciphers, unlock the optional
                    Seventh Door, and receive a personal gameplay dossier with a
                    visual Choice Map.
                  </p>
                </div>

                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-[#FAF7F2]/10 text-xs text-[#D6CEC0]">
                  {SENIOR_CHAPTER_PLATES.map((ch) => (
                    <li
                      key={ch.numeral}
                      className="flex items-baseline justify-between py-1 border-b border-[#FAF7F2]/5"
                    >
                      <span className="font-serif">
                        <span className="font-mono text-[10px] text-[#8A8178] mr-2">
                          {ch.numeral}
                        </span>
                        {ch.title}
                      </span>
                      <span className="text-[10px] text-[#8A8178]">
                        {ch.motif}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#FAF7F2]/12">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#A89F93]">
                  Duration · 4–6 Minutes
                </span>
                <Button
                  variant="ivory"
                  size="md"
                  onClick={() => void handleSelectMode("senior")}
                  className="group"
                >
                  <span>Begin Senior Mode</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </article>

            {/* PANEL B: JUNIOR MODE — CLASS 11 */}
            <article className="bg-[#FAF7F2] text-[#1C1917] border border-[#CFC5B4] rounded-sm p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-[#545E4E] border-b border-[#DDD4C5] pb-4 font-semibold">
                  <span>Edition B · Class 11 Academic Challenges</span>
                  <span>MSBSHSE · 14 Subjects</span>
                </div>

                <div className="h-32 w-full rounded-sm bg-[#F3EDE2] border border-[#DDD4C5] flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 420 120"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    <line
                      x1="30"
                      y1="60"
                      x2="390"
                      y2="60"
                      stroke="#DDD4C5"
                      strokeWidth="1"
                    />
                    <circle
                      cx="210"
                      cy="60"
                      r="40"
                      fill="none"
                      stroke="#545E4E"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="210"
                      cy="60"
                      r="24"
                      fill="none"
                      stroke="#8A8178"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <polygon
                      points="210,22 244,78 176,78"
                      fill="none"
                      stroke="#1C1917"
                      strokeWidth="1.1"
                    />
                    <circle cx="210" cy="22" r="3" fill="#545E4E" />
                    <circle cx="244" cy="78" r="3" fill="#9E6B68" />
                    <circle cx="176" cy="78" r="3" fill="#1C1917" />
                  </svg>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#545E4E] font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>JUNIOR MODE — CLASS 11</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
                    The FYJC Reasoning Studio
                  </h3>
                  <p className="text-sm text-[#57524C] leading-relaxed">
                    Structured 10-question academic challenges aligned to the
                    Class 11 Maharashtra State Board syllabus across Science,
                    Commerce, and Arts. Every subject holds a curated
                    100-question bank that never repeats a completed question
                    until all 100 have been explored.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#DDD4C5]">
                  {JUNIOR_STREAMS_PREVIEW.map((st) => (
                    <div
                      key={st.name}
                      className="p-3 bg-[#F3EDE2]/75 border border-[#E5DEC9] rounded-sm"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-serif text-base text-[#1C1917] font-medium">
                          {st.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-[#545E4E]">
                          10 Qs / Attempt
                        </span>
                      </div>
                      <p className="text-xs text-[#57524C] mt-0.5">
                        {st.subjects}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#DDD4C5]">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  1,400 Curated Syllabus Items
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => void handleSelectMode("junior")}
                  className="group"
                >
                  <span>Enter Junior Mode</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
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
            Step into a narrative mystery or test your academic reasoning.
          </h2>
          <p className="text-sm text-[#D6CEC0] max-w-xl mx-auto leading-relaxed">
            Progress is preserved automatically in your private browser session.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="ivory"
              size="lg"
              onClick={() => void handleSelectMode("senior")}
            >
              Start Senior Narrative
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => void handleSelectMode("junior")}
              className="bg-transparent text-[#FAF7F2] border-[#FAF7F2]/35 hover:bg-[#FAF7F2]/10"
            >
              Start Class 11 Challenge
            </Button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
