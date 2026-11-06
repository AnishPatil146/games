"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Lightbulb,
} from "lucide-react";
import {
  queryConceptRegistry,
} from "@/lib/junior/concept-library-data";

export function ConceptLibraryHub({
  initialClass = 10,
}: {
  initialClass?: 10 | 11 | 12;
}) {
  const [selectedClass, setSelectedClass] = useState<10 | 11 | 12>(initialClass);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [explanationMode, setExplanationMode] = useState<"simple" | "exam">("simple");

  // Interactive practice answer state
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  const concepts = useMemo(() => {
    return queryConceptRegistry({
      classLevel: selectedClass,
      searchTerm: searchTerm.trim() || undefined,
    });
  }, [selectedClass, searchTerm]);

  const activeConcept = useMemo(() => {
    if (activeConceptId) {
      return concepts.find((c) => c.id === activeConceptId) || concepts[0] || null;
    }
    return concepts[0] || null;
  }, [activeConceptId, concepts]);

  return (
    <div className="space-y-6">
      {/* 1. Masthead */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <Lightbulb className="w-3 h-3" />
                Concept Library
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Modules</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
              Foundational & Exam-Level Concept Library
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Every topic features dual-tier explanations: intuitive beginner analogies to build physical intuition, alongside formal exam-level definitions and scientific rigor.
            </p>
          </div>

          {/* Explanation Mode Selector Pill */}
          <div className="flex rounded border border-[#3A2F28] p-0.5 bg-[#120E0C] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setExplanationMode("simple")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                explanationMode === "simple"
                  ? "bg-[#2A221C] text-emerald-400 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Simple Explanation
            </button>
            <button
              type="button"
              onClick={() => setExplanationMode("exam")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                explanationMode === "exam"
                  ? "bg-[#2A221C] text-amber-400 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Exam-Level Depth
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-[#29221C]">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Academic Level
            </label>
            <div className="flex rounded border border-[#3A2F28] p-0.5 bg-[#120E0C]">
              {([10, 11, 12] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedClass(lvl);
                    setSelectedAnswerKey(null);
                    setShowAnswerFeedback(false);
                  }}
                  className={`flex-1 py-1 text-xs font-mono font-bold rounded transition-colors ${
                    selectedClass === lvl
                      ? "bg-[#2A221C] text-amber-400 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Class {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Search Topics or Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Refraction, Bayes, Discriminant..."
                className="w-full bg-[#120E0C] border border-[#3A2F28] rounded pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Concept Topic Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 px-1 flex items-center justify-between">
            <span>Modules ({concepts.length})</span>
            <span className="text-[10px] text-amber-400">Class {selectedClass}</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {concepts.map((c) => {
              const isSelected = activeConcept?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveConceptId(c.id);
                    setSelectedAnswerKey(null);
                    setShowAnswerFeedback(false);
                  }}
                  className={`w-full text-left p-3.5 rounded border transition-all ${
                    isSelected
                      ? "bg-[#251E1A] border-amber-500/70 shadow-md ring-1 ring-amber-500/30"
                      : "bg-[#181412] border-[#2A221D] hover:border-zinc-600 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#100D0B] text-emerald-400 border border-emerald-500/20">
                      {c.subjectName}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{c.chapterTitle}</span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#FAF7F2] line-clamp-1">
                    {c.conceptTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {c.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Concept Viewer */}
        <div className="lg:col-span-8">
          {activeConcept ? (
            <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="border-b border-[#28211C] pb-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1">
                  Class {activeConcept.classLevel} · {activeConcept.subjectName} · {activeConcept.chapterTitle}
                </div>
                <h3 className="text-xl font-serif font-bold text-[#FAF7F2]">
                  {activeConcept.conceptTitle}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">{activeConcept.tagline}</p>
              </div>

              {/* Active Explanation Panel */}
              <div
                className={`p-5 rounded-lg border transition-all ${
                  explanationMode === "simple"
                    ? "bg-[#17221A] border-emerald-500/40"
                    : "bg-[#221A15] border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                      explanationMode === "simple"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-950 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {explanationMode === "simple"
                      ? "Beginner-Friendly Conceptual Analogy"
                      : "Official Curriculum Exam-Level Exposition"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#FAF7F2]">
                  {explanationMode === "simple"
                    ? activeConcept.simpleExplanation
                    : activeConcept.examLevelExplanation}
                </p>
              </div>

              {/* Prerequisites & Definitions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prerequisites */}
                <div className="bg-[#181310] border border-[#2E241E] rounded p-4 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Prerequisites & Prior Knowledge
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                    {activeConcept.prerequisites.map((prereq, idx) => (
                      <li key={idx}>{prereq}</li>
                    ))}
                  </ul>
                </div>

                {/* Important Principles */}
                <div className="bg-[#181310] border border-[#2E241E] rounded p-4 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                    Core Axioms & Principles
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                    {activeConcept.importantPrinciples.map((prin, idx) => (
                      <li key={idx}>{prin}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Definitions Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Authoritative Definitions
                </span>
                <div className="border border-[#2B221B] rounded overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody className="divide-y divide-[#241C16]">
                      {activeConcept.keyDefinitions.map((d, idx) => (
                        <tr key={idx} className="hover:bg-[#1B1512]">
                          <td className="py-2.5 px-3 font-bold text-amber-300 w-1/3 align-top">
                            {d.term}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 leading-relaxed">
                            {d.definition}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Misconceptions */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold block">
                  Frequent Student Traps & Misconceptions
                </span>
                <div className="space-y-2">
                  {activeConcept.misconceptions.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1F1514] border border-[#48221F] rounded p-3 text-xs space-y-1"
                    >
                      <div className="text-rose-300 font-bold">
                        ⚠️ Misconception: {m.trap}
                      </div>
                      <div className="text-emerald-300/90 pl-4 border-l-2 border-emerald-500/50">
                        ✓ Scientific Reality: {m.truth}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check-for-Understanding Practice Question */}
              <div className="bg-[#191512] border border-[#382E27] rounded-md p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Check for Understanding
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">1-Minute Concept Check</span>
                </div>
                <div className="text-xs font-medium text-[#FAF7F2] leading-relaxed">
                  {activeConcept.practiceQuestion.questionText}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {activeConcept.practiceQuestion.options.map((opt) => {
                    const isSelected = selectedAnswerKey === opt.key;
                    const isCorrect = opt.key === activeConcept.practiceQuestion.correctKey;

                    let btnStyle = "bg-[#120E0C] border-[#2C241E] text-zinc-300 hover:border-zinc-500";
                    if (showAnswerFeedback) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-950/80 border-rose-500 text-rose-300";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-[#29211C] border-amber-500 text-amber-300";
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setSelectedAnswerKey(opt.key);
                          setShowAnswerFeedback(true);
                        }}
                        className={`text-left p-2.5 rounded border text-xs font-mono transition-all flex items-center gap-2 ${btnStyle}`}
                      >
                        <span className="font-bold opacity-75">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {showAnswerFeedback && (
                  <div className="mt-3 p-3 bg-[#130F0D] border border-[#2B221B] rounded text-xs font-mono text-zinc-300">
                    <span className="font-bold text-emerald-400">Explanation: </span>
                    {activeConcept.practiceQuestion.explanation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-[#15110F] border border-[#2F2722] rounded-md">
              Select a module from the left to inspect concept explanations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
