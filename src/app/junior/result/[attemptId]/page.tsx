"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  RotateCcw,
  Share2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { MathRenderer } from "@/components/math/MathRenderer";
import { JuniorAttemptResult } from "@/lib/platform-types";
import { calculateStudentRank } from "@/lib/junior/academy-models";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default function JuniorResultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const prefersReducedMotion = useReducedMotion();

  const [result, setResult] = useState<JuniorAttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "correct">("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/junior/results/${resolvedParams.attemptId}`
        );
        const data = (await res.json()) as JuniorAttemptResult & {
          error?: string;
        };
        if (!res.ok || !data.academicPerformance) {
          throw new Error(
            data.error ||
              "This Academy evaluation could not be loaded or belongs to another session."
          );
        }
        if (active) {
          setResult(data);
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Unable to load evaluation."
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
  }, [resolvedParams.attemptId]);

  const handleShare = async () => {
    if (!result) return;
    const shareSummary = `THE UNWRITTEN · The Academy (${result.subjectName}): ${result.academicPerformance.scoreOutOf10}/10 (${result.academicPerformance.accuracyPct}%) — ${result.descriptiveProfile.title}.`;
    const url = `${window.location.origin}/junior`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `THE UNWRITTEN · ${result.subjectName}`,
          text: shareSummary,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareSummary} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const filteredQuestions = result
    ? result.questionReview.filter((item) => {
        if (reviewFilter === "wrong") return !item.isCorrect;
        if (reviewFilter === "correct") return item.isCorrect;
        return true;
      })
    : [];

  const rank = result
    ? calculateStudentRank(result.academicPerformance.scoreOutOf10 * 100)
    : null;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0F0D0C] text-[#FAF7F2]">
      {/* Background Illustrated Achievement Hall with Dark Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/art/environments/env_junior_achievement_hall.jpg"
          alt="Academy Achievement Hall"
          fill
          priority
          className="object-cover object-center opacity-25 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0D0C]/85 via-[#0F0D0C]/75 to-[#0F0D0C]/95" />
      </div>
      {/* 1. ACADEMY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#161311]/95 backdrop-blur-md border-b border-[#2C2621] px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/junior"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
            title="Return to Academy Hub"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#545E4E]/50">
              <Image
                src="/brand/emblem-silence.png"
                alt="The Unwritten"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-xs tracking-wider text-[#FAF7F2]">
                THE ACADEMY
              </span>
              <span className="text-[10px] uppercase font-mono text-[#8FA184] block">
                Evaluation Monograph
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleShare()}
              className="bg-[#201C18] border-[#382E24] text-[#CFC5B4] hover:text-[#FAF7F2]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-[#8FA184]" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Share Certificate
                </>
              )}
            </Button>

            {result && (
              <Link
                href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
              >
                <Button
                  size="sm"
                  className="bg-[#2D4A3E] hover:bg-[#395C4D] text-[#FAF7F2] border-[#4A6E5F]"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Next 10 Questions
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN EVALUATION CERTIFICATE */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#8FA184] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-[0.26em] text-[#8FA184] font-mono">
              Synthesizing Academic Derivation Monograph
            </p>
          </div>
        ) : errorMsg || !result ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-5 bg-[#171412] border border-[#2D2620] rounded-sm p-8">
            <XCircle className="w-10 h-10 mx-auto text-[#9E6B68]" />
            <h1 className="font-serif text-2xl text-[#FAF7F2]">
              Evaluation Dossier Not Found
            </h1>
            <p className="text-xs text-[#A89F93] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <Button size="md" variant="primary">
                Return to Academy Hub
              </Button>
            </Link>
          </div>
        ) : (
          <motion.article
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* A. MASTER CERTIFICATE PLATE */}
            <section className="bg-[#171411] text-[#FAF7F2] border-2 border-[#4A3D2F] rounded-sm p-6 sm:p-10 relative overflow-hidden shadow-2xl">
              {/* Ornate Inner Border Line */}
              <div
                className="absolute inset-3 border border-[#8FA184]/20 pointer-events-none rounded-xs"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-8">
                {/* Certificate Top Seal */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase font-mono tracking-[0.26em] text-[#8FA184] border-b border-[#2C241D] pb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#8FA184]" />
                    <span>THE UNWRITTEN ACADEMY · EVALUATION CERTIFICATE</span>
                  </div>
                  <span className="text-[#A89F93]">
                    Candidate: <strong className="text-[#FAF7F2]">{result.participantName}</strong>
                  </span>
                </div>

                {/* Main Score Plate & Scholar Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Score Box */}
                  <div className="md:col-span-5 p-6 bg-[#13110E] border border-[#3E342A] rounded-sm text-center space-y-3">
                    <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border border-[#545E4E]/60 mb-2">
                      <Image
                        src="/art/characters/junior_student.png"
                        alt="The Scholar"
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#A89F93] block">
                      {result.subjectName} · Attempt #{result.attemptNumber}
                    </span>

                    <div className="font-serif text-5xl sm:text-6xl text-[#FAF7F2] leading-none py-1 font-bold">
                      {result.academicPerformance.scoreOutOf10}
                      <span className="text-2xl text-[#8A8178] font-normal"> / 10</span>
                    </div>

                    <div className="pt-2 border-t border-[#26201A] space-y-1">
                      <p className="font-mono text-xs text-[#8FA184] font-bold">
                        {result.academicPerformance.accuracyPct}% Precision Accuracy
                      </p>
                      <p className="text-[11px] text-[#A89F93] font-mono">
                        {result.academicPerformance.correctAnswers} Correct ·{" "}
                        {result.academicPerformance.incorrectAnswers} Incorrect
                      </p>
                      {rank && (
                        <div className="inline-block px-2.5 py-0.5 rounded-xs bg-[#241F1A] border border-[#3E352B] text-[10px] uppercase font-mono text-[#E5D7C0] mt-1">
                          Rank: {rank.title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Narrative Monograph */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-xs bg-[#25382E] border border-[#3E5C4B] text-[#8FA184] font-bold">
                        {result.stream} Stream Folio
                      </span>
                      <span className="text-xs text-[#70685F] font-mono">
                        Cycle {result.cycleNumber} · {result.difficultyPreference}
                      </span>
                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] leading-tight font-bold">
                      {result.descriptiveProfile.title}
                    </h1>

                    <p className="font-serif italic text-base text-[#D6CEC0]">
                      {result.descriptiveProfile.subtitle}
                    </p>

                    <p className="text-xs text-[#A89F93] leading-relaxed font-sans">
                      {result.descriptiveProfile.narrative}
                    </p>
                  </div>
                </div>

                {/* Certificate Footer Metadata */}
                <div className="pt-4 border-t border-[#2C241D] flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-[#70685F]">
                  <span>
                    Deterministic Scoring Engine v{result.scoringAlgorithmVersion} · MSBSHSE / NCERT 2026
                  </span>
                  <span>
                    Zero-Repeat Question Bank Cycle Guarantee Active
                  </span>
                </div>
              </div>
            </section>

            {/* B. STREAM REASONING INDICATORS */}
            <section className="space-y-4">
              <div className="border-b border-[#2C241D] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#FAF7F2] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#8FA184]" />
                  <span>Cognitive &amp; Academic Ability Dimensions</span>
                </h2>
                <span className="text-[10px] uppercase font-mono text-[#70685F]">
                  Dimension Mastery Matrix
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.abilityIndicators.map((ind) => (
                  <div
                    key={ind.key}
                    className="p-5 bg-[#171412] border border-[#2D2620] rounded-sm space-y-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
                        {ind.label}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded-xs border ${
                          ind.qualitativeBand === "Strong"
                            ? "bg-[#25382E] border-[#3E5C4B] text-[#8FA184] font-bold"
                            : ind.qualitativeBand === "Consistent"
                            ? "bg-[#221E19] border-[#382F24] text-[#CFC5B4]"
                            : ind.qualitativeBand === "Developing"
                            ? "bg-[#3D1E1E] border-[#8A4E4E] text-[#C96B68]"
                            : "bg-[#181512] border-[#2C241D] text-[#70685F]"
                        }`}
                      >
                        {ind.qualitativeBand}
                      </span>
                    </div>

                    <p className="text-xs text-[#A89F93] leading-relaxed">
                      {ind.supportingEvidenceSummary}
                    </p>

                    {ind.scorePct !== null ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full h-1.5 bg-[#201C18] rounded-full overflow-hidden border border-[#2C251E]">
                          <div
                            className="h-full bg-[#8FA184]"
                            style={{ width: `${ind.scorePct}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-[#70685F]">
                          {ind.correctMappedCount}/{ind.mappedQuestionsCount} items correct ({ind.scorePct}%)
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#70685F]">{ind.displayStatus}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* C. SYLLABUS CHAPTER BREAKDOWN */}
            <section className="space-y-4">
              <div className="border-b border-[#2C241D] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#FAF7F2] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#8FA184]" />
                  <span>Syllabus Chapter Mastery Breakdown</span>
                </h2>
                <span className="text-[10px] uppercase font-mono text-[#70685F]">
                  {result.subjectName} Chapters Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.academicPerformance.chapterBreakdown.map((ch) => (
                  <div
                    key={`${ch.chapterNumber}-${ch.chapter}`}
                    className="p-4 bg-[#171412] border border-[#2D2620] rounded-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8FA184] block font-bold">
                        Chapter {ch.chapterNumber}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#FAF7F2]">
                        {ch.chapter}
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-sm font-bold text-[#FAF7F2] block">
                        {ch.correct} / {ch.attempted}
                      </span>
                      <span className="text-[10px] text-[#8A8178]">
                        {ch.accuracyPct}% accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* D. QUESTION DERIVATION REVIEW SECTION */}
            <section className="space-y-4">
              <div className="border-b border-[#2C241D] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl text-[#FAF7F2]">
                  Question &amp; Derivation Monograph
                </h2>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReviewFilter("all")}
                    className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
                      reviewFilter === "all"
                        ? "bg-[#FAF7F2] text-[#12100E] border-[#FAF7F2] font-bold"
                        : "bg-[#171412] text-[#A89F93] border-[#2C241D] hover:border-[#42372A]"
                    }`}
                  >
                    All (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("wrong")}
                    className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
                      reviewFilter === "wrong"
                        ? "bg-[#8A4E4E] text-[#FAF7F2] border-[#8A4E4E] font-bold"
                        : "bg-[#171412] text-[#A89F93] border-[#2C241D] hover:border-[#42372A]"
                    }`}
                  >
                    Incorrect ({result.academicPerformance.incorrectAnswers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("correct")}
                    className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
                      reviewFilter === "correct"
                        ? "bg-[#3E5C4B] text-[#FAF7F2] border-[#3E5C4B] font-bold"
                        : "bg-[#171412] text-[#A89F93] border-[#2C241D] hover:border-[#42372A]"
                    }`}
                  >
                    Correct ({result.academicPerformance.correctAnswers})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-5 sm:p-6 bg-[#171412] border border-[#2D2620] rounded-sm space-y-4"
                  >
                    {/* Item Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#25201A] pb-3">
                      <span className="font-mono text-[11px] text-[#A89F93]">
                        Q{String(item.slotNumber).padStart(2, "0")} · {item.chapter} ({item.difficulty})
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8FA184]">
                          <CheckCircle2 className="w-4 h-4 text-[#8FA184]" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C96B68]">
                          <XCircle className="w-4 h-4 text-[#C96B68]" />
                          {item.selectedOptionKey ? "Incorrect Choice" : "Unanswered"}
                        </span>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="font-serif text-base sm:text-lg text-[#FAF7F2] leading-snug">
                      <MathRenderer content={item.questionText} />
                    </div>

                    {/* User Selection vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 rounded-sm border ${
                          item.isCorrect
                            ? "bg-[#1A2E22] border-[#3E5C4B]"
                            : "bg-[#2E1818] border-[#8A4E4E]"
                        }`}
                      >
                        <span className="block text-[10px] uppercase font-mono tracking-wider text-[#A89F93]">
                          Candidate Selection
                        </span>
                        <div className="font-medium text-[#FAF7F2] mt-1">
                          {item.selectedOptionKey ? (
                            <span>
                              [{item.selectedOptionKey}]{" "}
                              <MathRenderer content={item.selectedOptionText || ""} />
                            </span>
                          ) : (
                            <span className="italic text-[#70685F]">No option submitted</span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-sm border bg-[#1A2E22] border-[#3E5C4B]">
                        <span className="block text-[10px] uppercase font-mono tracking-wider text-[#8FA184]">
                          Verified Master Key
                        </span>
                        <div className="font-medium text-[#FAF7F2] mt-1">
                          <span>
                            [{item.correctOptionKey}]{" "}
                            <MathRenderer content={item.correctOptionText} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Derivation / Pedagogical Explanation */}
                    <div className="p-4 bg-[#13110E] border border-[#26201A] rounded-sm space-y-1.5 text-xs">
                      <div className="text-[#CFC5B4] leading-relaxed">
                        <strong className="text-[#8FA184] mr-1.5 font-mono">Derivation:</strong>
                        <MathRenderer content={item.explanation} />
                      </div>
                      <p className="text-[11px] text-[#70685F] font-mono pt-1">
                        Reference: {item.syllabusReference}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* E. FOOTER ACTIONS & NOTICE */}
            <div className="p-6 bg-[#171412] border border-[#2D2620] rounded-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#FAF7F2]">
                  Ready for Cycle #{result.cycleNumber + 1}?
                </h4>
                <p className="text-xs text-[#A89F93]">
                  Next 10 unseen questions guaranteed from the 100-question subject reservoir.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/junior">
                  <Button variant="secondary" size="md" className="bg-[#201C18] border-[#382E24] text-[#CFC5B4]">
                    Academy Entrance
                  </Button>
                </Link>
                <Link
                  href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[#2D4A3E] hover:bg-[#395C4D] text-[#FAF7F2] border-[#4A6E5F]"
                  >
                    <span>Begin Next 10 Questions</span>
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
