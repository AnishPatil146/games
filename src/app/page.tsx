"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Eye, Sparkles } from "lucide-react";
import { useGameSession } from "@/lib/useGameSession";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const { trackEvent } = useGameSession();

  useEffect(() => {
    // Record initial landing view
    trackEvent(0, "landing_view", {
      path: "/",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 max-w-4xl mx-auto text-center w-full">
        {/* Subtle decorative emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center justify-center p-3 rounded-full border border-[#E0D7CB] bg-[#F4EFE7]/80 text-[#5B6356]"
        >
          <Compass className="w-5 h-5 stroke-[1.5]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-[#1C1917] mb-6 font-normal leading-tight"
        >
          THE UNWRITTEN
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl md:text-2xl font-serif italic text-[#57534E] max-w-xl mx-auto mb-8 font-light"
        >
          &ldquo;Every choice leaves a trace. Every story reveals something.&rdquo;
        </motion.p>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base text-[#78716C] max-w-md mx-auto mb-12 leading-relaxed"
        >
          An interactive experiment in choices, curiosity, observation, and
          imagination.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full sm:w-auto flex flex-col items-center gap-4"
        >
          <Link
            href="/play"
            className="w-full sm:w-auto px-8 py-4 bg-[#1C1917] text-[#FAF8F5] text-xs sm:text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#2F2B28] transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-3 group active:scale-[0.98]"
          >
            <span>ENTER THE EXPERIENCE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C827A] mt-2">
            Six chapters. No perfect answers. Just your decisions.
          </p>
        </motion.div>

        {/* Three core pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-20 pt-16 border-t border-[#E8E2D8] w-full text-left"
        >
          <div className="p-5 rounded border border-[#E8E2D8] bg-[#F4EFE7]/50">
            <div className="w-8 h-8 rounded-full bg-[#EAE3D6] flex items-center justify-center mb-3 text-[#5B6356]">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#1C1917] mb-1">
              Observation
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Every room holds subtle details. How closely you inspect your
              environment shapes the possibilities ahead.
            </p>
          </div>

          <div className="p-5 rounded border border-[#E8E2D8] bg-[#F4EFE7]/50">
            <div className="w-8 h-8 rounded-full bg-[#EAE3D6] flex items-center justify-center mb-3 text-[#5B6356]">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#1C1917] mb-1">
              Deduction
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Puzzles and locked doors require reasoning. There are no luck-based
              answers, only cause and consequence.
            </p>
          </div>

          <div className="p-5 rounded border border-[#E8E2D8] bg-[#F4EFE7]/50">
            <div className="w-8 h-8 rounded-full bg-[#EAE3D6] flex items-center justify-center mb-3 text-[#5B6356]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#1C1917] mb-1">
              Personal Report
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              At the journey&apos;s conclusion, receive a deterministic report
              reflecting your natural patterns and choices.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
