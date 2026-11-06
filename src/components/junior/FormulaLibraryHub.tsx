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
} from "lucide-react";
import { MathRenderer } from "@/components/math/MathRenderer";
import {
  queryFormulaRegistry,
} from "@/lib/junior/formula-library-data";

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

  return (
    <div className="space-y-6">
      {/* 1. Masthead & Filter Bar */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-950/60 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-3 h-3" />
                Formula Library
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Registry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
              Official Mathematical & Scientific Formula Library
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Every formula record specifies mathematical notation, symbol definitions with SI units, conditions of applicability, derivations, and worked numerical examples.
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
                ? "bg-amber-600 text-black font-bold border-amber-400 shadow-md"
                : "bg-[#251E1A] text-zinc-300 hover:text-white border-[#3B3029]"
            }`}
          >
            {recallMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{recallMode ? "Recall Mode Active (Formulas Hidden)" : "Enable Formula Recall Mode"}</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#29221C]">
          {/* Class Level Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Academic Level
            </label>
            <div className="flex rounded border border-[#3A2F28] p-0.5 bg-[#120E0C]">
              {([10, 11, 12] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedClass(lvl)}
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

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#120E0C] border border-[#3A2F28] rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Subjects</option>
              {selectedClass === 10 ? (
                <>
                  <option value="c10-math-standard">Mathematics Standard</option>
                  <option value="c10-science">Science</option>
                </>
              ) : (
                <>
                  <option value="c12-physics">Physics</option>
                  <option value="c12-mathematics">Mathematics</option>
                  <option value="com-accountancy">Accountancy</option>
                </>
              )}
            </select>
          </div>

          {/* Exam Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Examination Track
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-[#120E0C] border border-[#3A2F28] rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Target Exams</option>
              <option value="Board">Board Examination</option>
              <option value="JEE">JEE Main & Advanced</option>
              <option value="NEET">NEET UG</option>
              <option value="MHT-CET">MHT-CET</option>
              <option value="CUET">CUET UG</option>
              <option value="Foundation">Class 10 Foundation</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Search by Keyword or Symbol
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Coulomb, Snell, Quadratic..."
                className="w-full bg-[#120E0C] border border-[#3A2F28] rounded pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Layout: Formula Master-Detail Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Formula Catalogue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 px-1 flex items-center justify-between">
            <span>Formulas Found ({formulas.length})</span>
            <span className="text-[10px] text-amber-400">Class {selectedClass}</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {formulas.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-[#161210] border border-[#2D231C] rounded">
                No formulas match the current filters.
              </div>
            ) : (
              formulas.map((item) => {
                const isSelected = activeFormula?.id === item.id;
                const isBookmarked = bookmarkedIds.has(item.id);
                const isConcealed = recallMode && !revealedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveFormulaId(item.id)}
                    className={`p-3.5 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#251E1A] border-amber-500/70 shadow-md ring-1 ring-amber-500/30"
                        : "bg-[#181412] border-[#2A221D] hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#100D0B] text-amber-400 border border-amber-500/20">
                        {item.subjectName} · {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(item.id);
                        }}
                        className="text-zinc-500 hover:text-amber-400 transition-colors"
                        title="Bookmark formula"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#FAF7F2] line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-mono text-zinc-400 mb-2">
                      {item.chapterTitle} → {item.topicTitle}
                    </div>

                    {/* Formula Snippet Preview */}
                    <div className="bg-[#0D0A09] border border-[#231A15] rounded p-2 text-center my-1.5 overflow-x-auto">
                      {isConcealed ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReveal(item.id);
                          }}
                          className="text-xs font-mono text-amber-400/80 hover:text-amber-300 underline py-1"
                        >
                          [Concealed in Recall Mode — Click to Reveal]
                        </button>
                      ) : (
                        <MathRenderer content={item.latexExpression} className="text-amber-300 text-sm" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
                      <span>Unit: {item.outputUnit}</span>
                      <span
                        className={`font-bold ${
                          item.difficulty === "Easy"
                            ? "text-emerald-400"
                            : item.difficulty === "Medium"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Full Detail Record Inspector */}
        <div className="lg:col-span-7">
          {activeFormula ? (
            <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-6 shadow-xl space-y-6">
              {/* Record Masthead */}
              <div className="border-b border-[#28211C] pb-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
                    Class {activeFormula.classLevel} · {activeFormula.subjectName} · {activeFormula.category}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    Syllabus: {activeFormula.syllabusReference}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#FAF7F2] mt-1">
                  {activeFormula.name}
                </h3>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  Chapter: {activeFormula.chapterTitle} · Topic: {activeFormula.topicTitle}
                </div>
              </div>

              {/* 1. Mathematical Notation Card */}
              <div className="bg-[#0B0908] border border-[#2D231C] rounded-lg p-5 text-center shadow-inner relative">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                  Mathematical Expression & Governing Equation
                </div>
                {recallMode && !revealedIds.has(activeFormula.id) ? (
                  <div className="py-4 space-y-2">
                    <p className="text-xs font-mono text-amber-300">
                      Formula Concealed for Active Recall Practice
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleReveal(activeFormula.id)}
                      className="px-3 py-1.5 rounded bg-amber-500 text-black font-mono font-bold text-xs"
                    >
                      Reveal Formula Expression
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto py-2">
                    <MathRenderer
                      content={activeFormula.latexExpression}
                      className="text-amber-300 text-lg font-bold"
                    />
                  </div>
                )}
                <div className="text-[11px] font-mono text-zinc-400 mt-2">
                  Master Output SI Unit:{" "}
                  <span className="text-emerald-400 font-bold">{activeFormula.outputUnit}</span>
                </div>
              </div>

              {/* 2. Comprehensive Symbol Definitions Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Symbol Definitions & Measurement Dimensions
                </span>
                <div className="border border-[#2B221B] rounded overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#1C1613] text-zinc-400 border-b border-[#2B221B]">
                      <tr>
                        <th className="py-2 px-3">Symbol</th>
                        <th className="py-2 px-3">Physical Meaning</th>
                        <th className="py-2 px-3">SI Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241C16]">
                      {activeFormula.symbols.map((sym, idx) => (
                        <tr key={idx} className="hover:bg-[#1B1512]">
                          <td className="py-2 px-3 font-bold text-amber-300">
                            {sym.symbol}
                          </td>
                          <td className="py-2 px-3 text-zinc-300">{sym.meaning}</td>
                          <td className="py-2 px-3 text-emerald-400">{sym.siUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Conditions of Applicability */}
              <div className="bg-[#181310] border border-[#2E241E] rounded p-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Conditions of Applicability & Assumptions
                </span>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  {activeFormula.applicabilityConditions.map((cond, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Derivation Rationale (if present) */}
              {activeFormula.derivationSummary && (
                <div className="space-y-1 text-xs">
                  <span className="font-mono uppercase tracking-wider text-zinc-400 font-bold block text-[11px]">
                    Derivation Rationale
                  </span>
                  <p className="text-zinc-300 leading-relaxed bg-[#130F0D] p-3 rounded border border-[#261E19]">
                    {activeFormula.derivationSummary}
                  </p>
                </div>
              )}

              {/* 5. Solved Numerical Example */}
              <div className="bg-[#1A1512] border border-[#3A2E26] rounded-md p-4 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Authoritative Solved Numerical Example
                </span>
                <div className="text-xs font-medium text-[#FAF7F2] leading-relaxed">
                  {activeFormula.solvedExample.problemStatement}
                </div>
                <div className="bg-[#100D0B] border border-[#251D18] rounded p-3 text-xs font-mono space-y-1.5">
                  <div className="text-zinc-400 text-[10px] uppercase">Step-by-Step Working:</div>
                  {activeFormula.solvedExample.stepByStepSolution.map((step, idx) => (
                    <div key={idx} className="text-zinc-300 leading-relaxed">
                      {idx + 1}. {step}
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#251D18] text-amber-400 font-bold">
                    Result: {activeFormula.solvedExample.finalAnswer}
                  </div>
                </div>
              </div>

              {/* 6. High-Frequency Student Mistakes */}
              <div className="bg-[#211514] border border-[#4A2522] rounded p-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Common Examination Mistakes to Avoid
                </span>
                <ul className="text-xs text-rose-200/90 space-y-1 list-disc list-inside">
                  {activeFormula.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-[#15110F] border border-[#2F2722] rounded-md">
              Select a formula from the catalogue to inspect its complete specification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
