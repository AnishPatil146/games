"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroMonographArtwork } from "@/components/artwork/SceneArtwork";
import { Button } from "@/components/Button";
import { useGameSession } from "@/lib/useGameSession";

const CHAPTER_PLATES = [
  { numeral: "I", title: "The Last Train", motif: "Urgency & Regard" },
  { numeral: "II", title: "The Locked Room", motif: "Scrutiny & Cipher" },
  { numeral: "III", title: "The Unknown Message", motif: "Signal & Restraint" },
  { numeral: "IV", title: "The Empty Canvas", motif: "Form & Atmosphere" },
  { numeral: "V", title: "The Final Ten Seconds", motif: "Composure & Logic" },
  { numeral: "VI", title: "The Unknown World", motif: "Horizon & Relic" },
];

export default function LandingPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isEntering, setIsEntering] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Accurately records a real landing_view event & captures campaign UTM params
  useGameSession({ recordLandingOnInit: true });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: normX * 14, y: normY * 10 });
  };

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    const delayMs = prefersReducedMotion ? 80 : 620;
    setTimeout(() => {
      router.push("/play");
    }, delayMs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12100E] text-[#FAF7F2] selection:bg-[#FAF7F2] selection:text-[#12100E]">
      {/* Meaningful Curtain Transition into Prologue */}
      {isEntering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center pointer-events-none"
          aria-live="polite"
        >
          <span className="text-[11px] uppercase tracking-[0.34em] text-[#57524C]">
            Opening Folio I
          </span>
        </motion.div>
      )}

      {/* Full-Screen Cinematic Hero Composition */}
      <section
        onMouseMove={handleMouseMove}
        className="relative min-h-[94vh] w-full flex flex-col justify-between overflow-hidden border-b border-[#FAF7F2]/10"
      >
        {/* Layered Parallax Artwork */}
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

        {/* Vignette & Legibility Scrim */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#12100E]/75 via-[#12100E]/35 to-[#12100E]/92"
          aria-hidden="true"
        />

        {/* Minimal Editorial Masthead */}
        <header className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pt-7 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.32em] text-[#FAF7F2]/90 font-medium">
            THE UNWRITTEN
          </span>
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em] text-[#D6CEC0]">
            <span className="hidden sm:inline text-[#8A8178]">Edition I</span>
            <Link
              href="/privacy"
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </header>

        {/* Central Editorial Typography & Threshold CTA */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 py-16 text-center space-y-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.36em] text-[#D6CEC0]">
              THE UNWRITTEN
            </p>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-[4.25rem] leading-[1.06] tracking-[-0.02em] text-[#FAF7F2]">
              Every choice leaves a trace.
            </h1>

            <p className="text-base sm:text-lg text-[#D6CEC0] max-w-xl mx-auto leading-relaxed font-light">
              Six chapters. Unexpected decisions. A story that becomes your own.
            </p>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2 flex flex-col items-center space-y-4"
          >
            <Button
              variant="ivory"
              size="lg"
              onClick={handleEnter}
              className="group min-w-[260px]"
            >
              <span>ENTER THE EXPERIENCE</span>
              <ArrowRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <p className="text-xs tracking-[0.08em] text-[#A89F93] font-serif italic">
              No perfect answers. Just the choices you make.
            </p>
          </motion.div>
        </div>

        {/* Bottom Architectural Monograph Strip */}
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pb-7 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Interactive Narrative Monograph</span>
          <span>Estimated Duration · 4–6 Minutes</span>
        </div>
      </section>

      {/* Quiet Museum Folio Index (Restrained Warm Ivory Colophon) */}
      <section
        aria-label="Chapter Index"
        className="bg-[#FAF7F2] text-[#1C1917] py-20 px-6 sm:px-10 paper-grain"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8178]">
                Folio Sequence
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] mt-1">
                Six threshold situations, observed in real time.
              </h2>
            </div>
            <p className="text-xs text-[#57524C] max-w-xs leading-relaxed">
              Designed for mobile and desktop reading. Play anonymously or sign
              your dossier before entering.
            </p>
          </div>

          <ol className="divide-y divide-[#DDD4C5] border-b border-[#DDD4C5]">
            {CHAPTER_PLATES.map((ch) => (
              <li
                key={ch.numeral}
                className="py-4 flex items-baseline justify-between gap-4 text-sm"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-xs text-[#8A8178] w-6">
                    {ch.numeral}
                  </span>
                  <span className="font-serif text-lg sm:text-xl text-[#1C1917]">
                    {ch.title}
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A8178] text-right">
                  {ch.motif}
                </span>
              </li>
            ))}
          </ol>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57524C]">
            <p className="font-serif italic text-sm text-[#57524C]">
              Fictional narrative exploration — not a clinical or psychological
              assessment.
            </p>
            <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={handleEnter}
                className="text-[#1C1917] font-medium underline underline-offset-4 cursor-pointer hover:text-[#545E4E]"
              >
                Begin Chapter 01
              </button>
              <Link
                href="/privacy"
                className="text-[#8A8178] hover:text-[#1C1917] transition-colors"
              >
                Privacy &amp; Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
