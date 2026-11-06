"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Keyboard,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { JuniorInteractiveDiagram } from "@/components/junior/JuniorInteractiveDiagram";
import { FormulaReferenceDrawer } from "@/components/junior/FormulaReferenceDrawer";
import { MathRenderer } from "@/components/math/MathRenderer";
import {
  DifficultyPreference,
  OptionKey,
  PublicAttemptQuestionView,
  StreamSlug,
} from "@/lib/platform-types";
import { createStopwatch } from "@/lib/timing";

interface AttemptPayload {
  attemptId: string;
  status?: "in_progress" | "completed" | "abandoned";
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: DifficultyPreference;
  instantFeedbackEnabled: boolean;
  attemptNumber: number;
  cycleNumber: number;
  questions: PublicAttemptQuestionView[];
  instantFeedbackMap?: Record<
    string,
    { correctOptionKey: OptionKey; explanation: string }
  >;
}

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default function JuniorAttemptPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Record<string, OptionKey>>({});
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const [questionWatch] = useState(() => createStopwatch());

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState(false);

  // Time elapsed in attempt
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/junior/attempts/${resolvedParams.attemptId}`
        );
        const data = (await res.json()) as AttemptPayload & { error?: string };

        if (!res.ok || !data.questions) {
          throw new Error(
            data.error || "This Academy evaluation could not be loaded."
          );
        }

        if (data.status === "completed") {
          router.replace(`/junior/result/${resolvedParams.attemptId}`);
          return;
        }

        if (active) {
          setAttempt(data);
          questionWatch.reset();
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Unable to load attempt."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [resolvedParams.attemptId, router, questionWatch]);

  const currentQuestion = attempt?.questions[currentIndex] || null;

  const handleSelectOption = useCallback(
    (key: OptionKey) => {
      if (!currentQuestion || !attempt) return;
      if (
        attempt.instantFeedbackEnabled &&
        selectedMap[currentQuestion.questionId]
      ) {
        return;
      }

      const elapsed = questionWatch.elapsedMs();
      setSelectedMap((prev) => ({
        ...prev,
        [currentQuestion.questionId]: key,
      }));
      setResponseTimes((prev) => ({
        ...prev,
        [currentQuestion.questionId]:
          (prev[currentQuestion.questionId] || 0) + elapsed,
      }));
      questionWatch.reset();
    },
    [attempt, currentQuestion, questionWatch, selectedMap]
  );

  const navigateSlot = useCallback(
    (nextIdx: number) => {
      if (!attempt) return;
      const clamped = Math.max(0, Math.min(attempt.questions.length - 1, nextIdx));
      setCurrentIndex(clamped);
      questionWatch.reset();
    },
    [attempt, questionWatch]
  );

  // Accessible keyboard shortcuts (1-4 / A-D, Left/Right arrows, F for formulas)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showConfirmModal || isSubmitting || !attempt) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const upper = e.key.toUpperCase();
      if (upper === "F") {
        e.preventDefault();
        setIsFormulaDrawerOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape" && isFormulaDrawerOpen) {
        setIsFormulaDrawerOpen(false);
        return;
      }

      if (upper === "A" || e.key === "1") handleSelectOption("A");
      else if (upper === "B" || e.key === "2") handleSelectOption("B");
      else if (upper === "C" || e.key === "3") handleSelectOption("C");
      else if (upper === "D" || e.key === "4") handleSelectOption("D");
      else if (e.key === "ArrowRight" && currentIndex < attempt.questions.length - 1) {
        navigateSlot(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateSlot(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    attempt,
    currentIndex,
    handleSelectOption,
    isFormulaDrawerOpen,
    isSubmitting,
    navigateSlot,
    showConfirmModal,
  ]);

  const handleConfirmSubmit = async () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const answersPayload = attempt.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: selectedMap[q.questionId] || null,
        responseTimeMs: responseTimes[q.questionId] || null,
      }));

      const res = await fetch(
        `/api/v1/junior/attempts/${attempt.attemptId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersPayload }),
        }
      );

      const data = (await res.json()) as {
        attemptId?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit evaluation responses.");
      }

      router.push(`/junior/result/${attempt.attemptId}`);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Submission failed. Please retry."
      );
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const answeredCount = attempt
    ? attempt.questions.filter((q) => Boolean(selectedMap[q.questionId])).length
    : 0;
  const unansweredCount = attempt ? attempt.questions.length - answeredCount : 0;

  const currentSelectedKey = currentQuestion
    ? selectedMap[currentQuestion.questionId] || null
    : null;
  const currentFeedback =
    attempt?.instantFeedbackEnabled &&
    currentQuestion &&
    currentSelectedKey &&
    attempt.instantFeedbackMap?.[currentQuestion.questionId]
      ? attempt.instantFeedbackMap[currentQuestion.questionId]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0C] text-[#FAF7F2]">
      {/* 1. TOP SCHOLAR EXAMINATION BAR */}
      <header className="sticky top-0 z-30 bg-[#161311]/95 backdrop-blur-md border-b border-[#2C2621] px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Subject Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/junior"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              title="Return to The Academy"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#545E4E]/50">
                <Image
                  src="/brand/emblem-silence.png"
                  alt="The Unwritten"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="font-serif font-bold text-xs tracking-wider text-[#FAF7F2]">
                  THE ACADEMY
                </span>
                <span className="text-[10px] uppercase font-mono text-[#8FA184] block">
                  Scholar&apos;s Desk
                </span>
              </div>
            </Link>

            {attempt && (
              <div className="border-l border-[#2E2822] pl-3 ml-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-[#FAF7F2]">
                    {attempt.subjectName}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-xs bg-[#241F1A] border border-[#3A332B] text-[#A89F93]">
                    {attempt.stream}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center Timer & Progress Counter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1C1815] border border-[#2F2922] rounded-sm px-3 py-1">
              <Clock className="w-3.5 h-3.5 text-[#8FA184]" />
              <span className="font-mono text-xs font-bold text-[#FAF7F2]">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            {attempt && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#A89F93]">
                <span className="text-[#8FA184] font-bold">{answeredCount}</span>
                <span>/</span>
                <span>{attempt.questions.length} answered</span>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {attempt && (
              <button
                type="button"
                onClick={() => setIsFormulaDrawerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm bg-[#221E1A] hover:bg-[#2C2621] border border-[#3A3229] text-[#CFC5B4] hover:text-[#FAF7F2] transition-colors"
                title="Open Formula Drawer (Hotkey: F)"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#8FA184]" />
                <span className="hidden sm:inline">Formulas</span>
                <kbd className="hidden md:inline-block text-[9px] font-mono px-1 bg-[#151311] border border-[#352D24] rounded-xs text-[#8A8178]">
                  F
                </kbd>
              </button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="bg-[#2D4A3E] hover:bg-[#395C4D] text-[#FAF7F2] border-[#4A6E5F]"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Submit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. MAIN EXAMINATION DESK */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#8FA184] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-[0.26em] text-[#8FA184] font-mono">
              Preparing Scholar Folio &amp; Notation
            </p>
          </div>
        ) : errorMsg && !attempt ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-5 bg-[#171412] border border-[#2D2620] rounded-sm p-8">
            <AlertCircle className="w-10 h-10 mx-auto text-[#9E6B68]" />
            <h1 className="font-serif text-2xl text-[#FAF7F2]">
              Evaluation Session Not Found
            </h1>
            <p className="text-xs text-[#A89F93] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <Button size="md" variant="primary">
                Return to Academy Gate
              </Button>
            </Link>
          </div>
        ) : attempt && currentQuestion ? (
          <div className="space-y-6">
            {/* 10-Question Navigation Palette */}
            <div className="bg-[#171412] border border-[#2C2620] rounded-sm p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8178] mr-1 hidden sm:inline">
                  Question Palette:
                </span>
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  role="navigation"
                  aria-label="Question slots"
                >
                  {attempt.questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = Boolean(selectedMap[q.questionId]);
                    return (
                      <button
                        key={q.questionId}
                        type="button"
                        onClick={() => navigateSlot(idx)}
                        aria-label={`Question ${idx + 1}${
                          isAnswered ? " (answered)" : " (unanswered)"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`w-7 h-7 sm:w-8 sm:h-8 text-xs font-mono rounded-sm border transition-all cursor-pointer font-bold ${
                          isCurrent
                            ? "bg-[#8FA184] text-[#12100E] border-[#8FA184] shadow-sm scale-105"
                            : isAnswered
                            ? "bg-[#25382E] text-[#8FA184] border-[#3E5C4B]"
                            : "bg-[#1E1B18] text-[#8A8178] border-[#322A22] hover:border-[#545E4E] hover:text-[#FAF7F2]"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#8A8178]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#25382E] border border-[#3E5C4B]" />
                  <span className="text-[10px]">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1E1B18] border border-[#322A22]" />
                  <span className="text-[10px]">Pending</span>
                </div>
              </div>
            </div>

            {/* Scholar Question Card */}
            <motion.section
              key={currentQuestion.questionId}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#181512] border border-[#332B23] rounded-sm p-6 sm:p-8 space-y-6 shadow-xl"
            >
              {/* Question Header & Syllabus Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C241D] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-xs bg-[#25382E] border border-[#3E5C4B] text-[#8FA184] font-bold">
                      Question {currentIndex + 1} of {attempt.questions.length}
                    </span>
                    <span className="text-xs text-[#A89F93]">
                      Chapter {currentQuestion.chapterNumber}: {currentQuestion.chapter}
                    </span>
                  </div>
                  <div className="text-xs text-[#70685F] font-mono">
                    Topic: {currentQuestion.topic}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-xs bg-[#201C18] border border-[#3A3127] text-[#CFC5B4]">
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text with KaTeX Equations */}
              <div className="text-lg sm:text-xl font-serif text-[#FAF7F2] leading-relaxed">
                <MathRenderer content={currentQuestion.questionText} />
              </div>

              {/* Diagram Rendering (if present) */}
              {currentQuestion.diagramType && (
                <div className="p-4 bg-[#141210] border border-[#2C241D] rounded-sm">
                  <JuniorInteractiveDiagram type={currentQuestion.diagramType} />
                </div>
              )}

              {/* Four Multiple-Choice Options */}
              <div
                role="radiogroup"
                aria-label={`Options for question ${currentIndex + 1}`}
                className="grid grid-cols-1 gap-3 pt-2"
              >
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentSelectedKey === opt.key;
                  const isRevealedCorrect =
                    currentFeedback && currentFeedback.correctOptionKey === opt.key;
                  const isRevealedWrong =
                    currentFeedback &&
                    isSelected &&
                    currentFeedback.correctOptionKey !== opt.key;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-4 sm:p-5 rounded-sm border transition-all flex items-start gap-4 cursor-pointer group ${
                        isRevealedCorrect
                          ? "bg-[#1E3828] border-[#4E8A68] text-[#FAF7F2]"
                          : isRevealedWrong
                          ? "bg-[#3D1E1E] border-[#8A4E4E] text-[#FAF7F2]"
                          : isSelected
                          ? "bg-[#27211B] border-[#8FA184] text-[#FAF7F2] shadow-md ring-1 ring-[#8FA184]"
                          : "bg-[#14120F] hover:bg-[#1C1814] text-[#CFC5B4] hover:text-[#FAF7F2] border-[#2C241D] hover:border-[#42372A]"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-sm border font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "border-[#8FA184] bg-[#8FA184] text-[#12100E]"
                            : "border-[#3A3127] bg-[#1E1B17] text-[#A89F93] group-hover:border-[#545E4E]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed flex-1">
                        <MathRenderer content={opt.text} />
                      </span>
                      <span className="hidden sm:inline-block text-[10px] font-mono text-[#575047] opacity-0 group-hover:opacity-100 transition-opacity">
                        Press [{opt.key}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Guided Feedback (if enabled) */}
              {currentFeedback && (
                <div className="p-4 sm:p-5 bg-[#14120F] border border-[#382F24] rounded-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono tracking-wider">
                    {currentSelectedKey === currentFeedback.correctOptionKey ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#8FA184]" />
                        <span className="text-[#8FA184]">
                          Correct · Option {currentFeedback.correctOptionKey} Validated
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#C96B68]" />
                        <span className="text-[#C96B68]">
                          Incorrect · Master Key: Option {currentFeedback.correctOptionKey}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[#C8BFB4] leading-relaxed">
                    <MathRenderer content={currentFeedback.explanation} />
                  </div>
                </div>
              )}
            </motion.section>

            {/* Navigation & Controls Dock */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => navigateSlot(currentIndex - 1)}
                className="border-[#382E24] text-[#CFC5B4] hover:text-[#FAF7F2] bg-[#171412]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Question
              </Button>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#70685F] hidden md:flex">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts: [1-4 / A-D] to pick · [← / →] to navigate · [F] formulas</span>
              </div>

              <div className="flex items-center gap-3">
                {currentIndex < attempt.questions.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => navigateSlot(currentIndex + 1)}
                    className="bg-[#2D4A3E] hover:bg-[#395C4D] text-[#FAF7F2] border-[#4A6E5F]"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-[#8FA184] hover:bg-[#A3B597] text-[#12100E] font-bold border-transparent"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Review &amp; Submit Folio
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Formula Reference Drawer Component */}
      {attempt && (
        <FormulaReferenceDrawer
          isOpen={isFormulaDrawerOpen}
          onClose={() => setIsFormulaDrawerOpen(false)}
          subjectSlug={attempt.subjectSlug}
          subjectName={attempt.subjectName}
        />
      )}

      {/* Submit Confirmation Dialog */}
      {showConfirmModal && attempt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-dialog-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="max-w-md w-full bg-[#181512] text-[#FAF7F2] border border-[#3E342A] rounded-sm p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#8FA184] font-mono font-bold">
                The Academy Evaluation
              </p>
              <h2
                id="submit-dialog-title"
                className="font-serif text-2xl text-[#FAF7F2]"
              >
                Submit 10-Question Folio?
              </h2>
              <p className="text-xs text-[#A89F93] leading-relaxed">
                You have marked{" "}
                <strong className="text-[#8FA184] font-mono">{answeredCount}</strong> of{" "}
                <strong className="text-[#FAF7F2] font-mono">{attempt.questions.length}</strong>{" "}
                questions in <strong className="text-[#FAF7F2]">{attempt.subjectName}</strong>.
              </p>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 bg-[#3D1E1E]/60 border border-[#8A4E4E] rounded-sm flex items-start gap-2.5 text-xs text-[#FAF7F2]">
                <AlertCircle className="w-4 h-4 text-[#C96B68] shrink-0 mt-0.5" />
                <span>
                  {unansweredCount} question{unansweredCount > 1 ? "s" : ""} remain
                  unanswered. Unanswered questions yield 0 marks.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="bg-[#241F1A] border-[#382E24] text-[#CFC5B4]"
              >
                Continue Reviewing
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleConfirmSubmit()}
                className="bg-[#2D4A3E] hover:bg-[#395C4D] text-[#FAF7F2] border-[#4A6E5F]"
              >
                {isSubmitting ? "Calculating Evaluation..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
