"use client";

import React from "react";
import Image from "next/image";
import { X, Sparkles, User, Code2, Compass, Layers, ShieldCheck, Heart } from "lucide-react";

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayIntro?: () => void;
}

export function AboutProjectModal({ isOpen, onClose, onReplayIntro }: AboutProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-[#181512] text-[#FAF7F2] border border-[#453D35] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close story"
          className="absolute top-5 right-5 p-2 rounded-full bg-[#241F1A] border border-[#3E342B] text-[#CFC5B4] hover:text-white hover:bg-[#2F2822] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 border-b border-[#352D25] pb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.24em] px-2.5 py-0.5 rounded bg-[#8FA184]/15 border border-[#8FA184]/40 text-[#8FA184] font-bold">
              The Creator&apos;s Story
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
              Human Vision × AI-Assisted Design
            </span>
          </div>

          <h2 id="about-modal-title" className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-bold">
            The Making of <span className="italic">THE UNWRITTEN</span>
          </h2>
          <p className="text-xs font-mono text-[#A89F93]">
            Conceived, architected, and built independently by Anish Patil.
          </p>
        </div>

        {/* Narrative Body */}
        <div className="space-y-5 text-xs sm:text-sm text-[#DDD4C5] leading-relaxed font-light">
          {/* Section 1: The Original Spark */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#FAF7F2] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8FA184]" />
              <span>1. The Vision: An Interactive Dual Universe</span>
            </h3>
            <p>
              THE UNWRITTEN began with a simple creative conviction: interactive games and rigorous academic learning
              do not need to be mutually exclusive, boring, or cookie-cutter templates. 
            </p>
            <p>
              I wanted to build an experience that demanded genuine intellectual agency—whether navigating the 8 claustrophobic,
              puzzle-locked chambers of a psychological solitary confinement experiment as Aarav Kulkarni, or engaging in deep,
              evidence-based curriculum mastery in The Academy across Classes 10, 11, and 12.
            </p>
          </div>

          {/* Section 2: AI as Creative & Engineering Partner */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#FAF7F2] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>2. AI-Assisted Design &amp; Rapid Iteration</span>
            </h3>
            <p>
              This is an independent creation, built by one developer with artificial intelligence as a collaborative co-pilot.
              AI was not used to stamp out generic boilerplate or copy templates. Instead, AI served as:
            </p>
            <ul className="grid grid-cols-1 gap-2 pl-2 text-xs font-mono text-[#CFC5B4]">
              <li className="flex items-start gap-2">
                <span className="text-[#8FA184] font-bold">•</span>
                <span><strong>Visual Worldbuilding Co-Pilot:</strong> Generating high-resolution graphic novel background art and textured character expressions (Aarav, Aanya, Count Vesper, Mr. Halden, Mira).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8FA184] font-bold">•</span>
                <span><strong>Mathematical Formatting Partner:</strong> Typesetting complex CBSE and State Board formulas into rigorous KaTeX notation with step-by-step numerical substitutions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8FA184] font-bold">•</span>
                <span><strong>Architecture Sparring Partner:</strong> Stress-testing prerequisite dependency DAGs, mistake categorization engines, and zero-repetition curriculum selectors.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: The Independent Difference */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#FAF7F2] flex items-center gap-2">
              <User className="w-4 h-4 text-[#8FA184]" />
              <span>3. Built from an Idea, Not a Template</span>
            </h3>
            <p>
              Every puzzle mechanic (terminal decoders, three-doors logic elimination, spatial mirror mazes), 
              every academic curriculum map (14 subjects, 1,400+ questions, 4-dimension formula matrices), and the complete 
              real-time administrative telemetry were hand-architected and engineered for this project.
            </p>
            <p className="italic text-[#8FA184]">
              &ldquo;One vision. Countless possibilities. Built from an idea into an interactive experience.&rdquo;
            </p>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-4 border-t border-[#352D25] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#A89F93]">
            <Heart className="w-3.5 h-3.5 text-[#9E6B68]" />
            <span>Crafted with intention by Anish Patil</span>
          </div>
          <div className="flex items-center gap-2">
            {onReplayIntro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplayIntro();
                }}
                className="px-4 py-2 rounded bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-xs uppercase tracking-wider font-bold hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Replay Intro</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded bg-[#FAF7F2] text-[#12100E] font-bold hover:bg-[#E7E0D3] transition-colors cursor-pointer"
            >
              Close Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

