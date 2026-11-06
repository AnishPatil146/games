"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Play,
} from "lucide-react";
import { AcademicStreamConfig, AcademicSubjectConfig, StreamSlug } from "@/lib/platform-types";

interface EnrichedSubject extends AcademicSubjectConfig {
  publishedQuestionCount: number;
  participantProgress?: {
    completedQuestionsCount: number;
    attemptsCompleted: number;
    bestScoreOutOf10: number | null;
  };
}

interface BoardPrepHubProps {
  selectedClass: 11 | 12;
  onClassChange: (c: 11 | 12) => void;
  selectedStream: StreamSlug;
  onStreamChange: (s: StreamSlug) => void;
  streams: AcademicStreamConfig[];
  subjects: EnrichedSubject[];
  onStartSubjectPractice: (subjectSlug: string) => void;
}

export function BoardPrepHub({
  selectedClass,
  onClassChange,
  selectedStream,
  onStreamChange,
  streams,
  subjects,
  onStartSubjectPractice,
}: BoardPrepHubProps) {
  const [activeSubjectSlug, setActiveSubjectSlug] = useState<string>(
    subjects[0]?.slug || ""
  );

  const currentSubject =
    subjects.find((s) => s.slug === activeSubjectSlug) || subjects[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead & Board Identity with Grand Library Background */}
      <div className="bg-[#1B1814] border border-[#2F2922] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg min-h-[220px]">
        <Image
          src="/art/environments/env_junior_grand_library.jpg"
          alt="Academy Grand Library"
          fill
          className="object-cover object-center filter brightness-[0.25] contrast-[1.15] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1814] via-[#1B1814]/75 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>State Board &amp; National Secondary Curriculum</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
            Board Examination Preparation Hall
          </h2>
          <p className="text-sm text-[#A89F93] leading-relaxed">
            Master the official textbook syllabus with comprehensive chapter structures, core concept breakdowns, step-by-step solved models, and board-pattern question banks.
          </p>

          {/* Class & Stream Controls */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {/* Class Switcher */}
            <div className="inline-flex p-1 bg-[#12100E] border border-[#3A332A] rounded-sm">
              <button
                type="button"
                onClick={() => onClassChange(11)}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  selectedClass === 11
                    ? "bg-[#2A241E] text-[#FAF7F2] font-bold shadow-sm"
                    : "text-[#8A8178] hover:text-[#FAF7F2]"
                }`}
              >
                Class 11 (FYJC) · Full Syllabus
              </button>
              <button
                type="button"
                onClick={() => onClassChange(12)}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  selectedClass === 12
                    ? "bg-[#2A241E] text-[#FAF7F2] font-bold shadow-sm"
                    : "text-[#8A8178] hover:text-[#FAF7F2]"
                }`}
              >
                Class 12 (HSC) · Pre-Board Mode
              </button>
            </div>

            {/* Stream Selector Chips */}
            <div className="flex items-center gap-1.5">
              {streams.map((st) => (
                <button
                  key={st.slug}
                  type="button"
                  onClick={() => onStreamChange(st.slug)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
                    selectedStream === st.slug
                      ? "bg-[#8FA184]/20 border border-[#8FA184] text-[#FAF7F2] font-bold"
                      : "bg-[#12100E] border border-[#2E2822] text-[#A89F93] hover:text-[#FAF7F2]"
                  }`}
                >
                  {st.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none select-none text-[#DDD4C5]">
          <GraduationCap className="w-80 h-80" />
        </div>
      </div>

      {/* 2. Subject Selection & Chapter Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Subjects Carousel / List */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#545E4E] font-bold">
            Curriculum Subjects ({subjects.length})
          </p>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {subjects.map((subj) => {
              const isSelected = subj.slug === (currentSubject?.slug || activeSubjectSlug);
              return (
                <div
                  key={subj.slug}
                  onClick={() => setActiveSubjectSlug(subj.slug)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B1814] border-[#8FA184] text-[#FAF7F2] shadow-md"
                      : "bg-[#FAF7F2] border-[#DDD4C5] text-[#1C1917] hover:bg-[#F3EDE2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${
                          isSelected ? "text-[#8FA184]" : "text-[#545E4E]"
                        }`}
                      >
                        Code {subj.code || "STD"} · {subj.chapters.length} Chapters
                      </span>
                      <h3 className="font-serif text-base font-bold leading-snug">
                        {subj.name}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#8FA184] mt-1 shrink-0" />
                    )}
                  </div>

                  <p
                    className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                      isSelected ? "text-[#A89F93]" : "text-[#57524C]"
                    }`}
                  >
                    {subj.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className={isSelected ? "text-[#8FA184]" : "text-[#545E4E]"}>
                      {subj.publishedQuestionCount} Board MCQs
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      View Chapters <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Chapter Roadmap & Launch Pad */}
        <div className="lg:col-span-8 space-y-6">
          {currentSubject && (
            <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Subject Title Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD4C5] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#545E4E] font-bold">
                    Subject Syllabus Master Plan
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917] mt-1">
                    {currentSubject.name}
                  </h3>
                  <p className="text-xs text-[#57524C] mt-1 max-w-xl">
                    {currentSubject.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onStartSubjectPractice(currentSubject.slug)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#1C1917] hover:bg-[#2E2925] text-[#FAF7F2] font-mono text-xs uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>Launch Practice Arena (10 Qs)</span>
                </button>
              </div>

              {/* Chapters Syllabus Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#57524C]">
                  <span>Chapters &amp; Core Topics ({currentSubject.chapters.length})</span>
                  <span className="text-emerald-700 font-bold">State Board &amp; NCERT Verified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {currentSubject.chapters.map((ch) => (
                    <div
                      key={ch.number}
                      className="p-3.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm flex items-start gap-3 hover:border-[#8A8178] transition-colors"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1C1917] text-[#FAF7F2] font-mono text-xs font-bold shrink-0">
                        {ch.number}
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-semibold text-[#1C1917] leading-snug">
                          {ch.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#8A8178] block">
                          Core Theory · Key Definitions · Numerical Practice
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Board Study Strategy Callout */}
              <div className="p-4 bg-[#F3EDE2] border-l-4 border-[#545E4E] rounded-sm text-xs text-[#57524C] space-y-1.5 leading-relaxed">
                <span className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#545E4E]" />
                  <span>Exam Preparation Protocol:</span>
                </span>
                <p>
                  Complete questions in cycles of 10. The system guarantees <strong>zero repeated questions</strong> across 10 consecutive attempts (100 distinct questions) before cycling, ensuring complete chapter coverage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
