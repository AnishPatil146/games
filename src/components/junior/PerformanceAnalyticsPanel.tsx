"use client";

import { useState } from "react";
import {
  Brain,
  Network,
  Calculator,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AcademicStreamConfig, AcademicSubjectConfig } from "@/lib/platform-types";
import { ProgressBar } from "./ProgressBar";
import {
  diagnoseFoundationalGaps,
  PrerequisiteDiagnosticResult,
} from "@/lib/junior/prerequisite-engine";
import {
  evaluateFormulaDimensions,
  FormulaMasteryReport,
} from "@/lib/junior/formula-intelligence-engine";
import {
  evaluateStudentImprovement,
  ImprovementEvaluationResult,
} from "@/lib/junior/reassessment-engine";
import {
  INITIAL_MISTAKE_NOTEBOOK,
  MISTAKE_CATEGORY_LABELS,
  StudentMistakeRecord,
} from "@/lib/junior/mistake-notebook-engine";
import { FormulaRenderer } from "../math/FormulaRenderer";

interface EnrichedSubject extends AcademicSubjectConfig {
  publishedQuestionCount: number;
  participantProgress?: {
    completedQuestionsCount: number;
    attemptsCompleted: number;
    bestScoreOutOf10: number | null;
  };
}

interface PerformanceAnalyticsPanelProps {
  subjects: EnrichedSubject[];
  activeStream: AcademicStreamConfig | undefined;
}

