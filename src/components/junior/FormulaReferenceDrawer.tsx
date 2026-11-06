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
      <div className="w-full max-w-lg h-full bg-[#1C1814] text-[#FAF7F2] border-l-2 border-[#4E4133] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#3D3328] flex items-center justify-between bg-[#161310]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A3F30] border-2 border-[#8FA184] flex items-center justify-center text-[#A8D49E] shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base text-white">
                Formula &amp; Reference Drawer
              </h3>
              <p className="text-xs text-[#DDD4C5] font-mono font-semibold">
                {subjectName} · Reference Compendium
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#DDD4C5] hover:text-white hover:bg-[#2A231C] rounded-sm transition-colors border border-[#4E4133]"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 sm:p-4 border-b-2 border-[#3D3328] bg-[#1E1915]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#DDD4C5]" />
            <input
              type="text"
              placeholder="Search theorems, formulas, identities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161310] border-2 border-[#4E4133] focus:border-[#8FA184] rounded-sm pl-9 pr-3 py-2 text-xs text-white placeholder-[#A89F93] outline-none font-mono font-medium"
            />
          </div>
        </div>

        {/* Formula Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {relevantFormulas.length === 0 ? (
            <div className="text-center py-12 text-[#DDD4C5] space-y-2">
              <Lightbulb className="w-10 h-10 mx-auto text-[#8FA184]" />
              <p className="text-sm font-semibold text-white">No formulas found for this search.</p>
              <p className="text-xs text-[#DDD4C5]">
                Try searching general mathematical or scientific keywords.
              </p>
            </div>
          ) : (
            relevantFormulas.map((f: FormulaReferenceItem) => (
              <div
                key={f.id}
                className="bg-[#241F1A] border-2 border-[#4E4133] rounded-md p-4 sm:p-5 space-y-3 hover:border-[#8FA184] transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-[#22402F] border border-[#3F6E51] text-[#9FE3B5] font-black">
                      {f.category}
                    </span>
                    <h4 className="font-serif font-black text-sm sm:text-base text-white">
                      {f.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyFormula(f.id, f.latexFormula)}
                    className="text-[#DDD4C5] hover:text-white p-1.5 transition-colors bg-[#1A1613] rounded border border-[#44382C] hover:border-white"
                    title="Copy LaTeX Formula"
                  >
                    {copiedId === f.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* KaTeX Formula Display */}
                <div className="p-3.5 rounded-sm bg-[#161310] border-2 border-[#3D3328] overflow-x-auto text-center text-white text-base">
                  <MathRenderer content={`$$${f.latexFormula}$$`} />
                </div>

                <p className="text-xs sm:text-sm text-white leading-relaxed font-sans">
                  <MathRenderer content={f.explanation} />
                </p>

                <div className="text-xs text-[#DDD4C5] italic bg-[#1A1613] border-l-2 border-[#8FA184] pl-3 py-1.5 rounded-r-xs">
                  <strong className="text-white not-italic mr-1">Applicability:</strong> {f.applicabilityNote}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-[#3D3328] bg-[#161310] text-center text-xs text-[#DDD4C5] font-mono font-medium">
          THE ACADEMY · Reference Compendium v2.0
        </div>
      </div>
    </div>
  );
}

