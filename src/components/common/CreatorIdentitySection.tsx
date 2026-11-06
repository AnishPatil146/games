"use client";

import React, { useState } from "react";
import { Sparkles, Compass, Code2, ArrowUpRight } from "lucide-react";
import { AboutProjectModal } from "./AboutProjectModal";
import { ProjectCreditsModal } from "./ProjectCreditsModal";

export function CreatorIdentitySection() {
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  return (
    <>
      <section className="relative z-20 max-w-4xl mx-auto w-full mt-6 px-1">
        <div className="relative rounded-2xl bg-[#141210]/95 border border-[#3E362E] p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Subtle Abstract Node Lines Background Motif */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#8FA184_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              {/* Badge: Human Vision × Artificial Intelligence */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-[0.24em] px-2.5 py-0.5 rounded-full bg-[#8FA184]/15 border border-[#8FA184]/40 text-[#8FA184] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AI-Assisted Design &amp; Engineering</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A89F93]">
                  Independently Developed
                </span>
              </div>

              {/* Main Message */}
              <h3 className="font-serif text-xl sm:text-2xl text-[#FAF7F2] font-bold tracking-tight">
                AN INDEPENDENT CREATION
              </h3>

              <p className="font-serif italic text-sm text-[#DDD4C5] leading-relaxed">
                &ldquo;Imagined, designed and developed independently, with AI as a creative and engineering partner.&rdquo;
              </p>

              <p className="text-xs text-[#A89F93] font-mono leading-relaxed">
                One vision. Countless possibilities. Built from an idea into an interactive experience.
              </p>

              <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#D4C8B8]">
                <span className="text-[#8FA184] font-bold">Signature:</span>
                <span className="font-serif font-bold text-sm text-white tracking-wide">
                  Created by Anish Patil
                </span>
              </div>
            </div>

            {/* Subtle Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsStoryOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-[#221C17] hover:bg-[#2C241E] border border-[#4A3D30] text-[#FAF7F2] hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
              >
                <Compass className="w-3.5 h-3.5 text-[#8FA184] transition-transform group-hover:rotate-45" />
                <span>The Creator&apos;s Story</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => setIsCreditsOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-transparent hover:bg-white/5 border border-white/10 text-[#CFC5B4] hover:text-white font-mono text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Project Credits &amp; Tech</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modals */}
      <AboutProjectModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      <ProjectCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </>
  );
}
