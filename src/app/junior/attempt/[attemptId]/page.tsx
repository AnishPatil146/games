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

  const getSubjectBackground = (subjectSlug?: string) => {
    if (!subjectSlug) return "/art/environments/env_junior_exam_hall.jpg";
    const sid = subjectSlug.toLowerCase();
    if (sid.includes("math")) return "/art/environments/env_junior_math_lab.jpg";
    if (sid.includes("physics")) return "/art/environments/env_junior_physics_lab.jpg";
    if (sid.includes("chem")) return "/art/environments/env_junior_chemistry_lab.jpg";
    if (sid.includes("bio")) return "/art/environments/env_junior_biology_lab.jpg";
    if (sid.includes("hist") || sid.includes("geo") || sid.includes("eco"))
      return "/art/environments/env_junior_grand_library.jpg";
    return "/art/environments/env_junior_exam_hall.jpg";
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0F0D0C] text-[#FAF7F2]">
      {/* Background Illustrated Environment with Dark Film Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={getSubjectBackground(attempt?.subjectSlug)}
          alt="Academy Environment"
          fill
          priority
          className="object-cover object-center opacity-30 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12100E]/90 via-[#181411]/85 to-[#12100E]/95" />
      </div>
      {/* 1. TOP SCHOLAR EXAMINATION BAR */}
      <header className="sticky top-0 z-30 bg-[#181512]/98 backdrop-blur-md border-b-2 border-[#3D3328] px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Subject Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/junior"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              title="Return to The Academy"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#8FA184]/70 shadow-sm">
                <Image
                  src="/brand/emblem-silence.png"
                  alt="The Unwritten"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="font-serif font-black text-xs tracking-wider text-white">
                  THE ACADEMY
                </span>
                <span className="text-[10px] uppercase font-mono text-[#A8D49E] block font-bold">
                  Scholar&apos;s Desk
                </span>
              </div>
            </Link>

            {attempt && (
              <div className="border-l-2 border-[#3D3328] pl-3 ml-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm sm:text-base text-white">
                    {attempt.subjectName}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-[#2D241C] border border-[#544535] text-white font-bold">
                    {attempt.stream}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center Timer & Progress Counter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#241E18] border-2 border-[#4E4133] rounded-sm px-3.5 py-1 shadow-sm">
              <Clock className="w-4 h-4 text-[#A8D49E]" />
              <span className="font-mono text-xs font-black text-white">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            {attempt && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#DDD4C5] font-semibold">
                <span className="text-emerald-400 font-extrabold">{answeredCount}</span>
                <span>/</span>
                <span>{attempt.questions.length} answered</span>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {attempt && (
              <button
                type="button"
                onClick={() => setIsFormulaDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm bg-[#2A231C] hover:bg-[#342B24] border-2 border-[#4E4133] text-white font-bold transition-colors cursor-pointer shadow-sm"
                title="Open Formula Drawer (Hotkey: F)"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#A8D49E]" />
                <span className="hidden sm:inline">Formulas</span>
                <kbd className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-[#171310] border border-[#544535] rounded-xs text-[#DDD4C5]">
                  F
                </kbd>
              </button>
            )}

            <Button
              type="button"
              variant="academy"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="border-2 border-white/20 shadow-md font-black"
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
          <div className="max-w-md mx-auto py-24 text-center space-y-5 bg-[#1C1814] border-2 border-[#4E4133] rounded-md p-8 shadow-2xl">
            <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
            <h1 className="font-serif text-2xl text-white font-bold">
              Evaluation Session Not Found
            </h1>
            <p className="text-sm text-[#DDD4C5] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <Button size="md" variant="primary">
                Return to Academy Gate
              </Button>
            </Link>
          </div>
        ) : attempt && currentQuestion ? (
          <div className="space-y-6">
            {/* 10-Question Navigation Palette */}
            <div className="bg-[#211C18]/98 backdrop-blur-md border-2 border-[#544535] rounded-md p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-extrabold mr-1 hidden sm:inline">
                  Question Palette:
                </span>
                <div
                  className="flex flex-wrap items-center gap-2"
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
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-xs font-mono rounded-sm transition-all cursor-pointer font-black ${
                          isCurrent
                            ? "bg-[#8FA184] text-[#12100E] border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-110"
                            : isAnswered
                            ? "bg-[#254A34] text-[#A6E8BA] border-2 border-[#4E8260] hover:scale-105"
                            : "bg-[#2D2620] text-white border-2 border-[#544535] hover:border-white hover:scale-105"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#254A34] border border-[#4E8260]" />
                  <span className="text-xs text-[#A6E8BA] font-bold">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#2D2620] border border-[#544535]" />
                  <span className="text-xs text-[#DDD4C5] font-semibold">Pending</span>
                </div>
              </div>
            </div>

            {/* Scholar Question Card */}
            <motion.section
              key={currentQuestion.questionId}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1E1A16]/98 backdrop-blur-md border-2 border-[#60503E] rounded-md p-6 sm:p-8 space-y-6 shadow-2xl ring-1 ring-white/10"
            >
              {/* Question Header & Syllabus Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3D3328] pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase font-mono tracking-wider px-3 py-1 rounded-sm bg-[#22402F] border border-[#3F6E51] text-[#9FE3B5] font-black">
                      Question {currentIndex + 1} of {attempt.questions.length}
                    </span>
                    <span className="text-base font-bold text-white">
                      Chapter {currentQuestion.chapterNumber}: {currentQuestion.chapter}
                    </span>
                  </div>
                  <div className="text-xs text-[#DDD4C5] font-mono">
                    Topic: <span className="text-white font-bold">{currentQuestion.topic}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs uppercase tracking-wider font-mono px-3 py-1 rounded-sm font-black border-2 ${
                    currentQuestion.difficulty === "Hard"
                      ? "bg-amber-950/80 border-amber-500 text-amber-200"
                      : currentQuestion.difficulty === "Medium"
                      ? "bg-blue-950/80 border-blue-500 text-blue-200"
                      : "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text with KaTeX Equations */}
              <div className="text-lg sm:text-xl font-serif text-white leading-relaxed tracking-wide font-normal py-1">
                <MathRenderer content={currentQuestion.questionText} />
              </div>

              {/* Diagram Rendering (if present) */}
              {currentQuestion.diagramType && (
                <div className="p-4 bg-[#14110E] border-2 border-[#4E4133] rounded-md">
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
                      className={`w-full text-left p-4 sm:p-5 rounded-md border-2 transition-all flex items-start gap-4 cursor-pointer group shadow-lg ${
                        isRevealedCorrect
                          ? "bg-[#163824] border-emerald-400 text-white shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                          : isRevealedWrong
                          ? "bg-[#421A1A] border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                          : isSelected
                          ? "bg-[#2B281F] border-emerald-400 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/50"
                          : "bg-[#241E19] hover:bg-[#302720] text-white border-[#544535] hover:border-[#8FA184]"
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-sm border-2 font-mono text-sm font-black flex items-center justify-center shrink-0 mt-0.5 transition-all shadow-sm ${
                          isSelected
                            ? "border-white bg-emerald-400 text-[#12100E]"
                            : "border-[#6E5D4A] bg-[#332A22] text-white group-hover:border-[#8FA184] group-hover:bg-[#40352A]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-base sm:text-lg leading-relaxed flex-1 text-white font-medium">
                        <MathRenderer content={opt.text} />
                      </span>
                      <span className="hidden sm:inline-block text-xs font-mono text-[#DDD4C5] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        Press [{opt.key}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Guided Feedback (if enabled) */}
              {currentFeedback && (
                <div className="p-5 sm:p-6 bg-[#161310] border-2 border-[#544535] rounded-md space-y-2.5 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono tracking-wider">
                    {currentSelectedKey === currentFeedback.correctOptionKey ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-black">
                          Correct · Option {currentFeedback.correctOptionKey} Validated
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-rose-300 font-black">
                          Incorrect · Master Key: Option {currentFeedback.correctOptionKey}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm sm:text-base text-white leading-relaxed font-sans">
                    <MathRenderer content={currentFeedback.explanation} />
                  </div>
                </div>
              )}
            </motion.section>

            {/* Navigation & Controls Dock */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 pb-6">
              <Button
                type="button"
                variant="custom"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => navigateSlot(currentIndex - 1)}
                className={`font-mono font-bold px-5 py-2.5 rounded-sm transition-all border-2 flex items-center ${
                  currentIndex === 0
                    ? "bg-[#1E1915] border-[#382E24] text-[#70685F] cursor-not-allowed opacity-40"
                    : "bg-[#2A231C] border-[#6E5943] text-white hover:bg-[#382F26] hover:border-white shadow-md cursor-pointer"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Question
              </Button>

              <div className="flex items-center gap-2 text-xs font-mono text-white bg-[#26201B] border-2 border-[#544535] px-3.5 py-1.5 rounded-full hidden md:flex font-medium shadow-sm">
                <Keyboard className="w-4 h-4 text-[#A8D49E]" />
                <span>Shortcuts: [1-4 / A-D] to pick · [← / →] to navigate · [F] formulas</span>
              </div>

              <div className="flex items-center gap-3">
                {currentIndex < attempt.questions.length - 1 ? (
                  <Button
                    type="button"
                    variant="academy-action"
                    size="md"
                    onClick={() => navigateSlot(currentIndex + 1)}
                    className="font-black font-mono border-2 border-white/60 shadow-xl px-6 py-2.5 text-sm"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="academy"
                    size="md"
                    onClick={() => setShowConfirmModal(true)}
                    className="font-black font-mono border-2 border-white/40 shadow-xl px-6 py-2.5 text-sm"
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
          <div className="max-w-md w-full bg-[#1C1814] text-[#FAF7F2] border-2 border-[#544535] rounded-md p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[#A8D49E] font-mono font-black">
                The Academy Evaluation
              </p>
              <h2
                id="submit-dialog-title"
                className="font-serif text-2xl text-white font-extrabold"
              >
                Submit 10-Question Folio?
              </h2>
              <p className="text-sm text-[#DDD4C5] leading-relaxed">
                You have marked{" "}
                <strong className="text-emerald-400 font-mono font-black">{answeredCount}</strong> of{" "}
                <strong className="text-white font-mono font-black">{attempt.questions.length}</strong>{" "}
                questions in <strong className="text-white font-bold">{attempt.subjectName}</strong>.
              </p>
            </div>

            {unansweredCount > 0 && (
              <div className="p-4 bg-[#421A1A] border-2 border-rose-400 rounded-sm flex items-start gap-3 text-xs text-white shadow-md">
                <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="font-bold text-rose-200">{unansweredCount} question{unansweredCount > 1 ? "s" : ""}</strong> remain
                  unanswered. Unanswered questions yield 0 marks.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="academy-secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
              >
                Continue Reviewing
              </Button>
              <Button
                type="button"
                variant="academy"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleConfirmSubmit()}
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
