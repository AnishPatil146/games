"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Send,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { JuniorInteractiveDiagram } from "@/components/junior/JuniorInteractiveDiagram";
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
            data.error || "This Junior Mode attempt could not be opened."
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
      // In Guided Instant Feedback mode, lock option once chosen so feedback stays honest
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

  // Accessible keyboard shortcuts (1-4 / A-D & Left/Right arrows)
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
        throw new Error(data.error || "Unable to submit challenge responses.");
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-6 h-6 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8178]">
              Preparing 10-Question Folio
            </p>
          </div>
        ) : errorMsg && !attempt ? (
          <div className="max-w-lg mx-auto py-20 text-center space-y-5">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#9E6B68]">
              Session Verification Required
            </p>
            <h1 className="font-serif text-3xl text-[#1C1917]">
              Challenge could not be opened.
            </h1>
            <p className="text-sm text-[#57524C] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <Button size="md">Return to Junior Studio</Button>
            </Link>
          </div>
        ) : attempt && currentQuestion ? (
          <div className="space-y-8">
            {/* Top Context Masthead */}
            <header className="space-y-4 border-b border-[#DDD4C5] pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
                <span>
                  {attempt.stream} · {attempt.subjectName}
                </span>
                <span>
                  Attempt #{attempt.attemptNumber} · Cycle {attempt.cycleNumber} ·{" "}
                  {attempt.difficultyPreference}
                </span>
              </div>

              {/* 10-Slot Navigator & Progress Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                        className={`w-8 h-8 text-xs font-mono rounded-sm border transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                            : isAnswered
                            ? "bg-[#545E4E]/15 text-[#1C1917] border-[#545E4E]"
                            : "bg-[#F3EDE2] text-[#8A8178] border-[#DDD4C5] hover:border-[#8A8178]"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>

                <span className="font-mono text-xs text-[#57524C]">
                  {answeredCount} / {attempt.questions.length} Answered
                </span>
              </div>
            </header>

            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 bg-[#9E6B68]/12 border border-[#9E6B68] rounded-sm text-xs text-[#1C1917]"
              >
                {errorMsg}
              </div>
            )}

            {/* Active Question Card */}
            <motion.section
              key={currentQuestion.questionId}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm p-6 sm:p-9 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#E5DEC9] pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold block">
                    Question {currentIndex + 1} of {attempt.questions.length} ·
                    Chapter {currentQuestion.chapterNumber}:{" "}
                    {currentQuestion.chapter}
                  </span>
                  <span className="text-xs text-[#8A8178]">
                    Topic: {currentQuestion.topic}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-[10px] uppercase tracking-[0.18em] text-[#57524C]">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h1 className="font-serif text-xl sm:text-2xl md:text-[1.65rem] text-[#1C1917] leading-snug">
                <MathRenderer content={currentQuestion.questionText} />
              </h1>

              {currentQuestion.diagramType && (
                <JuniorInteractiveDiagram type={currentQuestion.diagramType} />
              )}

              {/* Four Shuffled Options */}
              <div
                role="radiogroup"
                aria-label={`Options for question ${currentIndex + 1}`}
                className="grid grid-cols-1 gap-3 pt-1"
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
                      className={`w-full text-left p-4 sm:p-5 rounded-sm border transition-all flex items-start gap-4 cursor-pointer ${
                        isRevealedCorrect
                          ? "bg-[#545E4E]/15 border-[#545E4E] text-[#1C1917]"
                          : isRevealedWrong
                          ? "bg-[#9E6B68]/15 border-[#9E6B68] text-[#1C1917]"
                          : isSelected
                          ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                          : "bg-[#F3EDE2]/60 hover:bg-[#F3EDE2] text-[#1C1917] border-[#DDD4C5]"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-sm border font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected && !currentFeedback
                            ? "border-[#FAF7F2]/40 bg-[#FAF7F2]/10 text-[#FAF7F2]"
                            : "border-[#CFC5B4] bg-[#FAF7F2] text-[#1C1917]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed flex-1">
                        <MathRenderer content={opt.text} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Guided Study Instant Feedback */}
              {currentFeedback && (
                <div className="p-4 sm:p-5 bg-[#F3EDE2] border border-[#CFC5B4] rounded-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    {currentSelectedKey === currentFeedback.correctOptionKey ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#545E4E]" />
                        <span className="text-[#545E4E]">
                          Correct ({currentFeedback.correctOptionKey})
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#9E6B68]" />
                        <span className="text-[#9E6B68]">
                          Correct Key: Option {currentFeedback.correctOptionKey}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[#1C1917] leading-relaxed">
                    <MathRenderer content={currentFeedback.explanation} />
                  </div>
                </div>
              )}
            </motion.section>

            {/* Navigation & Submit Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => navigateSlot(currentIndex - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentIndex < attempt.questions.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => navigateSlot(currentIndex + 1)}
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant={
                    currentIndex === attempt.questions.length - 1
                      ? "primary"
                      : "secondary"
                  }
                  size="md"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Review &amp; Submit
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && attempt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-dialog-title"
          className="fixed inset-0 z-50 bg-[#12100E]/70 backdrop-blur-xs flex items-center justify-center p-5"
        >
          <div className="max-w-md w-full bg-[#FAF7F2] text-[#1C1917] border border-[#CFC5B4] rounded-sm p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#545E4E] font-semibold">
                Confirm Evaluation
              </p>
              <h2
                id="submit-dialog-title"
                className="font-serif text-2xl text-[#1C1917]"
              >
                Submit your 10-question attempt?
              </h2>
              <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                You have answered{" "}
                <strong className="text-[#1C1917]">{answeredCount}</strong> of{" "}
                <strong className="text-[#1C1917]">
                  {attempt.questions.length}
                </strong>{" "}
                questions in {attempt.subjectName}.
              </p>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 bg-[#9E6B68]/12 border border-[#9E6B68] rounded-sm flex items-start gap-2.5 text-xs text-[#1C1917]">
                <AlertCircle className="w-4 h-4 text-[#9E6B68] shrink-0 mt-0.5" />
                <span>
                  {unansweredCount} question{unansweredCount > 1 ? "s" : ""}{" "}
                  remain unanswered and will be marked incorrect if submitted
                  now.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
              >
                Continue Reviewing
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleConfirmSubmit()}
              >
                {isSubmitting ? "Evaluating..." : "Submit Attempt"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

