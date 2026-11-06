"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { AcademicBoardId, AcademicClassLevel } from "@/lib/junior/curriculum-data";

export interface ClassSelectionConfig {
  level: AcademicClassLevel;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  targetFocus: string;
  accentBorder: string;
  accentBg: string;
  glowColor: string;
}

export const CLASS_LEVEL_CONFIGS: Record<AcademicClassLevel, ClassSelectionConfig> = {
  10: {
    level: 10,
    badge: "BOARD FOUNDATION",
    title: "Class 10",
    subtitle: "Secondary School Examination (CBSE & SSC)",
    description:
      "Master the complete Class 10 curriculum. Includes independent Mathematics Basic & Standard variants, integrated Science (Physics, Chemistry, Biology), Social Science, English, and Information Technology.",
    keyFeatures: [
      "CBSE Math Standard (041) & Basic (241) Tracks",
      "Integrated Science & Social Science Modules",
      "Ray Optics & Unit Circle Visualisations",
      "Full 80-Mark Board Pattern Mock Papers",
    ],
    targetFocus: "10th Board Examination & Foundational Concepts",
    accentBorder: "border-emerald-500/50",
    accentBg: "bg-emerald-950/40",
    glowColor: "rgba(52, 211, 153, 0.35)",
  },
  11: {
    level: 11,
    badge: "CONCEPT MASTERY",
    title: "Class 11",
    subtitle: "Higher Secondary Foundation (FYJC / XI)",
    description:
      "Deep analytical foundations across Science (PCM/PCB/PCMB), Commerce (Accountancy, Economics, OCM, SP), and Arts/Humanities (History, Geography, PolSci, Psychology, Sociology).",
    keyFeatures: [
      "Rigorous Science, Commerce & Arts Streams",
      "1,400 Curated Questions with LaTeX Proofs",
      "VSEPR Molecular & Projectile Trajectory Simulators",
      "Early Competitive Entrance Grounding",
    ],
    targetFocus: "Advanced Subject Rigor & Class 12 Readiness",
    accentBorder: "border-amber-500/50",
    accentBg: "bg-amber-950/40",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
  12: {
    level: 12,
    badge: "BOARD + ENTRANCE PREPARATION",
    title: "Class 12",
    subtitle: "Senior Secondary & National Entrance (HSC / XII)",
    description:
      "Complete syllabus mastery and competitive examination readiness for JEE Main & Advanced, NEET UG, MHT-CET, CUET UG, and CLAT with full-length timed mock examinations.",
    keyFeatures: [
      "Calculus, Electrodynamics & Bayes Probability",
      "National Benchmark JEE/NEET Entrance Tiers",
      "Gauss Law & LCR Circuit Dynamics",
      "Timed Examinations with Negative Marking (-1)",
    ],
    targetFocus: "12th Boards + JEE / NEET / MHT-CET / CUET",
    accentBorder: "border-rose-500/50",
    accentBg: "bg-rose-950/40",
    glowColor: "rgba(244, 63, 94, 0.35)",
  },
};

export function ClassSelector({
  selectedClass,
  onSelectClass,
  selectedBoard,
  onSelectBoard,
}: {
  selectedClass: AcademicClassLevel;
  onSelectClass: (lvl: AcademicClassLevel) => void;
  selectedBoard: AcademicBoardId;
  onSelectBoard: (board: AcademicBoardId) => void;
}) {
  return (
    <div className="space-y-6">
      {/* 1. Board & Academic Year Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14100E] border border-[#2B231D] rounded-md px-5 py-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
            Curriculum Framework · Academic Year 2026–27
          </span>
          <div className="text-sm font-serif font-bold text-[#FAF7F2] mt-0.5">
            Select Your Examination Board
          </div>
        </div>

        <div className="flex rounded border border-[#3A2F27] p-0.5 bg-[#0D0A08]">
          <button
            type="button"
            onClick={() => onSelectBoard("CBSE")}
            className={`px-4 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
              selectedBoard === "CBSE"
                ? "bg-[#251E1A] text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            CBSE (All-India)
          </button>
          <button
            type="button"
            onClick={() => onSelectBoard("MSBSHSE")}
            className={`px-4 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
              selectedBoard === "MSBSHSE"
                ? "bg-[#251E1A] text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Maharashtra State Board (SSC/HSC)
          </button>
        </div>
      </div>

      {/* 2. Three Cards for Class 10, Class 11, Class 12 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {([10, 11, 12] as const).map((lvl) => {
          const cfg = CLASS_LEVEL_CONFIGS[lvl];
          const isSelected = selectedClass === lvl;

          return (
            <div
              key={lvl}
              onClick={() => onSelectClass(lvl)}
              className={`p-5 sm:p-6 rounded-md border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? `bg-[#1E1713] ${cfg.accentBorder} shadow-xl ring-1 ring-amber-500/40`
                  : "bg-[#14100E] border-[#29221C] hover:border-zinc-600 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                      isSelected
                        ? "bg-amber-950/80 text-amber-400 border-amber-500/40"
                        : "bg-[#100D0B] text-zinc-500 border-zinc-800"
                    }`}
                  >
                    {cfg.badge}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
                    {cfg.title}
                  </h3>
                  <div className="text-xs font-mono text-amber-300/90 mt-0.5">
                    {cfg.subtitle}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cfg.description}
                </p>

                {/* Key Features Bullet List */}
                <div className="pt-2 border-t border-[#261E19] space-y-1.5">
                  {cfg.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#261E19] flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Target: {cfg.targetFocus}
                </span>
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                    isSelected ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
