"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { MathRenderer } from "@/components/math/MathRenderer";

export interface MockTestConfig {
  id: string;
  name: string;
  classLevel: 10 | 11 | 12;
  boardOrExam: "CBSE" | "MSBSHSE" | "JEE" | "NEET" | "CUET";
  durationMinutes: number;
  totalMarks: number;
  markingScheme: { correct: number; incorrect: number; unattempted: number };
  questionsCount: number;
  description: string;
}

export const MOCK_TESTS_CATALOGUE: MockTestConfig[] = [
  {
    id: "test-c10-cbse-math-std",
    name: "CBSE Class 10 Mathematics Standard Official Mock Paper",
    classLevel: 10,
    boardOrExam: "CBSE",
    durationMinutes: 180,
    totalMarks: 80,
    markingScheme: { correct: 1, incorrect: 0, unattempted: 0 },
    questionsCount: 10, // condensed interactive sample
    description: "Full board examination blueprint with Sections A (MCQs), B (Short Answer), C (Long Answer), and D (Case-Based Assessment).",
  },
  {
    id: "test-c10-cbse-science",
    name: "CBSE Class 10 Science Integrated Mock Assessment",
    classLevel: 10,
    boardOrExam: "CBSE",
    durationMinutes: 180,
    totalMarks: 80,
    markingScheme: { correct: 1, incorrect: 0, unattempted: 0 },
    questionsCount: 10,
    description: "Evaluates Chemical Reactions, Life Processes, Geometric Optics, Ohm's Electricity, and Hereditary Genetics.",
  },
  {
    id: "test-c12-jee-physics-math",
    name: "JEE Main National Benchmark Mock (Physics & Mathematics)",
    classLevel: 12,
    boardOrExam: "JEE",
    durationMinutes: 60,
    totalMarks: 40,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    questionsCount: 10,
    description: "Rigorous analytical testing with negative marking (-1). Calculus, Gauss's Law, Biot-Savart, and Bayes' Probability.",
  },
  {
    id: "test-c12-neet-biology-physics",
    name: "NEET UG Medical Entrance Simulation",
    classLevel: 12,
    boardOrExam: "NEET",
    durationMinutes: 60,
    totalMarks: 40,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    questionsCount: 10,
    description: "Strict speed & accuracy benchmark for medical aspirants (+4 for correct, -1 for penalty mistakes).",
  },
];

interface TestQuestionItem {
  id: string;
  topic: string;
  prompt: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation: string;
}

const SAMPLE_TEST_QUESTIONS: Record<string, TestQuestionItem[]> = {
  "test-c10-cbse-math-std": [
    {
      id: "t-c10-1",
      topic: "Real Numbers",
      prompt: "If two positive integers a and b are written as a = x³ y² and b = x y³, where x and y are prime numbers, then HCF(a, b) is:",
      options: [
        { key: "A", text: "x y" },
        { key: "B", text: "x y²" },
        { key: "C", text: "x³ y³" },
        { key: "D", text: "x² y²" },
      ],
      correctKey: "B",
      explanation: "HCF is the product of the smallest power of each common prime factor involved: min power of x is 1, min power of y is 2, hence HCF = x y².",
    },
    {
      id: "t-c10-2",
      topic: "Polynomials",
      prompt: "If one zero of the quadratic polynomial x² + 3x + k is 2, then the value of k is:",
      options: [
        { key: "A", text: "10" },
        { key: "B", text: "-10" },
        { key: "C", text: "-7" },
        { key: "D", text: "-2" },
      ],
      correctKey: "B",
      explanation: "Since x = 2 is a root: (2)² + 3(2) + k = 0 => 4 + 6 + k = 0 => k = -10.",
    },
    {
      id: "t-c10-3",
      topic: "Linear Equations",
      prompt: "The pair of equations x + 2y + 5 = 0 and -3x - 6y + 1 = 0 has:",
      options: [
        { key: "A", text: "A unique solution" },
        { key: "B", text: "Exactly two solutions" },
        { key: "C", text: "Infinitely many solutions" },
        { key: "D", text: "No solution" },
      ],
      correctKey: "D",
      explanation: "Compare ratios: a1/a2 = 1/(-3) = -1/3; b1/b2 = 2/(-6) = -1/3; c1/c2 = 5/1 = 5. Since a1/a2 = b1/b2 ≠ c1/c2, the lines are parallel with no solution.",
    },
  ],
};

