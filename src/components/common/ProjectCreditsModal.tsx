"use client";

import React from "react";
import { X, Code2, Cpu, Database, Palette, CheckCircle2, Shield } from "lucide-react";

interface ProjectCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectCreditsModal({ isOpen, onClose }: ProjectCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full bg-[#181512] text-[#FAF7F2] border border-[#453D35] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close credits"
          className="absolute top-5 right-5 p-2 rounded-full bg-[#241F1A] border border-[#3E342B] text-[#CFC5B4] hover:text-white hover:bg-[#2F2822] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 border-b border-[#352D25] pb-4">
          <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#8FA184] font-bold block">
            Project Colophon &amp; Attribution
          </span>
          <h2 id="credits-modal-title" className="font-serif text-2xl text-[#FAF7F2] font-bold">
            THE UNWRITTEN — Credits
          </h2>
          <p className="text-xs text-[#A89F93] font-mono">
            An independently created interactive experience.
          </p>
        </div>

        {/* Key Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-[#211C18] border border-[#3D3328] rounded-sm space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-[#8A8178] block">Creator &amp; Architect</span>
            <span className="font-serif text-base font-bold text-white block">Anish Patil</span>
            <span className="text-[10px] text-[#8FA184]">Concept, Game Design &amp; Full-Stack Code</span>
          </div>

          <div className="p-3.5 bg-[#211C18] border border-[#3D3328] rounded-sm space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-[#8A8178] block">Design &amp; Engineering</span>
            <span className="font-serif text-base font-bold text-white block">Human Vision × AI</span>
            <span className="text-[10px] text-amber-300">AI-Assisted Co-Pilot &amp; Asset Generation</span>
          </div>
        </div>

        {/* Verified Tech Stack Breakdown */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#DDD4C5] font-bold block">
            Verified Architectural Stack:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 bg-[#1C1814] border border-[#352C22] rounded flex items-start gap-2.5">
              <Code2 className="w-4 h-4 text-[#8FA184] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Next.js 16 &amp; React 19</span>
                <span className="text-[10px] text-[#A89F93]">Turbopack App Router, SSR &amp; Static Generation</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C1814] border border-[#352C22] rounded flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-[#8FA184] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">TypeScript &amp; KaTeX</span>
                <span className="text-[10px] text-[#A89F93]">Strict typing &amp; mathematical typesetting</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C1814] border border-[#352C22] rounded flex items-start gap-2.5">
              <Database className="w-4 h-4 text-[#8FA184] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">PostgreSQL / Supabase</span>
                <span className="text-[10px] text-[#A89F93]">Persistent profiles, audit logs &amp; telemetry</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C1814] border border-[#352C22] rounded flex items-start gap-2.5">
              <Palette className="w-4 h-4 text-[#8FA184] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Graphic Novel Canvas</span>
                <span className="text-[10px] text-[#A89F93]">Tailwind CSS, HTML5 Canvas &amp; Framer Motion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invariant Statement */}
        <div className="p-3.5 bg-[#14120E] border border-[#3D3328] rounded-sm text-xs font-mono text-[#A89F93] leading-relaxed">
          <p>
            <strong className="text-white">Authenticity Guarantee:</strong> Built without commercial agency backing,
            ready-made templates, or outsourced design. Every line of code, puzzle state machine, and curriculum DAG is
            part of an independent original vision.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#352D25] flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-[#8A8178]">
            © {new Date().getFullYear()} Anish Patil. All rights reserved.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#FAF7F2] text-[#12100E] font-bold hover:bg-[#E7E0D3] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
