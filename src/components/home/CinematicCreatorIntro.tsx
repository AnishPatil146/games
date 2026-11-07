"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, FastForward, Play } from "lucide-react";

interface CinematicCreatorIntroProps {
  onComplete: () => void;
  isReplay?: boolean;
}

type IntroPhase =
  | "atmosphere" // 0.0s - 1.2s: Near-black void, deep particles waking up
  | "logo" // 1.2s - 5.5s: Geometric emblem lines assembling, silver light sweep, brand typography
  | "welcome" // 5.5s - 9.8s: "EVERY STORY BEGINS WITH A QUESTION" -> "WELCOME TO THE UNWRITTEN"
  | "creator" // 9.8s - 17.5s: "A MESSAGE FROM THE CREATOR" & 3 staggered sentences
  | "signature" // 17.5s - 22.0s: Calligraphic SVG signature reveal "ANISH PATIL · THE CREATOR"
  | "finale" // 22.0s - 26.0s: "THE JOURNEY IS JUST BEGINNING" -> dissolve into homepage
  | "done";

export function CinematicCreatorIntro({
  onComplete,
  isReplay = false,
}: CinematicCreatorIntroProps) {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("atmosphere");
  const [isSkipping, setIsSkipping] = useState(false);

  // If user prefers reduced motion, skip straight to done
  useEffect(() => {
    if (prefersReduced && !isReplay) {
      onComplete();
    }
  }, [prefersReduced, isReplay, onComplete]);

  // Handle immediate Skip
  const handleSkip = useCallback(() => {
    setIsSkipping(true);
    try {
      sessionStorage.setItem("unwritten_intro_seen", "true");
    } catch {
      // ignore
    }
    setTimeout(() => {
      onComplete();
    }, 400);
  }, [onComplete]);

  // Keyboard shortcut: ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Master Timeline Coordinator
  useEffect(() => {
    if (prefersReduced) return;

    const t1 = setTimeout(() => setPhase("logo"), 1200);
    const t2 = setTimeout(() => setPhase("welcome"), 5600);
    const t3 = setTimeout(() => setPhase("creator"), 10200);
    const t4 = setTimeout(() => setPhase("signature"), 17800);
    const t5 = setTimeout(() => setPhase("finale"), 22200);
    const t6 = setTimeout(() => {
      setPhase("done");
      try {
        sessionStorage.setItem("unwritten_intro_seen", "true");
      } catch {
        // ignore
      }
      onComplete();
    }, 26200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [prefersReduced, onComplete]);

  // Deterministic atmospheric particles array for depth and 3D floating effect
  const particles = useMemo(() => {
    const seeds = [
      { x: 12, y: 18, size: 2, delay: 0, depth: "far", dur: 6.2 },
      { x: 28, y: 72, size: 3.5, delay: 0.8, depth: "mid", dur: 7.5 },
      { x: 45, y: 35, size: 1.5, delay: 1.5, depth: "far", dur: 8.0 },
      { x: 62, y: 84, size: 4, delay: 0.3, depth: "near", dur: 5.8 },
      { x: 78, y: 22, size: 2.5, delay: 1.2, depth: "mid", dur: 7.0 },
      { x: 88, y: 65, size: 1.8, delay: 2.0, depth: "far", dur: 9.1 },
      { x: 18, y: 48, size: 3, delay: 0.5, depth: "mid", dur: 6.5 },
      { x: 38, y: 15, size: 4.5, delay: 1.8, depth: "near", dur: 5.2 },
      { x: 55, y: 78, size: 2, delay: 2.4, depth: "far", dur: 8.5 },
      { x: 72, y: 52, size: 3.5, delay: 1.0, depth: "mid", dur: 7.2 },
      { x: 84, y: 38, size: 2, delay: 0.2, depth: "far", dur: 6.9 },
      { x: 92, y: 88, size: 3, delay: 1.7, depth: "mid", dur: 8.2 },
      { x: 8, y: 82, size: 4, delay: 2.2, depth: "near", dur: 5.5 },
      { x: 48, y: 92, size: 2.5, delay: 0.7, depth: "mid", dur: 7.8 },
      { x: 65, y: 12, size: 1.5, delay: 1.9, depth: "far", dur: 9.0 },
    ];
    return seeds;
  }, []);

  return (
    <motion.aside
      role="region"
      aria-label="Cinematic Introduction: The Unwritten by Anish Patil"
      initial={{ opacity: 1 }}
      animate={{ opacity: isSkipping ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#05070A] text-[#FAF7F2] select-none flex flex-col justify-between"
    >
      {/* 1. LAYERED ATMOSPHERE & CAMERA DOLLY ILLUSION */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Volumetric Spotlight with subtle wander */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
            x: [0, 25, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[120px] bg-gradient-to-br from-amber-500/10 via-emerald-600/5 to-transparent pointer-events-none"
        />

        {/* Cinematic Film Grain & Radial Vignette */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/90" />

        {/* 3D Depth Layered Particles */}
        {particles.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, p.depth === "near" ? 0.65 : p.depth === "mid" ? 0.45 : 0.25, 0],
              y: [-10, -60, -110],
              x: [0, (idx % 2 === 0 ? 1 : -1) * 20, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: p.depth === "near" ? "#FAF7F2" : "#C8B28E",
              boxShadow: p.depth === "near" ? "0 0 8px rgba(250, 247, 242, 0.8)" : "none",
              filter: p.depth === "far" ? "blur(1px)" : "none",
            }}
          />
        ))}
      </div>

      {/* 2. TOP HUD: SKIP INTRO CONTROL */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-[0.28em] text-[#C8B28E]">
            THE UNWRITTEN · PRELUDE
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          title="Skip cinematic introduction (ESC)"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:translate-x-0.5" />
        </button>
      </header>

      {/* 3. CENTRAL CINEMATIC STAGE */}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-6 py-8 flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* SCENE 1: LOGO ANIMATION & GEOMETRIC ASSEMBLY             */}
          {/* ======================================================== */}
          {phase === "logo" && (
            <motion.div
              key="scene-logo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Emblem with assembling geometric SVG lines and light sweep */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                {/* SVG Sacred Geometry Lines assembling */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 160 160"
                  fill="none"
                >
                  {/* Outer Orbital Ring */}
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="74"
                    stroke="#C8B28E"
                    strokeWidth="1.2"
                    strokeDasharray="4 6"
                    initial={{ pathLength: 0, rotate: 0, opacity: 0 }}
                    animate={{ pathLength: 1, rotate: 360, opacity: 0.6 }}
                    transition={{
                      pathLength: { duration: 2.2, ease: "easeInOut" },
                      rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 1.2 },
                    }}
                  />

                  {/* Concentric Gold Precision Ring */}
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#FAF7F2"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 2.0, delay: 0.3, ease: "easeInOut" }}
                  />

                  {/* Geometric Intersecting Diamond Axis Lines */}
                  <motion.polygon
                    points="80,18 142,80 80,142 18,80"
                    stroke="#8FA184"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
                  />

                  {/* Cardinal Cross Compass Markers */}
                  <motion.line
                    x1="80"
                    y1="8"
                    x2="80"
                    y2="28"
                    stroke="#C8B28E"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: 1.0 }}
                  />
                  <motion.line
                    x1="80"
                    y1="132"
                    x2="80"
                    y2="152"
                    stroke="#C8B28E"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: 1.0 }}
                  />
                  <motion.line
                    x1="8"
                    y1="80"
                    x2="28"
                    y2="80"
                    stroke="#C8B28E"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: 1.0 }}
                  />
                  <motion.line
                    x1="132"
                    y1="80"
                    x2="152"
                    y2="80"
                    stroke="#C8B28E"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: 1.0 }}
                  />
                </svg>

                {/* Central Emblem Image with Radiant Glow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-[0_0_35px_rgba(200,178,142,0.35)]"
                >
                  <Image
                    src="/brand/emblem-silence.png"
                    alt="THE UNWRITTEN Emblem"
                    fill
                    priority
                    className="object-cover"
                  />

                  {/* Silver Light Sweep Traversal */}
                  <motion.div
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{ duration: 1.6, delay: 2.2, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 pointer-events-none"
                  />
                </motion.div>
              </div>

              {/* Carefully Timed Brand Typography */}
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 15, letterSpacing: "0.20em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.38em" }}
                  transition={{ duration: 1.4, delay: 1.4, ease: "easeOut" }}
                  className="font-serif text-3xl sm:text-5xl text-[#FAF7F2] font-black uppercase drop-shadow-md"
                >
                  THE UNWRITTEN
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.0, delay: 2.2 }}
                  className="flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-[0.26em] text-[#C8B28E]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
                  <span>WHERE SILENCE SPEAKS</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SCENE 2: ANIMATED WELCOME QUOTE                          */}
          {/* ======================================================== */}
          {phase === "welcome" && (
            <motion.div
              key="scene-welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* Line 1: Sequential word reveal */}
              <div className="overflow-hidden">
                <motion.p
                  initial={{ opacity: 0, y: 16, letterSpacing: "0.08em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.14em" }}
                  transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  className="font-serif italic text-2xl sm:text-4xl text-[#FAF7F2] font-semibold leading-relaxed"
                >
                  &ldquo;EVERY STORY BEGINS WITH A QUESTION.&rdquo;
                </motion.p>
              </div>

              {/* Decorative Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.0, delay: 1.2 }}
                className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"
              />

              {/* Line 2: Authoritative Greeting */}
              <motion.p
                initial={{ opacity: 0, scale: 0.94, letterSpacing: "0.22em" }}
                animate={{ opacity: 1, scale: 1, letterSpacing: "0.32em" }}
                transition={{ duration: 1.4, delay: 1.6, ease: "easeOut" }}
                className="font-serif text-xl sm:text-3xl text-amber-200/90 font-bold uppercase drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              >
                WELCOME TO THE UNWRITTEN.
              </motion.p>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SCENE 3: ANIMATED PERSONAL CREATOR MESSAGE               */}
          {/* ======================================================== */}
          {phase === "creator" && (
            <motion.div
              key="scene-creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto space-y-6 text-center"
            >
              {/* Scene Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#8FA184]"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>A MESSAGE FROM THE CREATOR</span>
              </motion.div>

              {/* Main Message Sentences (Staggered upward reveals) */}
              <div className="space-y-4 pt-2">
                {/* Sentence 1 */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif italic text-xl sm:text-3xl text-white font-medium leading-snug"
                >
                  &ldquo;Every great journey starts somewhere.&rdquo;
                </motion.p>

                {/* Sentence 2 */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-sans text-base sm:text-xl text-[#DDD4C5] font-light leading-relaxed max-w-xl mx-auto"
                >
                  This is my first game. It started as a simple idea, and I&apos;m learning, building and improving it along the way.
                </motion.p>

                {/* Sentence 3 */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 4.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif italic text-base sm:text-xl text-amber-200/95 font-medium leading-relaxed max-w-xl mx-auto"
                >
                  It may not be perfect today, but I hope you&apos;ll enjoy being part of its journey.
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SCENE 4: ANIMATED SIGNATURE                              */}
          {/* ======================================================== */}
          {phase === "signature" && (
            <motion.div
              key="scene-signature"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xs uppercase font-mono tracking-[0.32em] text-[#A89F93]"
              >
                CRAFTED WITH INTENTION
              </motion.span>

              {/* Creator Name with Silver/Gold Radiant Shimmer */}
              <div className="relative py-2">
                <motion.h2
                  initial={{ opacity: 0, y: 12, letterSpacing: "0.18em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.32em" }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="font-serif font-black text-3xl sm:text-5xl text-white uppercase tracking-[0.32em] drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                >
                  ANISH PATIL
                </motion.h2>

                {/* Calligraphic Handwriting-Style Stroke Reveal */}
                <svg
                  className="w-64 sm:w-80 h-10 mx-auto mt-2 pointer-events-none"
                  viewBox="0 0 320 40"
                  fill="none"
                >
                  <motion.path
                    d="M 10,24 C 60,14 110,34 160,20 C 210,6 260,32 310,18"
                    stroke="url(#signature-gradient)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.8, delay: 1.0, ease: [0.45, 0, 0.15, 1] }}
                  />
                  <defs>
                    <linearGradient id="signature-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8FA184" />
                      <stop offset="50%" stopColor="#FAF7F2" />
                      <stop offset="100%" stopColor="#C8B28E" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Role Title */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.34em] text-[#8FA184] font-bold"
              >
                <span>THE CREATOR</span>
              </motion.div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SCENE 5: FINAL CINEMATIC MESSAGE                         */}
          {/* ======================================================== */}
          {phase === "finale" && (
            <motion.div
              key="scene-finale"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 max-w-xl mx-auto"
            >
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.20em" }}
                animate={{ opacity: 1, letterSpacing: "0.36em" }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="font-serif text-2xl sm:text-4xl text-white font-bold uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.45)]"
              >
                THE JOURNEY IS JUST BEGINNING.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1.0, delay: 1.2 }}
                className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#C8B28E]"
              >
                ENTERING THE UNWRITTEN ARCHIVES · SILENCE SPEAKS
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. FOOTER PROGRESS INDICATOR */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto px-6 pb-6 sm:pb-8 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span>HUMAN VISION × ARTIFICIAL INTELLIGENCE</span>
        </div>

        {/* Dynamic Scene Step Dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {(["logo", "welcome", "creator", "signature", "finale"] as IntroPhase[]).map((p, idx) => {
            const phases: IntroPhase[] = ["atmosphere", "logo", "welcome", "creator", "signature", "finale", "done"];
            const currentIdx = phases.indexOf(phase);
            const targetIdx = phases.indexOf(p);
            const isActive = currentIdx === targetIdx;
            const isPassed = currentIdx > targetIdx;

            return (
              <span
                key={idx}
                className={`transition-all duration-500 rounded-full ${
                  isActive
                    ? "w-6 h-1.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : isPassed
                    ? "w-1.5 h-1.5 bg-[#8FA184]"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            );
          })}
        </div>
      </footer>
    </motion.aside>
  );
}

export default CinematicCreatorIntro;

