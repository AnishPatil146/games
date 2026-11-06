"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  Calculator,
  Network,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import { DIAGRAM_SIMULATION_CATALOGUE, DiagramSimulationSpec } from "@/lib/junior/diagram-lab-data";
import { ACADEMIC_FORMULA_REGISTRY, AcademicFormulaRecord } from "@/lib/junior/formula-library-data";
import { PREREQUISITE_DEPENDENCY_GRAPH } from "@/lib/junior/prerequisite-engine";
import { FormulaRenderer } from "@/components/math/FormulaRenderer";

interface JuniorControlData {
  subjectParticipation: {
    subjectSlug: string;
    subjectName: string;
    stream: string;
    publishedQuestions: number;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
}

export default function AdminJuniorModePage() {
  const [activeTab, setActiveTab] = useState<
    "telemetry" | "visual-studio" | "formulas" | "prerequisites"
  >("telemetry");

  const [subjects, setSubjects] = useState<
    JuniorControlData["subjectParticipation"]
  >([]);
  const [streamFilter, setStreamFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Visual Studio state
  const [visuals, setVisuals] = useState<DiagramSimulationSpec[]>(DIAGRAM_SIMULATION_CATALOGUE);
  const [selectedVisual, setSelectedVisual] = useState<DiagramSimulationSpec>(DIAGRAM_SIMULATION_CATALOGUE[0]);

  // Formula Manager state
  const [formulaSearch, setFormulaSearch] = useState("");
  const [selectedFormula, setSelectedFormula] = useState<AcademicFormulaRecord>(ACADEMIC_FORMULA_REGISTRY[0]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        if (res.ok) {
          const json = (await res.json()) as JuniorControlData;
          if (active) setSubjects(json.subjectParticipation || []);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredSubjects =
    streamFilter === "all"
      ? subjects
      : subjects.filter((s) => s.stream === streamFilter);

  const totalPublished = subjects.reduce(
    (sum, s) => sum + s.publishedQuestions,
    0
  );

  const filteredFormulas = ACADEMIC_FORMULA_REGISTRY.filter(
    (f) =>
      f.name.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      f.latexExpression.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      f.subjectSlug.toLowerCase().includes(formulaSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Academy 3.0 Curriculum Command Centre
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Junior Academy Control &amp; Content Studio
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs uppercase tracking-[0.16em]">
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141210] text-[#FAF7F2] rounded-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage {totalPublished} Questions</span>
          </Link>
          <Link
            href="/admin/subjects"
            className="px-3.5 py-2 bg-[#FAF7F2] border border-[#CFC5B4] text-[#1C1917] rounded-sm"
          >
            Configure Subjects
          </Link>
        </div>
      </header>

      {/* Control Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDD4C5] pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-3.5 py-2 rounded-sm flex items-center gap-2 transition-all ${activeTab === "telemetry"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Subject Bank Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab("visual-studio")}
          className={`px-3.5 py-2 rounded-sm flex items-center gap-2 transition-all ${activeTab === "visual-studio"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
            }`}
        >
          <Eye className="w-4 h-4 text-[#8FA184]" />
          <span>Visual Content Studio ({visuals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("formulas")}
          className={`px-3.5 py-2 rounded-sm flex items-center gap-2 transition-all ${activeTab === "formulas"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
            }`}
        >
          <Calculator className="w-4 h-4 text-[#C8B28E]" />
          <span>Formula Intelligence Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("prerequisites")}
          className={`px-3.5 py-2 rounded-sm flex items-center gap-2 transition-all ${activeTab === "prerequisites"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
            }`}
        >
          <Network className="w-4 h-4 text-[#545E4E]" />
          <span>Prerequisite Dependency Graph</span>
        </button>
      </div>

      {/* TAB 1: SUBJECT BANK TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* Stream Filter */}
          <div className="flex items-center gap-2">
            {["all", "science", "commerce", "arts"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStreamFilter(st)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.16em] rounded-sm border cursor-pointer ${streamFilter === st
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                    : "bg-[#FAF7F2] text-[#57524C] border-[#DDD4C5]"
                  }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#8A8178]">
                Loading Junior Subject Telemetry...
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Stream</th>
                    <th className="py-3 px-4">Published Bank</th>
                    <th className="py-3 px-4">Attempts (Done)</th>
                    <th className="py-3 px-4">Mean Score</th>
                    <th className="py-3 px-4 text-right">Bank Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {filteredSubjects.map((s) => {
                    const healthy = s.publishedQuestions >= 100;
                    return (
                      <tr key={s.subjectSlug} className="hover:bg-[#F3EDE2]/50">
                        <td className="py-3.5 px-4 font-serif text-base text-[#1C1917]">
                          {s.subjectName}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-[#57524C]">
                          {s.stream}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono ${healthy ? "text-[#545E4E]" : "text-[#9E6B68]"
                              }`}
                          >
                            {healthy ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {s.publishedQuestions} / 100
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {s.attempts} ({s.completed})
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {s.avgScore !== null ? `${s.avgScore}/10` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/questions?subject=${encodeURIComponent(
                              s.subjectSlug
                            )}`}
                            className="text-[11px] uppercase tracking-[0.16em] text-[#545E4E] font-medium hover:underline"
                          >
                            Inspect Bank
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL CONTENT STUDIO */}
      {activeTab === "visual-studio" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visuals Catalogue List */}
            <div className="lg:col-span-1 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#545E4E] font-bold block">
                Visual Modules Catalogue ({visuals.length})
              </span>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {visuals.map((spec) => (
                  <div
                    key={spec.id}
                    onClick={() => setSelectedVisual(spec)}
                    className={`p-3 rounded-sm border cursor-pointer transition-all text-xs ${selectedVisual.id === spec.id
                        ? "bg-[#181512] text-[#FAF7F2] border-[#181512]"
                        : "bg-white text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm">
                        {spec.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/10">
                        {spec.domain}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-2 ${selectedVisual.id === spec.id
                          ? "text-[#A89F93]"
                          : "text-[#57524C]"
                        }`}
                    >
                      {spec.subjectName} • {spec.chapterTitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Visual Inspector */}
            <div className="lg:col-span-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-[#DDD4C5] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8FA184] font-bold tracking-wider">
                    {selectedVisual.domain.toUpperCase()} • {selectedVisual.visualType.toUpperCase()}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1C1917] mt-0.5">
                    {selectedVisual.title}
                  </h3>
                  <p className="text-xs text-[#57524C] mt-1 font-mono">
                    Anchor: {selectedVisual.subjectName} • {selectedVisual.chapterTitle}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-mono font-bold">
                  Published &amp; Interactive
                </span>
              </div>

              {/* Explanatory Narrative */}
              <div className="p-4 bg-white border border-[#DDD4C5] rounded space-y-2 text-xs">
                <span className="font-mono text-[10px] uppercase text-[#8A8178] block">
                  Explanatory Pedagogical Narrative:
                </span>
                <p className="font-serif text-sm leading-relaxed text-[#1C1917]">
                  {selectedVisual.description}
                </p>
              </div>

              {/* Parameter Controls Metadata */}
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#1C1917] font-bold block">
                  Configured Interactive Parameters ({selectedVisual.parameters.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {selectedVisual.parameters.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-white border border-[#DDD4C5] rounded space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1C1917]">{p.name} ({p.symbol})</span>
                        <span className="text-[10px] text-[#8A8178]">
                          {p.min} → {p.max} {p.unit}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#545E4E] block">
                        Default: {p.defaultValue} {p.unit} (step {p.step})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Check Questions */}
              {selectedVisual.knowledgeCheck && (
                <div className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded space-y-2 text-xs">
                  <span className="font-mono text-[10px] uppercase text-[#545E4E] font-bold block">
                    Integrated Knowledge Check Quiz:
                  </span>
                  <p className="font-serif text-sm font-semibold text-[#1C1917]">
                    {selectedVisual.knowledgeCheck.question}
                  </p>
                  <p className="text-[11px] text-[#545E4E] pt-1">
                    <strong>Explanation:</strong> {selectedVisual.knowledgeCheck.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORMULA INTELLIGENCE STUDIO */}
      {activeTab === "formulas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formula Registry Search & List */}
            <div className="lg:col-span-1 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8178]" />
                <input
                  type="text"
                  value={formulaSearch}
                  onChange={(e) => setFormulaSearch(e.target.value)}
                  placeholder="Search formulas or LaTeX..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredFormulas.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFormula(f)}
                    className={`p-3 rounded-sm border cursor-pointer transition-all text-xs ${selectedFormula.id === f.id
                        ? "bg-[#181512] text-[#FAF7F2] border-[#181512]"
                        : "bg-white text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm">{f.name}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/10">
                        {f.subjectSlug}
                      </span>
                    </div>
                    <div className="my-1 py-0.5">
                      <FormulaRenderer latex={f.latexExpression} displayMode={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Inspector */}
            <div className="lg:col-span-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
              <div className="border-b border-[#DDD4C5] pb-4">
                <span className="text-[10px] font-mono uppercase text-[#8FA184] font-bold tracking-wider">
                  Subject: {selectedFormula.subjectSlug.toUpperCase()} • Class {selectedFormula.classLevel}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917] mt-0.5">
                  {selectedFormula.name}
                </h3>
                <div className="my-3 p-4 bg-[#181512] rounded-sm text-center">
                  <FormulaRenderer latex={selectedFormula.latexExpression} displayMode={true} />
                </div>
              </div>

              {/* 17-field Specification Preview */}
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#1C1917] font-bold block">
                  Academic Specification Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-1">
                    <span className="text-[10px] text-[#8A8178] uppercase block">SI Unit of Output</span>
                    <span className="font-bold text-[#1C1917]">{selectedFormula.outputUnit}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-1">
                    <span className="text-[10px] text-[#8A8178] uppercase block">Category &amp; Domain</span>
                    <span className="font-bold text-[#1C1917]">{selectedFormula.category}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-1">
                    <span className="text-[10px] text-[#8A8178] uppercase block">Conditions of Validity</span>
                    <span className="font-sans text-xs text-[#1C1917]">{selectedFormula.applicabilityConditions.join("; ")}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-1">
                    <span className="text-[10px] text-[#8A8178] uppercase block">Frequent Student Misconceptions</span>
                    <span className="font-sans text-xs text-[#9E6B68]">{selectedFormula.commonMistakes.join("; ")}</span>
                  </div>
                </div>
              </div>

              {/* Symbols Table */}
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#1C1917] font-bold block">
                  Symbol Definitions ({selectedFormula.symbols.length}):
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono bg-white border border-[#DDD4C5]">
                    <thead>
                      <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase text-[#57524C]">
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Meaning</th>
                        <th className="p-2">SI Unit</th>
                        <th className="p-2">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9]">
                      {selectedFormula.symbols.map((sym) => (
                        <tr key={sym.symbol}>
                          <td className="p-2 font-bold">{sym.symbol}</td>
                          <td className="p-2 font-sans">{sym.meaning}</td>
                          <td className="p-2 text-[#545E4E]">{sym.siUnit}</td>
                          <td className="p-2 text-[10px] uppercase text-[#8A8178]">
                            {sym.isConstant ? `Constant (${sym.typicalValue || "Fixed"})` : "Variable"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREREQUISITE DEPENDENCY GRAPH */}
      {activeTab === "prerequisites" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#545E4E] font-bold">
                Knowledge DAG Explorer
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                Concept Dependency Directed Acyclic Graph (DAG)
              </h3>
              <p className="text-xs text-[#57524C] mt-1 max-w-2xl leading-relaxed">
                The Academy 3.0 Prerequisite Engine maps learning dependencies across Mathematics, Physics, Chemistry, and Commerce. Each edge carries a dependency weight that informs automated gap detection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PREREQUISITE_DEPENDENCY_GRAPH).map(([conceptId, prereqs]) => (
                <div
                  key={conceptId}
                  className="p-4 bg-white border border-[#DDD4C5] rounded-sm shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#DDD4C5]/60 pb-2">
                    <span className="font-serif font-bold text-base text-[#1C1917]">
                      {conceptId.replace(/-/g, " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-[#545E4E] font-bold">
                      {prereqs.length} Prerequisites
                    </span>
                  </div>

                  <div className="space-y-2">
                    {prereqs.map((p) => (
                      <div
                        key={p.conceptId}
                        className="p-2.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#1C1917] block">
                            ← {p.conceptTitle}
                          </span>
                          <span className="text-[10px] text-[#8A8178]">
                            Subject: {p.subjectSlug} • Class {p.classLevel}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#545E4E]/15 text-[#545E4E]">
                          {p.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

