"use client";

import { useState } from "react";
import {
  Trophy,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { COMPETITIVE_EXAMS } from "@/lib/junior/academy-models";

interface CompetitiveExamHubProps {
  onStartExam: (examId: string, subjectSlug: string, difficulty: "Easy" | "Medium" | "Hard") => void;
  availableSubjectSlugs: string[];
}

export function CompetitiveExamHub({
  onStartExam,
  availableSubjectSlugs,
}: CompetitiveExamHubProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>("jee");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const currentExam =
    COMPETITIVE_EXAMS.find((e) => e.id === selectedExamId) || COMPETITIVE_EXAMS[0];

  const handleLaunch = () => {
    // Pick the primary subject slug for this exam
    let targetSubject = availableSubjectSlugs[0] || "sci-physics";
    if (currentExam.id === "jee") targetSubject = "sci-mathematics";
    if (currentExam.id === "neet") targetSubject = "sci-biology";
    if (currentExam.id === "ca_foundation") targetSubject = "com-accountancy";
    if (currentExam.id === "clat") targetSubject = "art-political-science";

    onStartExam(currentExam.id, targetSubject, selectedDifficulty);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead */}
      <div className="bg-[#191512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4A47C]">
            <Trophy className="w-3.5 h-3.5" />
            <span>National Entrance Examination Arena</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
            Competitive Examination Hall
          </h2>
          <p className="text-sm text-[#A89F93] leading-relaxed">
            Test yourself under authentic competitive examination pressure. Featuring official marking schemes, negative-marking penalty simulation, multi-concept reasoning, and timed speed targets.
          </p>
        </div>

        {/* Decorative background trophy watermark */}
        <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none select-none text-[#DDD4C5]">
          <Trophy className="w-72 h-72" />
        </div>
      </div>

      {/* 2. Exam Selector Carousel / Cards */}
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#545E4E] font-bold">
          Select Examination Target ({COMPETITIVE_EXAMS.length} National Tracks)
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {COMPETITIVE_EXAMS.map((exam) => {
            const isSelected = exam.id === currentExam.id;
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExamId(exam.id)}
                className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1C1917] border-[#8FA184] text-[#FAF7F2] shadow-md scale-[1.02]"
                    : "bg-[#FAF7F2] border-[#DDD4C5] text-[#1C1917] hover:bg-[#F3EDE2]"
                }`}
              >
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider block mb-1 ${
                    isSelected ? "text-[#8FA184]" : "text-[#7A7165]"
                  }`}
                >
                  {exam.targetStream.toUpperCase()}
                </span>
                <p className="font-serif text-sm font-bold leading-tight">{exam.name}</p>
                <span className="text-[10px] font-mono text-[#8A8178] block mt-1">
                  {exam.durationMinutes} min · {exam.totalMarks}M
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Exam Arena & Launch Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Detailed Exam Specification */}
        <div className="lg:col-span-8 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#DDD4C5] pb-4 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#545E4E] font-bold">
              <span>{currentExam.fullTitle}</span>
            </div>
            <h3 className="font-serif text-3xl text-[#1C1917]">{currentExam.name}</h3>
            <p className="text-xs text-[#57524C] leading-relaxed">{currentExam.description}</p>
          </div>

          {/* Exam Rule Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
              <span className="text-[10px] uppercase text-[#8A8178] block">Time Allotted</span>
              <p className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#545E4E]" />
                <span>{currentExam.durationMinutes} Minutes</span>
              </p>
              <span className="text-[10px] text-[#57524C]">Standard National Duration</span>
            </div>

            <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
              <span className="text-[10px] uppercase text-[#8A8178] block">Marking Scheme</span>
              <p className="font-serif text-xl font-bold text-emerald-800">
                +{currentExam.markingScheme.correct} / {currentExam.markingScheme.incorrect}
              </p>
              <span className="text-[10px] text-[#57524C]">
                {currentExam.markingScheme.incorrect < 0
                  ? "Negative Marking Active"
                  : "Zero Negative Deduction"}
              </span>
            </div>

            <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1">
              <span className="text-[10px] uppercase text-[#8A8178] block">Total Aggregate</span>
              <p className="font-serif text-xl font-bold text-[#1C1917]">
                {currentExam.totalMarks} Marks
              </p>
              <span className="text-[10px] text-[#57524C]">{currentExam.patternSummary.split("·")[0]}</span>
            </div>
          </div>

          {/* Covered Subjects */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#545E4E] font-bold block">
              Core Examination Modules
            </span>
            <div className="flex flex-wrap gap-2">
              {currentExam.subjectsCovered.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-xs font-mono font-medium text-[#1C1917]"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Challenge Launcher & Difficulty Tuning */}
        <div className="lg:col-span-4 bg-[#1B1814] border border-[#2F2922] rounded-sm p-6 text-[#FAF7F2] space-y-6 shadow-md">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8FA184] font-bold">
              Challenge Difficulty Mode
            </span>
            <h4 className="font-serif text-xl text-[#FAF7F2]">Difficulty Calibration</h4>
          </div>

          {/* Difficulty Tiers */}
          <div className="space-y-2">
            {(["Easy", "Medium", "Hard"] as const).map((tier) => {
              const label =
                tier === "Easy"
                  ? "Concept Builder (Easy)"
                  : tier === "Medium"
                  ? "Exam Standard (Medium)"
                  : "National Ranker (Hard)";
              const isSelected = selectedDifficulty === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedDifficulty(tier)}
                  className={`w-full p-3 rounded-sm border text-left transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? "bg-[#2A241E] border-[#8FA184] text-[#FAF7F2] font-bold shadow-sm"
                      : "bg-[#12100E] border-[#3A332A] text-[#A89F93] hover:text-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA184]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[#12100E] border border-[#3A332A] rounded-sm text-[11px] font-mono text-[#A89F93] space-y-1">
            <span className="text-amber-400 font-bold block">Entrance Simulation Notice:</span>
            <p>
              Each session generates a 10-question evaluation tailored to the {currentExam.name} syllabus. Answer selections cannot be altered once finalized.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            className="w-full py-3.5 px-4 bg-[#8FA184] hover:bg-[#A3B897] text-[#12100E] font-mono text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-[#12100E]" />
            <span>Enter Examination Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