export function PerformanceAnalyticsPanel({
  subjects,
  activeStream,
}: PerformanceAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "prerequisites" | "formula-4d" | "reassessment" | "mistakes"
  >("overview");

  // Sample student evidence data for demonstration of diagnostic engines
  const [mistakes, setMistakes] = useState<StudentMistakeRecord[]>(INITIAL_MISTAKE_NOTEBOOK);

  // 1. Prerequisite Engine calculations
  const diagnosticResult: PrerequisiteDiagnosticResult = diagnoseFoundationalGaps(
    "concept-diff-rules",
    "Differentiation Rules & Derivatives",
    "mathematics",
    {
      "concept-limits": { attempts: 6, correct: 2 }, // 33% accuracy -> STRONG_EVIDENCE gap
      "concept-functions-domain": { attempts: 4, correct: 2 }, // 50% accuracy -> STRONG_EVIDENCE gap
      "concept-poly-factorization": { attempts: 5, correct: 5 }, // 100% accuracy -> no gap
    }
  );

  const foundationalGaps = diagnosticResult.foundationalGapsIdentified.filter((g) => g.isGap);

  // 2. Four-Dimension Formula Mastery evaluation
  const formulaReports: FormulaMasteryReport[] = [
    evaluateFormulaDimensions(
      "f-c12-phy-pe",
      "Einstein's Photoelectric Equation",
      "E_k = h\\nu - \\Phi",
      "physics",
      12,
      [
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: false },
        { dimension: "FORMULA_SELECTION", isCorrect: false },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
      ]
    ),
    evaluateFormulaDimensions(
      "f-c10-m-quad",
      "Quadratic Roots Formula",
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "mathematics",
      10,
      [
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "FORMULA_RECALL", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "FORMULA_SELECTION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
        { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
      ]
    ),
  ];

  // 3. Reassessment evaluation
  const reassessmentHistory: ImprovementEvaluationResult[] = [
    evaluateStudentImprovement(
      {
        timestamp: "2026-11-04T10:00:00Z",
        attemptId: "base-optics-01",
        conceptId: "concept-lens-formula",
        conceptTitle: "Lens Maker Formula & Optical Power",
        subjectSlug: "physics",
        classLevel: 10,
        totalQuestions: 5,
        correctQuestions: 2,
        accuracyPct: 40,
        errorTypesObserved: ["SIGN_ERROR", "CALCULATION_ERROR"],
        weakestSubskill: "Cartesian Sign Convention",
      },
      {
        timestamp: "2026-11-06T09:30:00Z",
        reassessmentAttemptId: "re-optics-01",
        totalQuestions: 5,
        correctQuestions: 5,
        accuracyPct: 100,
        errorTypesObserved: [],
      },
      true
    ),
    evaluateStudentImprovement(
      {
        timestamp: "2026-11-03T14:00:00Z",
        attemptId: "base-chem-01",
        conceptId: "concept-chemical-equilibrium-kc",
        conceptTitle: "Equilibrium Constant (Kc and Kp)",
        subjectSlug: "chemistry",
        classLevel: 11,
        totalQuestions: 5,
        correctQuestions: 1,
        accuracyPct: 20,
        errorTypesObserved: ["CONCEPTUAL_MISUNDERSTANDING"],
        weakestSubskill: "Law of Mass Action",
      },
      {
        timestamp: "2026-11-05T16:00:00Z",
        reassessmentAttemptId: "re-chem-01",
        totalQuestions: 5,
        correctQuestions: 2,
        accuracyPct: 40,
        errorTypesObserved: ["CONCEPTUAL_MISUNDERSTANDING"],
      },
      false
    ),
  ];

  const totalQuestionsAnswered = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.completedQuestionsCount || 0),
    0
  );

  const totalAttempts = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.attemptsCompleted || 0),
    0
  );

  const cognitiveAbilities = activeStream?.abilityIndicators || [
    { key: "logical_reasoning", label: "Logical Reasoning", description: "Step-chaining deductions" },
    { key: "analytical_thinking", label: "Analytical Thinking", description: "Decomposing multi-variable scenarios" },
    { key: "scientific_understanding", label: "Conceptual Mastery", description: "Command of core natural laws" },
    { key: "problem_solving", label: "Quantitative Precision", description: "Applying mathematical formulas" },
  ];

  const toggleMistakeResolved = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, resolved: !m.resolved } : m
      )
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead */}
      <div className="bg-[#181512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184] font-bold">
            Academy 3.0 Diagnostic Intelligence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
            My Performance Diagnostics &amp; Mastery Report
          </h2>
          <p className="text-sm text-[#A89F93] leading-relaxed">
            Evidence-based learning diagnostics. Track zero-repeat cycle progress, foundational prerequisite root-causes, 4-dimension formula mastery, verified before-and-after reassessments, and your personal mistake notebook.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDD4C5] pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${
            activeTab === "overview"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Subject Progress</span>
        </button>

        <button
          onClick={() => setActiveTab("prerequisites")}
          className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${
            activeTab === "prerequisites"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
          }`}
        >
          <Network className="w-3.5 h-3.5 text-[#C8B28E]" />
          <span>Prerequisite Diagnostica</span>
          {foundationalGaps.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#9E6B68] text-white text-[9px]">
              {foundationalGaps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("formula-4d")}
          className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${
            activeTab === "formula-4d"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#8FA184]" />
          <span>4D Formula Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab("reassessment")}
          className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${
            activeTab === "reassessment"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#545E4E]" />
          <span>Verified Reassessments</span>
        </button>

        <button
          onClick={() => setActiveTab("mistakes")}
          className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${
            activeTab === "mistakes"
              ? "bg-[#181512] text-[#FAF7F2] font-bold shadow-sm"
              : "bg-[#EFEBE4] text-[#57524C] hover:bg-[#E5DEC9]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#9E6B68]" />
          <span>Mistake Notebook ({mistakes.filter((m) => !m.resolved).length})</span>
        </button>
      </div>

      {/* 2. Key Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Total Attempts</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">{totalAttempts}</p>
          <span className="text-[10px] text-[#545E4E]">Completed 10-Q sessions</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Questions Solved</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">{totalQuestionsAnswered}</p>
          <span className="text-[10px] text-[#545E4E]">Zero-repeat cycle tracked</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Subjects Explored</span>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">
            {subjects.filter((s) => (s.participantProgress?.attemptsCompleted || 0) > 0).length} / {subjects.length}
          </p>
          <span className="text-[10px] text-[#545E4E]">Across active stream</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1 shadow-sm">
          <span className="text-[10px] uppercase text-[#8A8178] block">Active Weaknesses</span>
          <p className="font-serif text-3xl font-bold text-[#9E6B68]">
            {diagnosticResult.foundationalGapsIdentified.length} Gaps
          </p>
          <span className="text-[10px] text-[#8A8178]">Foundational prerequisites</span>
        </div>
      </div>

      {/* TAB 1: SUBJECT PROGRESS OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">
              Subject Mastery &amp; Cycle Progression
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DDD4C5] text-[10px] font-mono uppercase tracking-wider text-[#57524C]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Questions Solved</th>
                    <th className="py-2.5 px-3">Best Score</th>
                    <th className="py-2.5 px-3">Cycle Progress</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD4C5] font-mono">
                  {subjects.map((subj) => {
                    const completed = subj.participantProgress?.completedQuestionsCount || 0;
                    const best = subj.participantProgress?.bestScoreOutOf10;
                    const progressPct = Math.min(100, Math.round((completed / 100) * 100));
                    return (
                      <tr key={subj.slug} className="hover:bg-[#F3EDE2]/60">
                        <td className="py-3 px-3 font-serif font-bold text-[#1C1917] text-sm">
                          {subj.name}
                        </td>
                        <td className="py-3 px-3 text-[#57524C]">{completed} / 100 Qs</td>
                        <td className="py-3 px-3 text-[#1C1917] font-bold">
                          {best !== null && best !== undefined ? `${best} / 10` : "—"}
                        </td>
                        <td className="py-3 px-3 w-52">
                          <ProgressBar
                            value={progressPct}
                            showPercentage={true}
                            size="sm"
                            variant={progressPct >= 80 ? "emerald" : progressPct >= 40 ? "amber" : "gold"}
                            emptyLabel="0% Solved"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {completed > 0 ? (
                            <span className="text-emerald-800 text-[10px] uppercase font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="text-[#8A8178] text-[10px] uppercase">
                              Uninitiated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cognitive Ability Synthesis */}
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#545E4E]" />
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                Cognitive Ability Matrix
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cognitiveAbilities.map((ab) => (
                <div
                  key={ab.key}
                  className="p-4 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-1"
                >
                  <span className="font-serif text-base font-bold text-[#1C1917] block">
                    {ab.label}
                  </span>
                  <p className="text-xs text-[#57524C] leading-relaxed">
                    {ab.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREREQUISITE WEAKNESS DETECTION */}
      {activeTab === "prerequisites" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E6B68] font-bold">
                  Foundational Root-Cause Engine
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  Prerequisite Dependency Diagnostica
                </h3>
                <p className="text-xs text-[#57524C] mt-1 max-w-2xl leading-relaxed">
                  When you struggle with an advanced concept (like Derivatives), the cause is frequently a gap in foundational prerequisites (Limits, Functions, or Algebra). Rather than re-drilling the advanced formula, fix the root foundation first.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#181512] text-[#C8B28E] rounded text-xs font-mono font-bold">
                {foundationalGaps.length} Foundational Gaps Detected
              </span>
            </div>

            {foundationalGaps.length === 0 ? (
              <div className="p-8 text-center text-[#545E4E] font-mono text-sm border border-[#545E4E]/30 rounded-sm bg-[#545E4E]/10">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-[#545E4E]" />
                <span>No foundational prerequisite gaps detected! Your conceptual baseline is solid.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded text-xs leading-relaxed text-[#1C1917]">
                  <strong className="font-mono text-[#545E4E] uppercase block mb-1">
                    Automated Diagnostic Diagnosis:
                  </strong>
                  <p className="font-sans text-sm font-medium">
                    {diagnosticResult.summaryExplanation}
                  </p>
                </div>

                {foundationalGaps.map((item) => (
                  <div
                    key={item.prerequisite.conceptId}
                    className="p-5 bg-white border border-[#DDD4C5] rounded-sm shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#9E6B68]" />
                        <span className="font-serif font-bold text-base text-[#1C1917]">
                          Root-Cause Prerequisite: {item.prerequisite.conceptTitle}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#9E6B68]/15 text-[#9E6B68] border border-[#9E6B68]/30">
                        Confidence: {item.confidence.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded text-xs space-y-2">
                      <div className="font-mono text-[11px] text-[#545E4E] font-bold">
                        DIAGNOSTIC EVIDENCE:
                      </div>
                      <p className="font-sans text-sm font-semibold text-[#1C1917]">
                        Accuracy: {item.accuracyPct}% across {item.attemptsCount} questions tested ({item.prerequisite.importance} importance).
                      </p>
                      <p className="text-xs text-[#57524C]">
                        {item.recommendedAction}
                      </p>
                      <p className="text-[11px] text-[#8A8178] italic">
                        Rationale: {item.prerequisite.rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 4D FORMULA INTELLIGENCE */}
      {activeTab === "formula-4d" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8FA184] font-bold">
                Multi-Dimensional Assessment
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                Four-Dimension Formula Mastery
              </h3>
              <p className="text-xs text-[#57524C] mt-1 max-w-2xl leading-relaxed">
                Formula mastery is never a single score. A student can have perfect formula recall but fail at numerical substitution, or understand symbols but select the wrong formula. Each dimension is evaluated independently.
              </p>
            </div>

            <div className="space-y-4">
              {formulaReports.map((report) => (
                <div
                  key={report.formulaId}
                  className="p-5 bg-white border border-[#DDD4C5] rounded-sm shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#DDD4C5]/60 pb-2">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1C1917]">
                        {report.formulaName}
                      </h4>
                      <span className="text-[10px] font-mono uppercase text-[#8A8178]">
                        Subject: {report.subjectSlug}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    {/* Dim 1: Recall */}
                    <div className="p-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded space-y-1">
                      <span className="text-[10px] text-[#8A8178] uppercase block">
                        1. Formula Recall
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1C1917]">
                          {report.dimensions.FORMULA_RECALL.accuracyPct}%
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            report.dimensions.FORMULA_RECALL.rating === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {report.dimensions.FORMULA_RECALL.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#57524C]">
                        {report.dimensions.FORMULA_RECALL.attemptsCount} questions tested
                      </p>
                    </div>

                    {/* Dim 2: Symbol Understanding */}
                    <div className="p-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded space-y-1">
                      <span className="text-[10px] text-[#8A8178] uppercase block">
                        2. Symbol Meaning
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1C1917]">
                          {report.dimensions.SYMBOL_UNDERSTANDING.accuracyPct}%
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            report.dimensions.SYMBOL_UNDERSTANDING.rating === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {report.dimensions.SYMBOL_UNDERSTANDING.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#57524C]">
                        {report.dimensions.SYMBOL_UNDERSTANDING.attemptsCount} questions tested
                      </p>
                    </div>

                    {/* Dim 3: Selection */}
                    <div className="p-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded space-y-1">
                      <span className="text-[10px] text-[#8A8178] uppercase block">
                        3. Formula Selection
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1C1917]">
                          {report.dimensions.FORMULA_SELECTION.accuracyPct}%
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            report.dimensions.FORMULA_SELECTION.rating === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : report.dimensions.FORMULA_SELECTION.rating === "DEVELOPING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {report.dimensions.FORMULA_SELECTION.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#57524C]">
                        {report.dimensions.FORMULA_SELECTION.attemptsCount} questions tested
                      </p>
                    </div>

                    {/* Dim 4: Numerical Application */}
                    <div className="p-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded space-y-1">
                      <span className="text-[10px] text-[#8A8178] uppercase block">
                        4. Numerical Calc
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1C1917]">
                          {report.dimensions.NUMERICAL_APPLICATION.accuracyPct}%
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            report.dimensions.NUMERICAL_APPLICATION.rating === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : report.dimensions.NUMERICAL_APPLICATION.rating === "DEVELOPING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {report.dimensions.NUMERICAL_APPLICATION.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#57524C]">
                        {report.dimensions.NUMERICAL_APPLICATION.attemptsCount} questions tested
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED REASSESSMENTS */}
      {activeTab === "reassessment" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#545E4E] font-bold">
                Evidence-Based Progress State Machine
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                Diagnostic Reassessments &amp; Verified Improvements
              </h3>
              <p className="text-xs text-[#57524C] mt-1 max-w-2xl leading-relaxed">
                Under Academy 3.0 rules, a student who performed poorly cannot simply read notes and be marked as &quot;Mastered&quot;. Improvement is confirmed ONLY after completing a fresh reassessment that provides verifiable evidence.
              </p>
            </div>

            <div className="space-y-4">
              {reassessmentHistory.map((item) => (
                <div
                  key={item.conceptId}
                  className="p-5 bg-white border border-[#DDD4C5] rounded-sm shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1C1917]">
                        {item.conceptTitle}
                      </h4>
                      <span className="text-[10px] font-mono text-[#8A8178]">
                        Concept ID: {item.conceptId}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        item.progressState === "IMPROVEMENT_CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {item.progressState === "IMPROVEMENT_CONFIRMED" ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>{item.progressState.replace(/_/g, " ")}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#8A8178] block">Baseline Accuracy</span>
                      <span className="font-serif text-xl font-bold text-[#9E6B68]">
                        {item.baselineAccuracy}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8A8178] block">Reassessment Accuracy</span>
                      <span className="font-serif text-xl font-bold text-emerald-800">
                        {item.reassessmentAccuracy}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8A8178] block">Net Improvement</span>
                      <span className="font-serif text-xl font-bold text-[#1C1917]">
                        +{item.accuracyDelta}% gain
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#57524C] leading-relaxed pt-1">
                    <strong className="text-[#1C1917]">Diagnostic Verification:</strong> {item.evidenceSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MISTAKE NOTEBOOK */}
      {activeTab === "mistakes" && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E6B68] font-bold">
                  Diagnostic Error Categorization
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  Mistake &amp; Error Notebook
                </h3>
                <p className="text-xs text-[#57524C] mt-1 max-w-2xl leading-relaxed">
                  Every incorrect answer is classified into one of 9 diagnostic categories (conceptual, calculation, formula selection, sign error, etc.) with actionable remediation.
                </p>
              </div>

              <span className="px-3 py-1 bg-[#181512] text-[#FAF7F2] rounded text-xs font-mono font-bold">
                {mistakes.filter((m) => !m.resolved).length} Pending Review
              </span>
            </div>

            <div className="space-y-3">
              {mistakes.map((item) => {
                const catMeta = MISTAKE_CATEGORY_LABELS[item.category];
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-sm border transition-all ${
                      item.resolved
                        ? "bg-[#FAF7F2]/60 border-[#DDD4C5] opacity-65"
                        : "bg-white border-[#DDD4C5] shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={{ backgroundColor: catMeta.badgeColor }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold uppercase tracking-wider"
                          >
                            {catMeta.label}
                          </span>
                          <span className="text-xs font-mono text-[#8A8178]">
                            {item.subjectSlug.toUpperCase()} • {item.conceptTitle}
                          </span>
                        </div>

                        <p className="font-serif text-sm font-semibold text-[#1C1917]">
                          {item.questionText}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900">
                            <span className="text-[10px] text-rose-700 block uppercase">
                              Your Answer:
                            </span>
                            {item.studentAnswer}
                          </div>
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                            <span className="text-[10px] text-emerald-700 block uppercase">
                              Correct Solution:
                            </span>
                            {item.correctAnswer}
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded text-xs text-[#57524C] mt-2">
                          <strong className="text-[#1C1917] font-mono text-[10px] uppercase block mb-0.5">
                            Remediation Step:
                          </strong>
                          {item.stepExplanation}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleMistakeResolved(item.id)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                          item.resolved
                            ? "bg-[#545E4E] text-white"
                            : "bg-[#EFEBE4] text-[#1C1917] hover:bg-[#E5DEC9] border border-[#DDD4C5]"
                        }`}
                      >
                        {item.resolved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </>
                        ) : (
                          <span>Mark Resolved</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
