"use client";

import { useState } from "react";
import { Award, Search, Copy, Check, Sparkles } from "lucide-react";
import { FORMULA_REFERENCE_CATALOGUE } from "@/lib/junior/academy-models";
import { MathRenderer } from "@/components/math/MathRenderer";

export function RevisionCentre() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Subjects" },
    { id: "Mechanics", label: "Physics Mechanics" },
    { id: "Gravitation", label: "Gravitation" },
    { id: "Optics & Waves", label: "Optics & Waves" },
    { id: "Trigonometry", label: "Mathematics Trigonometry" },
    { id: "Calculus", label: "Calculus & Derivatives" },
    { id: "Physical Chemistry", label: "Physical Chemistry" },
    { id: "Double-Entry Book-Keeping", label: "Accounting Equations" },
  ];

  const filteredItems = FORMULA_REFERENCE_CATALOGUE.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyFormula = (id: string, formula: string) => {
    void navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead */}
      <div className="bg-[#181512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184]">
            <Award className="w-3.5 h-3.5" />
            <span>Master Formula, Theorem &amp; Concept Library</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
            Academy Revision Centre
          </h2>
          <p className="text-sm text-[#A89F93] leading-relaxed">
            Instant mathematical formula reference, physical laws, reaction principles, and double-entry rules. Typeset with full LaTeX mathematical precision for rapid recall before examinations.
          </p>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#1C1917] text-[#FAF7F2] font-bold shadow-sm"
                  : "bg-[#FAF7F2] border border-[#DDD4C5] text-[#57524C] hover:bg-[#F3EDE2]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas or laws..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] placeholder:text-[#8A8178] focus:outline-none focus:border-[#1C1917] font-mono"
          />
        </div>
      </div>

      {/* 3. Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4 shadow-sm hover:border-[#8A8178] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#DDD4C5] pb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#545E4E] font-bold">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyFormula(item.id, item.latexFormula)}
                  className="p-1 text-[#8A8178] hover:text-[#1C1917] transition-colors cursor-pointer"
                  title="Copy LaTeX Formula"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                {item.title}
              </h3>

              {/* Typeset LaTeX Formula Canvas */}
              <div className="p-4 bg-white border border-[#E5DEC9] rounded-sm text-center overflow-x-auto shadow-inner">
                <MathRenderer text={`$$${item.latexFormula}$$`} />
              </div>

              <p className="text-xs text-[#57524C] leading-relaxed">
                <MathRenderer text={item.explanation} />
              </p>
            </div>

            {/* Applicability Condition */}
            <div className="mt-3 pt-3 border-t border-[#DDD4C5] text-[11px] font-mono text-[#8A8178] flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#545E4E] shrink-0 mt-0.5" />
              <span>Constraint: {item.applicabilityNote}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
