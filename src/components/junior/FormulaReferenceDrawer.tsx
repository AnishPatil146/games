"use client";

import { useState } from "react";
import { BookOpen, Search, X, Copy, Check, Lightbulb } from "lucide-react";
import { FORMULA_REFERENCE_CATALOGUE, FormulaReferenceItem } from "@/lib/junior/academy-models";
import { MathRenderer } from "@/components/math/MathRenderer";

interface FormulaReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subjectSlug: string;
  subjectName: string;
}

export function FormulaReferenceDrawer({
  isOpen,
  onClose,
  subjectSlug,
  subjectName,
}: FormulaReferenceDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter formulas by subject and search term
  const relevantFormulas = FORMULA_REFERENCE_CATALOGUE.filter((f) => {
    const matchesSubject = f.subjectSlug === subjectSlug || f.subjectSlug.split("-")[0] === subjectSlug.split("-")[0];
    if (!searchQuery.trim()) return matchesSubject;
    const q = searchQuery.toLowerCase();
    return (
      (matchesSubject || q.length > 2) &&
      (f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.latexFormula.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q))
    );
  });

  const handleCopyFormula = (id: string, formula: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(formula);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Formula & Reference Theorem Drawer"
    >
      <div className="w-full max-w-lg h-full bg-[#1A1715] text-[#FAF7F2] border-l border-[#352F29] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C2621] flex items-center justify-between bg-[#151311]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#545E4E]/20 border border-[#545E4E]/50 flex items-center justify-center text-[#8FA184]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
                Formula &amp; Reference Drawer
              </h3>
              <p className="text-[11px] text-[#A89F93] font-mono">
                {subjectName} · Reference Compendium
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8A8178] hover:text-[#FAF7F2] hover:bg-[#26211C] rounded-sm transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-[#2C2621] bg-[#171412]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" />
            <input
              type="text"
              placeholder="Search theorems, formulas, identities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12100E] border border-[#2F2923] focus:border-[#8FA184] rounded-sm pl-9 pr-3 py-1.5 text-xs text-[#FAF7F2] placeholder-[#70685F] outline-none font-mono"
            />
          </div>
        </div>

        {/* Formula Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {relevantFormulas.length === 0 ? (
            <div className="text-center py-12 text-[#8A8178] space-y-2">
              <Lightbulb className="w-8 h-8 mx-auto text-[#545E4E]" />
              <p className="text-sm">No formulas found for this search.</p>
              <p className="text-xs text-[#70685F]">
                Try searching general mathematical or scientific keywords.
              </p>
            </div>
          ) : (
            relevantFormulas.map((f: FormulaReferenceItem) => (
              <div
                key={f.id}
                className="bg-[#201D1A] border border-[#332C26] rounded-sm p-4 space-y-3 hover:border-[#545E4E] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-[#2B2520] border border-[#3E352D] text-[#8FA184]">
                      {f.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#FAF7F2]">
                      {f.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyFormula(f.id, f.latexFormula)}
                    className="text-[#8A8178] hover:text-[#FAF7F2] p-1 transition-colors"
                    title="Copy LaTeX Formula"
                  >
                    {copiedId === f.id ? (
                      <Check className="w-3.5 h-3.5 text-[#8FA184]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* KaTeX Formula Display */}
                <div className="p-3 rounded-xs bg-[#151311] border border-[#29231D] overflow-x-auto text-center">
                  <MathRenderer content={`$$${f.latexFormula}$$`} />
                </div>

                <p className="text-xs text-[#C8BFB4] leading-relaxed">
                  <MathRenderer content={f.explanation} />
                </p>

                <div className="text-[11px] text-[#A89F93] italic bg-[#181513] border-l-2 border-[#545E4E] pl-2 py-1">
                  Applicability: {f.applicabilityNote}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2C2621] bg-[#12100E] text-center text-[11px] text-[#70685F] font-mono">
          THE ACADEMY · Reference Compendium v2.0
        </div>
      </div>
    </div>
  );
}

