"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  HelpCircle,
  Calculator,
  Compass,
} from "lucide-react";
import { FormulaRenderer } from "@/components/math/FormulaRenderer";
import {
  queryFormulaRegistry,
  AcademicFormulaRecord,
} from "@/lib/junior/formula-library-data";
import {
  evaluateFormulaDimensions,
  computeFormulaExplorerOutput,
  FormulaDimension,
} from "@/lib/junior/formula-intelligence-engine";

export function FormulaLibraryHub({
  initialClass = 10,
}: {
  initialClass?: 10 | 11 | 12;
}) {
  const [selectedClass, setSelectedClass] = useState<10 | 11 | 12>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [recallMode, setRecallMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [activeFormulaId, setActiveFormulaId] = useState<string | null>(null);

  // Active View Mode: Specification vs Interactive Explorer
  const [viewMode, setViewMode] = useState<"spec" | "explorer" | "mastery">("spec");

  // Dynamic parameters for Formula Explorer
  const [explorerParams, setExplorerParams] = useState<Record<string, number>>({
    u: 5,
    a: 9.8,
    t: 3,
    m: 10,
    I: 2.5,
    R: 12,
    b: -5,
    c: 6,
    n: 1.5,
    T: 300,
    V: 0.025,
  });

  const handleParamChange = (key: string, val: number) => {
    setExplorerParams((prev) => ({ ...prev, [key]: val }));
  };

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle reveal in recall mode
  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter formulas
  const formulas = useMemo(() => {
    return queryFormulaRegistry({
      classLevel: selectedClass,
      subjectSlug: selectedSubject === "all" ? undefined : selectedSubject,
      examTrack: selectedExam === "all" ? undefined : selectedExam,
      searchTerm: searchTerm.trim() || undefined,
    });
  }, [selectedClass, selectedSubject, selectedExam, searchTerm]);

  const activeFormula = useMemo(() => {
    if (activeFormulaId) {
      return formulas.find((f) => f.id === activeFormulaId) || formulas[0] || null;
    }
    return formulas[0] || null;
  }, [activeFormulaId, formulas]);

  // Compute 4-Dimension Mastery Report for the active formula
  const masteryReport = useMemo(() => {
    if (!activeFormula) return null;
    return evaluateFormulaDimensions(
      activeFormula.id,
      activeFormula.name,
      activeFormula.latexExpression,
      activeFormula.subjectSlug,
      activeFormula.classLevel,
      [
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: false, errorType: "WRONG_UNIT" },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: false, errorType: "MISAPPLIED_FORMULA" },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: false, errorType: "SIGN_ERROR" },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: false, errorType: "WRONG_SUBSTITUTION" },
      ]
    );
  }, [activeFormula]);

  // Compute interactive Explorer output
  const explorerOutput = useMemo(() => {
    if (!activeFormula) return null;
    return computeFormulaExplorerOutput(activeFormula.id, explorerParams);
  }, [activeFormula, explorerParams]);

  return (
    <div className="space-y-6">
      {/* 1. Masthead & Filter Bar */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-950/60 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-3 h-3" />
                FORMULA INTELLIGENCE &amp; EXPLORER
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Registry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
              Official Mathematical &amp; Scientific Formula Library
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              KaTeX typeset equations, 17-field academic specifications, symbol SI units, derivations, and an interactive Formula Explorer for real-time numerical parameter testing.
            </p>
          </div>

          {/* Recall Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setRecallMode(!recallMode);
              setRevealedIds(new Set());
            }}
            className={`px-3.5 py-2 rounded text-xs font-mono tracking-wider flex items-center gap-2 transition-all self-start md:self-auto border ${
              recallMode
                ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md ring-2 ring-amber-400/40"
                : "bg-[#221D1A] text-zinc-300 hover:text-white border-[#3A3029]"
            }`}
          >
            {recallMode ? <EyeOff className="w-4 h-4 text-black" /> : <Eye className="w-4 h-4 text-amber-400" />}
            <span>{recallMode ? "RECALL MODE ACTIVE" : "ACTIVATE RECALL MODE"}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs font-mono">
          {/* Class Selector */}
          <div>
            <label className="block text-[10px] uppercase text-zinc-400 mb-1">Academic Level</label>
            <div className="flex gap-1.5 bg-[#120F0D] p-1 rounded border border-[#2F2722]">
              {[10, 11, 12].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedClass(lvl as 10 | 11 | 12)}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    selectedClass === lvl
                      ? "bg-amber-500 text-black font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Class {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Filter */}
          <div>
            <label className="block text-[10px] uppercase text-zinc-400 mb-1">Exam Track</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-[#120F0D] text-zinc-200 border border-[#2F2722] rounded p-2 focus:outline-none"
            >
              <option value="all">All Examinations</option>
              <option value="Board">CBSE / State Board</option>
              <option value="JEE">JEE Main &amp; Advanced</option>
              <option value="NEET">NEET UG</option>
              <option value="MHT-CET">MHT-CET</option>
              <option value="CUET">CUET UG</option>
              <option value="Foundation">Foundation</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] uppercase text-zinc-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#120F0D] text-zinc-200 border border-[#2F2722] rounded p-2 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="c10-math-standard">Mathematics Standard (041)</option>
              <option value="c10-math-basic">Mathematics Basic (241)</option>
              <option value="c10-science">Science (Physics/Chem)</option>
              <option value="physics">Physics (Class 11/12)</option>
              <option value="chemistry">Chemistry (Class 11/12)</option>
              <option value="mathematics">Mathematics (Class 11/12)</option>
              <option value="accountancy">Accountancy</option>
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[10px] uppercase text-zinc-400 mb-1">Search Formula or Symbol</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Quadratic, Ohm, Lens..."
                className="w-full bg-[#120F0D] text-zinc-200 border border-[#2F2722] rounded pl-8 pr-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Formula Roster List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>Verified Formulas ({formulas.length})</span>
            <span>Class {selectedClass}</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {formulas.map((item) => {
              const isSelected = activeFormula?.id === item.id;
              const isBookmarked = bookmarkedIds.has(item.id);
              const isRevealed = revealedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveFormulaId(item.id)}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#2A221C] border-[#8FA184] shadow-md ring-1 ring-[#8FA184]/40"
                      : "bg-[#161210] border-[#2B231D] hover:bg-[#1E1815] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="uppercase tracking-wider text-[#C8B28E] font-bold">
                      {item.subjectName} · {item.chapterTitle}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(item.id);
                      }}
                      className="text-zinc-500 hover:text-amber-400 transition-colors p-0.5"
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Formula"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h4 className="text-sm font-serif font-bold text-[#FAF7F2] line-clamp-1">
                    {item.name}
                  </h4>

                  {/* Formula Preview Box */}
                  <div className="mt-2 bg-[#0E0B0A] border border-[#231C17] rounded p-2.5 flex items-center justify-center min-h-[44px]">
                    {recallMode && !isRevealed ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReveal(item.id);
                        }}
                        className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>[Recall Hidden: Click to Reveal]</span>
                      </button>
                    ) : (
                      <FormulaRenderer
                        expression={item.latexExpression}
                        className="text-amber-300 text-sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Formula Inspector & Explorer Panel */}
        <div className="lg:col-span-7 space-y-4">
          {activeFormula ? (
            <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 shadow-lg space-y-5">
              {/* Header & Sub-Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A221C] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    Class {activeFormula.classLevel} · {activeFormula.subjectName}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#FAF7F2]">
                    {activeFormula.name}
                  </h3>
                </div>

                {/* Sub-Tab Navigation (Spec vs Explorer vs 4-Dimension Mastery) */}
                <div className="flex bg-[#120F0D] p-1 rounded border border-[#2B231D] text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setViewMode("spec")}
                    className={`px-3 py-1 rounded transition-colors ${
                      viewMode === "spec"
                        ? "bg-[#2B221B] text-[#FAF7F2] font-bold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Specification
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("explorer")}
                    className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                      viewMode === "explorer"
                        ? "bg-amber-500 text-black font-bold shadow-sm"
                        : "text-zinc-400 hover:text-amber-300"
                    }`}
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Explorer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("mastery")}
                    className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                      viewMode === "mastery"
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-zinc-400 hover:text-emerald-300"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>4D Mastery</span>
                  </button>
                </div>
              </div>

              {/* Master Display Box */}
              <div className="bg-[#0C0908] border border-[#2E251E] rounded-md p-4 text-center overflow-x-auto">
                <FormulaRenderer
                  expression={activeFormula.latexExpression}
                  className="text-amber-300 text-lg sm:text-xl"
                />
                <div className="text-[11px] font-mono text-zinc-400 mt-2">
                  Output Dimension: <strong className="text-[#FAF7F2]">{activeFormula.outputUnit}</strong>
                </div>
              </div>

              {/* VIEW MODE 1: ACADEMIC SPECIFICATION */}
              {viewMode === "spec" && (
                <div className="space-y-4">
                  {/* Symbol Definitions Table */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
                      Symbol Definitions &amp; SI Units
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {activeFormula.symbols.map((sym, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded bg-[#130F0D] border border-[#261E18] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-serif italic font-bold text-amber-300 mr-2 text-sm">
                              {sym.symbol}
                            </span>
                            <span className="text-zinc-300 font-sans">{sym.meaning}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                            {sym.siUnit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applicability Conditions */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1.5">
                      Conditions of Applicability
                    </h5>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {activeFormula.applicabilityConditions.map((cond, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Solved Numerical Example */}
                  <div className="p-3.5 rounded bg-[#130F0D] border border-[#2E241E] space-y-2">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2] font-bold">
                      Solved Numerical Example
                    </h5>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {activeFormula.solvedExample.problemStatement}
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400 space-y-1 pt-1 border-t border-[#231C17]">
                      {activeFormula.solvedExample.stepByStepSolution.map((st, stIdx) => (
                        <div key={stIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{st}</span>
                        </div>
                      ))}
                      <div className="pt-1 text-emerald-400 font-bold">
                        Answer: {activeFormula.solvedExample.finalAnswer}
                      </div>
                    </div>
                  </div>

                  {/* Common Pitfalls & Mistakes */}
                  <div className="p-3 rounded bg-amber-950/20 border border-amber-600/30 text-xs space-y-1 text-[#E7DEC8]">
                    <div className="font-mono text-[11px] text-amber-300 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Frequent Examination Mistakes</span>
                    </div>
                    {activeFormula.commonMistakes.map((mis, mIdx) => (
                      <p key={mIdx} className="pl-5 text-zinc-400 font-sans leading-snug">
                        • {mis}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW MODE 2: INTERACTIVE FORMULA EXPLORER */}
              {viewMode === "explorer" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#120F0D] p-3 rounded border border-amber-500/20">
                    <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Vary numerical input parameters to observe real-time scientific calculations and verified step substitutions.
                    </span>
                  </div>

                  {/* Dynamic Parameter Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#130F0D] p-3.5 rounded border border-[#2B231D]">
                    {activeFormula.symbols.map((sym, sIdx) => {
                      const paramKey = sym.symbol.replace(/[^a-zA-Z]/g, "") || "val";
                      const currentVal = explorerParams[paramKey] ?? 10;
                      return (
                        <div key={sIdx} className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-zinc-300 font-serif italic font-bold">
                              {sym.symbol} ({sym.meaning})
                            </span>
                            <span className="text-amber-300 font-bold">
                              {currentVal} {sym.siUnit}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={0.5}
                            value={currentVal}
                            onChange={(e) => handleParamChange(paramKey, parseFloat(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2B211A] rounded"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculated Result Readout */}
                  {explorerOutput && (
                    <div className="p-4 rounded bg-[#100D0B] border border-[#2E241E] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#28201A] pb-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                          {explorerOutput.outputLabel} ({explorerOutput.outputVariable})
                        </span>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          {explorerOutput.formattedOutput}
                        </span>
                      </div>

                      {/* Step-by-Step Mathematical Substitution */}
                      <div className="space-y-1.5 text-xs font-mono text-zinc-300">
                        <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-bold">
                          Step-by-Step Evaluation:
                        </span>
                        {explorerOutput.stepByStepSteps.map((step, stIdx) => (
                          <div key={stIdx} className="pl-2 border-l border-amber-500/30">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW MODE 3: FOUR-DIMENSION FORMULA MASTERY */}
              {viewMode === "mastery" && masteryReport && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#120F0D] border border-emerald-500/30 rounded text-xs leading-relaxed space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Diagnostic Interpretation
                    </span>
                    <p className="text-[#FAF7F2] font-sans">
                      {masteryReport.overallInterpretation}
                    </p>
                  </div>

                  {/* 4 Dimension Matrix Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(masteryReport.dimensions) as FormulaDimension[]).map((dimKey) => {
                      const dim = masteryReport.dimensions[dimKey];
                      const ratingColors = {
                        STRONG: "text-emerald-400 bg-emerald-950/60 border-emerald-500/40",
                        DEVELOPING: "text-amber-400 bg-amber-950/60 border-amber-500/40",
                        NEEDS_IMPROVEMENT: "text-rose-400 bg-rose-950/60 border-rose-500/40",
                        INSUFFICIENT_DATA: "text-zinc-400 bg-zinc-900 border-zinc-700",
                      };

                      return (
                        <div
                          key={dimKey}
                          className="p-3 rounded bg-[#130F0D] border border-[#2B231D] space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-[#FAF7F2]">{dim.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] border uppercase font-bold ${
                                ratingColors[dim.rating]
                              }`}
                            >
                              {dim.rating.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                            <span>Accuracy: <strong className="text-[#FAF7F2]">{dim.accuracyPct}%</strong></span>
                            <span>{dim.attemptsCount} Evaluated Questions</span>
                          </div>

                          <p className="text-[11px] text-zinc-300 font-sans leading-tight">
                            {dim.actionableRecommendation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#181412] border border-[#2F2722] rounded-md p-8 text-center text-zinc-400 font-mono text-xs">
              No formulas matched your search. Select a different class or exam track.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