export function TestCentreHub({
  initialClass = 10,
}: {
  initialClass?: 10 | 11 | 12;
}) {
  const [selectedClass, setSelectedClass] = useState<10 | 11 | 12>(initialClass);
  const [selectedTestId, setSelectedTestId] = useState<string>("test-c10-cbse-math-std");
  const [testPhase, setTestPhase] = useState<"lobby" | "in_test" | "debrief">("lobby");

  // In-test runtime state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600);

  const activeTest =
    MOCK_TESTS_CATALOGUE.find((t) => t.id === selectedTestId) || MOCK_TESTS_CATALOGUE[0];

  const questions =
    SAMPLE_TEST_QUESTIONS[activeTest.id] || SAMPLE_TEST_QUESTIONS["test-c10-cbse-math-std"];

  // Countdown timer during test
  useEffect(() => {
    if (testPhase !== "in_test") return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestPhase("debrief");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testPhase]);

  const handleStartTest = (testId: string) => {
    setSelectedTestId(testId);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setCurrentQIndex(0);
    setTimeRemainingSeconds(600);
    setTestPhase("in_test");
  };

  const handleSelectAnswer = (qId: string, key: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const handleToggleReview = (qId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Evaluation calculations
  const results = React.useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let totalScore = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans) {
        unattempted++;
        totalScore += activeTest.markingScheme.unattempted;
      } else if (ans === q.correctKey) {
        correct++;
        totalScore += activeTest.markingScheme.correct;
      } else {
        incorrect++;
        totalScore += activeTest.markingScheme.incorrect;
      }
    });

    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    return { correct, incorrect, unattempted, totalScore, accuracy };
  }, [questions, userAnswers, activeTest]);

  const filteredTests = MOCK_TESTS_CATALOGUE.filter((t) => t.classLevel === selectedClass);

  return (
    <div className="space-y-6">
      {/* 1. Masthead */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <Trophy className="w-3 h-3" />
                Examination Centre
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Mock Assessments</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
              Official Examination & Mock Assessment Hall
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Timed simulations with strict marking schemes (+4/-1, +1/0), real-time question palette navigation, and comprehensive post-test diagnostic analysis.
            </p>
          </div>

          {/* Class Level Selector */}
          <div className="flex rounded border border-[#3A2F28] p-0.5 bg-[#120E0C] self-start md:self-auto">
            {([10, 11, 12] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedClass(lvl);
                  setTestPhase("lobby");
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                  selectedClass === lvl
                    ? "bg-[#2A221C] text-amber-400 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Class {lvl} Tests
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LOBBY VIEW: TEST SELECTION */}
      {testPhase === "lobby" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-[#15110F] border border-[#2F2722] rounded-md p-5 shadow-lg space-y-4 hover:border-amber-500/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#100D0B] text-amber-400 border border-amber-500/20 font-bold">
                    {test.boardOrExam} Blueprint
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{test.durationMinutes} Mins</span>
                  </div>
                </div>

                <h3 className="text-base font-serif font-bold text-[#FAF7F2] leading-snug">
                  {test.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {test.description}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span>Questions: {test.questionsCount}</span>
                  <span>Total Marks: {test.totalMarks}</span>
                  <span>
                    Marking: +{test.markingScheme.correct} / {test.markingScheme.incorrect}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartTest(test.id)}
                className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Initiate Examination</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. IN-TEST RUNTIME EXPERIENCE */}
      {testPhase === "in_test" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Plate */}
          <div className="lg:col-span-8 bg-[#15110F] border border-[#2F2722] rounded-md p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#28211C] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  {questions[currentQIndex]?.topic}
                </span>
                <h3 className="text-base font-serif font-bold text-[#FAF7F2]">
                  Question {currentQIndex + 1} of {questions.length}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggleReview(questions[currentQIndex].id)}
                className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 border ${
                  markedForReview.has(questions[currentQIndex].id)
                    ? "bg-purple-950/80 text-purple-300 border-purple-500 font-bold"
                    : "bg-[#1C1613] text-zinc-400 border-[#312720]"
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>
                  {markedForReview.has(questions[currentQIndex].id)
                    ? "Marked for Review"
                    : "Mark for Review"}
                </span>
              </button>
            </div>

            <div className="text-sm font-serif text-[#FAF7F2] leading-relaxed">
              <MathRenderer content={questions[currentQIndex]?.prompt || ""} />
            </div>

            <div className="space-y-2.5">
              {questions[currentQIndex]?.options.map((opt) => {
                const isSelected = userAnswers[questions[currentQIndex].id] === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectAnswer(questions[currentQIndex].id, opt.key)}
                    className={`p-3.5 rounded border text-xs font-mono transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#251D18] border-amber-500 text-amber-300 ring-1 ring-amber-500/40"
                        : "bg-[#181310] border-[#2C231D] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#120E0C] border border-[#3A2F27] flex items-center justify-center font-bold text-[10px]">
                      {opt.key}
                    </span>
                    <span>
                      <MathRenderer content={opt.text} />
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#28211C]">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="px-4 py-2 text-xs font-mono rounded bg-[#1C1613] border border-[#302620] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {currentQIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded bg-[#2A211B] text-amber-300 border border-amber-500/40 hover:bg-[#352A22]"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTestPhase("debrief")}
                  className="px-5 py-2 text-xs font-mono font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Submit Examination
                </button>
              )}
            </div>
          </div>

          {/* Question Palette & Live Timer */}
          <div className="lg:col-span-4 space-y-4">
            {/* Timer card */}
            <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-4 text-center space-y-1 shadow-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Time Remaining
              </span>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {Math.floor(timeRemainingSeconds / 60)}:
                {(timeRemainingSeconds % 60).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Question Palette Grid */}
            <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-4 space-y-3 shadow-md">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                Question Palette
              </span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(userAnswers[q.id]);
                  const isReview = markedForReview.has(q.id);
                  const isCurrent = currentQIndex === idx;

                  let colorStyle = "bg-[#181310] text-zinc-400 border-[#2D231C]";
                  if (isReview) {
                    colorStyle = "bg-purple-950 text-purple-300 border-purple-500 font-bold";
                  } else if (isAnswered) {
                    colorStyle = "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 rounded text-xs font-mono border transition-all flex items-center justify-center ${colorStyle} ${
                        isCurrent ? "ring-2 ring-amber-400 font-bold" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-3 border-t border-[#28211C] grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-purple-500" />
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-[#2D231C]" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded border border-amber-400" />
                  <span>Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. POST-TEST DEBRIEF & DIAGNOSTIC REPORT */}
      {testPhase === "debrief" && (
        <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#28211C] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                Official Examination Monograph
              </span>
              <h3 className="text-xl font-serif font-bold text-[#FAF7F2] mt-0.5">
                Performance Evaluation & Diagnostic Report
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setTestPhase("lobby")}
              className="px-4 py-2 text-xs font-mono font-bold rounded bg-[#251E1A] text-zinc-200 border border-[#3A2F28] hover:text-white"
            >
              Return to Test Hall
            </button>
          </div>

          {/* Metric KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#100D0B] border border-[#2B221B] rounded p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Total Score</span>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                {results.totalScore}
              </div>
            </div>
            <div className="bg-[#100D0B] border border-[#2B221B] rounded p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Accuracy Rate</span>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {results.accuracy.toFixed(1)}%
              </div>
            </div>
            <div className="bg-[#100D0B] border border-[#2B221B] rounded p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Correct Answers</span>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {results.correct}
              </div>
            </div>
            <div className="bg-[#100D0B] border border-[#2B221B] rounded p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Incorrect / Penalty</span>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
                {results.incorrect}
              </div>
            </div>
          </div>

          {/* Question-by-Question Solution Rationale */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Step-by-Step Question Audit & Explanations
            </span>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctKey;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded border text-xs font-mono space-y-2 ${
                      isCorrect
                        ? "bg-[#111A14] border-emerald-500/40 text-emerald-200"
                        : "bg-[#1C1413] border-rose-500/40 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Question {idx + 1} ({q.topic})
                      </span>
                      <span>
                        {isCorrect ? "✓ Correct (+1)" : userAns ? "✗ Incorrect (-0)" : "○ Unattempted"}
                      </span>
                    </div>
                    <div className="text-zinc-200 text-xs font-serif">{q.prompt}</div>
                    <div className="pt-2 border-t border-zinc-700/40 text-zinc-300">
                      <span className="text-amber-400 font-bold">Solution: </span>
                      {q.explanation}
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
