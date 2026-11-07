"use client";

import React, { useState, useMemo } from "react";
import {
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { MathRenderer } from "@/components/math/MathRenderer";

export interface PracticeQuestionItem {
  id: string;
  classLevel: 10 | 11 | 12;
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  topicTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionType: "MCQ" | "Assertion-Reason" | "Numerical" | "Diagram-based";
  prompt: string;
  options: { key: string; text: string }[];
  correctKey: string;
  hints: string[];
  stepByStepSolution: string;
}

export const PRACTICE_QUESTION_BANK: PracticeQuestionItem[] = [
  // Class 10 Math
  {
    id: "pq-c10-m-01",
    classLevel: 10,
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Quadratic Equations",
    topicTitle: "Roots & Discriminant",
    difficulty: "Medium",
    questionType: "MCQ",
    prompt: "If one root of the quadratic equation 2x² + kx - 6 = 0 is 2, find the value of k and the other root.",
    options: [
      { key: "A", text: "k = -1, other root = -3/2" },
      { key: "B", text: "k = 1, other root = 3/2" },
      { key: "C", text: "k = -2, other root = -3" },
      { key: "D", text: "k = 2, other root = 3" },
    ],
    correctKey: "A",
    hints: [
      "Since x = 2 is a root, substituting x = 2 into 2x² + kx - 6 must satisfy the equation = 0.",
      "Use product of roots αβ = c/a = -6/2 = -3 to find the second root β directly.",
    ],
    stepByStepSolution:
      "1. Substitute x = 2: 2(2)² + k(2) - 6 = 0 => 8 + 2k - 6 = 0 => 2k + 2 = 0 => k = -1.\n2. The equation is 2x² - x - 6 = 0.\n3. Product of roots αβ = c/a = -6/2 = -3.\n4. Since α = 2, we have 2β = -3 => β = -3/2.",
  },
  {
    id: "pq-c10-m-02",
    classLevel: 10,
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Introduction to Trigonometry",
    topicTitle: "Trigonometric Identities",
    difficulty: "Hard",
    questionType: "MCQ",
    prompt: "If sin θ + cos θ = √3, find the value of sin θ · cos θ.",
    options: [
      { key: "A", text: "1/2" },
      { key: "B", text: "1" },
      { key: "C", text: "√3/2" },
      { key: "D", text: "2" },
    ],
    correctKey: "B",
    hints: [
      "Square both sides of the equation (sin θ + cos θ)² = (√3)².",
      "Apply the fundamental Pythagorean identity sin²θ + cos²θ = 1.",
    ],
    stepByStepSolution:
      "1. Square both sides: (sin θ + cos θ)² = (√3)² = 3.\n2. Expand LHS: sin²θ + cos²θ + 2 sin θ cos θ = 3.\n3. Substitute identity sin²θ + cos²θ = 1:\n   1 + 2 sin θ cos θ = 3.\n4. 2 sin θ cos θ = 2 => sin θ cos θ = 1.",
  },

  // Class 10 Science
  {
    id: "pq-c10-s-01",
    classLevel: 10,
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Electricity",
    topicTitle: "Ohm's Law & Resistance Factors",
    difficulty: "Medium",
    questionType: "MCQ",
    prompt: "A cylindrical metal wire of resistance R is uniformly drawn and stretched so that its length increases by 100% (doubles) while volume remains constant. What is the new resistance?",
    options: [
      { key: "A", text: "2R" },
      { key: "B", text: "4R" },
      { key: "C", text: "R / 2" },
      { key: "D", text: "R / 4" },
    ],
    correctKey: "B",
    hints: [
      "Volume V = A × L is constant. When length doubles (L' = 2L), area must halve (A' = A / 2).",
      "Substitute the new dimensions into R' = ρ L' / A'.",
    ],
    stepByStepSolution:
      "1. Constant volume: A × L = A' × (2L) => A' = A / 2.\n2. Initial resistance: R = ρL / A.\n3. New resistance: R' = ρ(2L) / (A / 2) = 4(ρL / A) = 4R.",
  },

  // Class 11 Physics
  {
    id: "pq-c11-p-01",
    classLevel: 11,
    subjectSlug: "c11-physics",
    subjectName: "Physics",
    chapterTitle: "Motion in a Plane",
    topicTitle: "Projectile Motion & Maximum Height",
    difficulty: "Medium",
    questionType: "MCQ",
    prompt: "A projectile is launched from ground level with speed u at angle θ = 30° to the horizontal. If g = 10 m/s² and u = 40 m/s, what is its maximum height attained?",
    options: [
      { key: "A", text: "20 m" },
      { key: "B", text: "40 m" },
      { key: "C", text: "60 m" },
      { key: "D", text: "80 m" },
    ],
    correctKey: "A",
    hints: [
      "Use the vertical kinematic maximum height formula: H = (u² sin²θ) / (2g).",
      "Notice that sin(30°) = 0.5, so sin²(30°) = 0.25 = 1/4.",
    ],
    stepByStepSolution:
      "1. H = (u² sin²θ) / (2g).\n2. Given: u = 40 m/s, θ = 30°, g = 10 m/s².\n3. sin(30°) = 1/2 => sin²(30°) = 1/4.\n4. H = (40² × (1/4)) / (2 × 10) = (1600 / 4) / 20 = 400 / 20 = 20 m.",
  },

  // Class 11 Mathematics
  {
    id: "pq-c11-m-01",
    classLevel: 11,
    subjectSlug: "c11-mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Trigonometric Functions",
    topicTitle: "Radian Measure & Compound Angles",
    difficulty: "Hard",
    questionType: "MCQ",
    prompt: "Evaluate the exact value of cos(75°) using compound angle formulas.",
    options: [
      { key: "A", text: "(√6 - √2) / 4" },
      { key: "B", text: "(√6 + √2) / 4" },
      { key: "C", text: "(√3 - 1) / (2√2)" },
      { key: "D", text: "1 / 4" },
    ],
    correctKey: "A",
    hints: [
      "Express 75° as the sum of standard angles: 75° = 45° + 30°.",
      "Apply the cosine addition formula: cos(A + B) = cos A cos B - sin A sin B.",
    ],
    stepByStepSolution:
      "1. cos(75°) = cos(45° + 30°).\n2. cos(A + B) = cos A cos B - sin A sin B.\n3. cos(45°) = 1/√2, cos(30°) = √3/2, sin(45°) = 1/√2, sin(30°) = 1/2.\n4. cos(75°) = (1/√2)(√3/2) - (1/√2)(1/2) = (√3 - 1) / (2√2) = (√6 - √2) / 4.",
  },

  // Class 12 Physics
  {
    id: "pq-c12-p-01",
    classLevel: 12,
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Electric Charges and Fields",
    topicTitle: "Coulomb's Law in Dielectrics",
    difficulty: "Medium",
    questionType: "MCQ",
    prompt: "Two point charges experience an electrostatic repulsive force of 16 N in air. When immersed in a liquid dielectric of constant K = 4 at the same distance, what is the new force?",
    options: [
      { key: "A", text: "64 N" },
      { key: "B", text: "16 N" },
      { key: "C", text: "4 N" },
      { key: "D", text: "1 N" },
    ],
    correctKey: "C",
    hints: [
      "Dielectric polarization reduces electrostatic force by factor K: F_med = F_air / K.",
      "Substitute the given air force (16 N) and dielectric constant K = 4 into the relation.",
    ],
    stepByStepSolution:
      "1. F_med = F_air / K.\n2. Given F_air = 16 N and K = 4.\n3. F_med = 16 / 4 = 4 N.",
  },

  // Class 12 Mathematics
  {
    id: "pq-c12-m-01",
    classLevel: 12,
    subjectSlug: "c12-mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Integrals",
    topicTitle: "Special Exponential Form",
    difficulty: "Medium",
    questionType: "MCQ",
    prompt: "Evaluate ∫ e^x [sec(x) + sec(x) tan(x)] dx.",
    options: [
      { key: "A", text: "e^x sec(x) + C" },
      { key: "B", text: "e^x tan(x) + C" },
      { key: "C", text: "e^x sec(x) tan(x) + C" },
      { key: "D", text: "e^x + C" },
    ],
    correctKey: "A",
    hints: [
      "Recall the standard integral theorem: ∫ e^x [f(x) + f'(x)] dx = e^x f(x) + C.",
      "Identify f(x) = sec(x) and check whether its derivative equals sec(x) tan(x).",
    ],
    stepByStepSolution:
      "1. Let f(x) = sec(x).\n2. Derivative: f'(x) = d/dx(sec x) = sec(x) tan(x).\n3. The integrand is of the form e^x [f(x) + f'(x)].\n4. Therefore, the integral evaluates directly to e^x f(x) + C = e^x sec(x) + C.",
  },
];

export function PracticeArenaHub({
  initialClass = 10,
}: {
  initialClass?: 10 | 11 | 12;
}) {
  const [selectedClass, setSelectedClass] = useState<10 | 11 | 12>(initialClass);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Practice state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
  const [showFullSolution, setShowFullSolution] = useState(false);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return PRACTICE_QUESTION_BANK.filter((q) => {
      if (q.classLevel !== selectedClass) return false;
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [selectedClass, selectedDifficulty]);

  const currQ = filteredQuestions[activeQuestionIndex] || filteredQuestions[0] || null;

  const handleNext = () => {
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      resetQuestionState();
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setRevealedHintIndex(-1);
    setShowFullSolution(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Masthead */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-950/60 text-amber-400 border border-amber-500/30">
                <Compass className="w-3 h-3" />
                Practice Arena
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-zinc-400">Adaptive Question Bank</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
              Subject Mastery Practice Arena
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Step-by-step problem deduction with progressive pedagogical hints, instant answer validation, and verified syllabus references.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="flex rounded border border-[#3A2F28] p-0.5 bg-[#120E0C] self-start md:self-auto">
            {["all", "Easy", "Medium", "Hard"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setActiveQuestionIndex(0);
                  resetQuestionState();
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                  selectedDifficulty === diff
                    ? "bg-[#2A221C] text-amber-400 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {diff === "all" ? "All Tiers" : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Class Level Selector */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-[#29221C]">
          {([10, 11, 12] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setSelectedClass(lvl);
                setActiveQuestionIndex(0);
                resetQuestionState();
              }}
              className={`px-4 py-1.5 text-xs font-mono font-bold rounded border transition-colors ${
                selectedClass === lvl
                  ? "bg-[#251E1A] text-amber-400 border-amber-500/50 shadow-sm"
                  : "bg-[#14100E] text-zinc-400 hover:text-zinc-200 border-[#2E2520]"
              }`}
            >
              Class {lvl} Arena
            </button>
          ))}
        </div>
      </div>

      {/* 2. Question Workspace */}
      {currQ ? (
        <div className="bg-[#241D17] border-2 border-[#6E553F] rounded-xl p-6 shadow-xl space-y-6">
          {/* Header Status Bar */}
          <div className="flex items-center justify-between border-b-2 border-[#4A392B] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 bg-[#342A20] border-2 border-[#7D644D] px-2.5 py-1 rounded font-bold">
                Class {currQ.classLevel} · {currQ.subjectName}
              </span>
              <span className="text-zinc-400 text-xs">·</span>
              <span className="text-xs font-mono text-emerald-300 font-bold">{currQ.chapterTitle}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded border-2 ${
                  currQ.difficulty === "Easy"
                    ? "bg-[#14532D] text-emerald-200 border-emerald-400"
                    : currQ.difficulty === "Medium"
                    ? "bg-amber-500 text-black border-white font-black"
                    : "bg-rose-600 text-white border-white font-black"
                }`}
              >
                {currQ.difficulty}
              </span>
              <span className="text-xs font-mono text-white font-bold">
                Question {activeQuestionIndex + 1} of {filteredQuestions.length}
              </span>
            </div>
          </div>

          {/* Prompt */}
          <div className="text-base font-serif font-medium text-white leading-relaxed p-4 bg-[#1C1611] rounded-xl border-2 border-[#544333]">
            <MathRenderer content={currQ.prompt} />
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currQ.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrect = opt.key === currQ.correctKey;

              let cardStyle = "bg-[#2D241C] border-2 border-[#7D644D] text-white hover:border-amber-400 hover:bg-[#382D22]";
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  cardStyle = "bg-[#14532D] border-2 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50";
                } else if (isSelected) {
                  cardStyle = "bg-[#7F1D1D] border-2 border-rose-400 text-white ring-2 ring-rose-400/50";
                }
              } else if (isSelected) {
                cardStyle = "bg-[#16442A] border-2 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]";
              }

              return (
                <div
                  key={opt.key}
                  onClick={() => {
                    if (!isAnswerSubmitted) setSelectedOption(opt.key);
                  }}
                  className={`p-4 rounded-xl border-2 text-sm font-mono transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#44362A] border-2 border-[#8C7156] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {opt.key}
                    </span>
                    <span className="font-semibold text-white flex-1 min-w-0 break-words">
                      <MathRenderer content={opt.text} />
                    </span>
                  </div>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row: Check Answer, Progressive Hints, Solution */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#28211C]">
            <div className="flex items-center gap-2">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={() => setIsAnswerSubmitted(true)}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Verify Response
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFullSolution(!showFullSolution)}
                  className="px-3.5 py-2 rounded bg-[#251E1A] border border-[#3A2F28] hover:border-zinc-500 text-zinc-200 font-mono text-xs transition-colors"
                >
                  {showFullSolution ? "Hide Explanation" : "Step-by-Step Solution"}
                </button>
              )}

              {/* Progressive Hint Reveal */}
              {currQ.hints.length > 0 && revealedHintIndex < currQ.hints.length - 1 && (
                <button
                  type="button"
                  onClick={() => setRevealedHintIndex(revealedHintIndex + 1)}
                  className="px-3 py-2 rounded bg-[#1B1613] border border-[#362C24] hover:border-amber-500/50 text-amber-300 font-mono text-xs transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Reveal Hint ({revealedHintIndex + 2}/{currQ.hints.length})</span>
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeQuestionIndex === 0}
                onClick={handlePrev}
                className="p-2 rounded bg-[#1C1613] border border-[#302620] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activeQuestionIndex === filteredQuestions.length - 1}
                onClick={handleNext}
                className="p-2 rounded bg-[#1C1613] border border-[#302620] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Active Progressive Hints */}
          {revealedHintIndex >= 0 && (
            <div className="bg-[#1C1714] border border-[#3A2F26] rounded p-3.5 space-y-2 text-xs font-mono">
              <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">
                Progressive Pedagogical Hints:
              </span>
              {currQ.hints.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                <div key={idx} className="text-zinc-300 pl-3 border-l-2 border-amber-500/50">
                  Hint {idx + 1}: {hint}
                </div>
              ))}
            </div>
          )}

          {/* Render Step-by-Step Solution */}
          {showFullSolution && (
            <div className="bg-[#121A15] border border-emerald-500/30 rounded p-4 text-xs font-mono space-y-2">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[11px]">
                Rigorous Examination Solution Rationale:
              </span>
              <pre className="text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                {currQ.stepByStepSolution}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-[#15110F] border border-[#2F2722] rounded-md">
          No practice questions match the selected Class and difficulty tier.
        </div>
      )}
    </div>
  );
}
