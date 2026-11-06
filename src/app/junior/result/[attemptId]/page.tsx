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
    <div className="relative min-h-screen flex flex-col bg-[#100E0D] text-[#FAF7F2]">
      {/* Background Illustrated Achievement Hall with Atmospheric Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/art/environments/env_junior_achievement_hall.jpg"
          alt="Academy Achievement Hall"
          fill
          priority
          className="object-cover object-center opacity-30 filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12100E]/90 via-[#181411]/80 to-[#12100E]/95" />
      </div>
      {/* 1. ACADEMY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#181512]/98 backdrop-blur-md border-b-2 border-[#3D3328] px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/junior"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            title="Return to Academy Hub"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#8FA184]/70 shadow-sm">
              <Image
                src="/brand/emblem-silence.png"
                alt="The Unwritten"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-serif font-black text-sm tracking-wider text-white">
                THE ACADEMY
              </span>
              <span className="text-[11px] uppercase font-mono text-[#A8D49E] block font-bold">
                Evaluation Monograph
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleShare()}
              className="bg-[#26201B] border-2 border-[#4E4133] text-white hover:bg-[#342B24] font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Copied Summary
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1.5 text-[#A8D49E]" />
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
                  className="bg-[#2D5A47] hover:bg-[#386D56] text-white font-bold border-2 border-white/20 shadow-md"
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
          <div className="max-w-md mx-auto py-24 text-center space-y-5 bg-[#1C1814] border-2 border-[#4E4133] rounded-md p-8 shadow-2xl">
            <XCircle className="w-10 h-10 mx-auto text-rose-400" />
            <h1 className="font-serif text-2xl text-white font-bold">
              Evaluation Dossier Not Found
            </h1>
            <p className="text-sm text-[#DDD4C5] leading-relaxed">{errorMsg}</p>
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
            <section className="bg-[#1C1814]/98 text-[#FAF7F2] border-2 border-[#6B5742] rounded-md p-6 sm:p-10 relative overflow-hidden shadow-2xl ring-1 ring-amber-500/20">
              {/* Ornate Inner Border Line */}
              <div
                className="absolute inset-3 border border-[#8FA184]/40 pointer-events-none rounded-sm"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-8">
                {/* Certificate Top Seal */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase font-mono tracking-[0.2em] text-[#A6C49B] border-b-2 border-[#3D3328] pb-4 font-bold">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#8FA184]" />
                    <span>THE UNWRITTEN ACADEMY · EVALUATION CERTIFICATE</span>
                  </div>
                  <span className="text-[#DDD4C5]">
                    Candidate: <strong className="text-white font-black text-sm bg-[#2B231B] px-3 py-1 rounded border border-[#4E3E2E] ml-1">{result.participantName}</strong>
                  </span>
                </div>

                {/* Main Score Plate & Scholar Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Score Box */}
                  <div className="md:col-span-5 p-6 sm:p-7 bg-[#231E18] border-2 border-[#544535] rounded-md text-center space-y-3.5 shadow-xl">
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#8FA184] shadow-md mb-2">
                      <Image
                        src="/art/characters/junior_student.png"
                        alt="The Scholar"
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <span className="text-xs uppercase font-mono tracking-wider text-[#DDD4C5] block font-bold">
                      {result.subjectName} · Attempt #{result.attemptNumber}
                    </span>

                    <div className="font-serif text-5xl sm:text-6xl text-white font-black leading-none py-1 drop-shadow-md">
                      {result.academicPerformance.scoreOutOf10}
                      <span className="text-2xl text-[#C8BFB4] font-medium"> / 10</span>
                    </div>

                    <div className="pt-3 border-t-2 border-[#3D3328] space-y-2">
                      <p className="font-mono text-sm text-[#A6E8BA] font-extrabold">
                        {result.academicPerformance.accuracyPct}% Precision Accuracy
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#1B3625] text-emerald-300 font-bold border border-emerald-600/50">
                          {result.academicPerformance.correctAnswers} Correct
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#381B1B] text-rose-300 font-bold border border-rose-600/50">
                          {result.academicPerformance.incorrectAnswers} Incorrect
                        </span>
                      </div>
                      {rank && (
                        <div className="inline-block px-3.5 py-1 rounded-sm bg-gradient-to-r from-[#332A20] to-[#42372A] border border-[#7A664F] text-xs uppercase font-mono text-[#F7E7CD] font-extrabold shadow-sm mt-2">
                          Rank: {rank.title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Narrative Monograph */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase font-mono tracking-wider px-3 py-1 rounded-sm bg-[#22402F] border border-[#3F6E51] text-[#9FE3B5] font-black">
                        {result.stream} Stream Folio
                      </span>
                      <span className="text-xs text-[#DDD4C5] font-mono font-semibold bg-[#26201A] px-2.5 py-1 rounded border border-[#44382C]">
                        Cycle {result.cycleNumber} · {result.difficultyPreference}
                      </span>
                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl text-white leading-tight font-extrabold tracking-wide">
                      {result.descriptiveProfile.title}
                    </h1>

                    <p className="font-serif italic text-base sm:text-lg text-[#F2E8DC] font-medium leading-snug">
                      {result.descriptiveProfile.subtitle}
                    </p>

                    <p className="text-sm sm:text-base text-[#E5DCD0] leading-relaxed font-sans">
                      {result.descriptiveProfile.narrative}
                    </p>
                  </div>
                </div>

                {/* Certificate Footer Metadata */}
                <div className="pt-4 border-t-2 border-[#3D3328] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#C8BFB4] font-medium">
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
              <div className="border-b-2 border-[#3D3328] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-extrabold flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-[#8FA184]" />
                  <span>Cognitive &amp; Academic Ability Dimensions</span>
                </h2>
                <span className="text-xs uppercase font-mono text-[#C8BFB4] font-semibold">
                  Dimension Mastery Matrix
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.abilityIndicators.map((ind) => (
                  <div
                    key={ind.key}
                    className="p-5 sm:p-6 bg-[#211C18] border-2 border-[#4E4133] rounded-md space-y-3.5 shadow-lg hover:border-[#6B5A47] transition-all"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif font-extrabold text-base sm:text-lg text-white">
                        {ind.label}
                      </h3>
                      <span
                        className={`px-2.5 py-1 text-xs uppercase font-mono font-black rounded-xs border-2 ${
                          ind.qualitativeBand === "Strong"
                            ? "bg-[#1E422C] border-emerald-400 text-emerald-200"
                            : ind.qualitativeBand === "Consistent"
                            ? "bg-[#3D3322] border-amber-400 text-amber-200"
                            : ind.qualitativeBand === "Developing"
                            ? "bg-[#4A1E1E] border-rose-400 text-rose-200"
                            : "bg-[#2A241F] border-stone-500 text-stone-200"
                        }`}
                      >
                        {ind.qualitativeBand}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#E2D9CD] leading-relaxed">
                      {ind.supportingEvidenceSummary}
                    </p>

                    {ind.scorePct !== null ? (
                      <div className="space-y-2 pt-1">
                        <div className="w-full h-2 bg-[#141210] rounded-full overflow-hidden border border-[#44382C]">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-[#8FA184]"
                            style={{ width: `${ind.scorePct}%` }}
                          />
                        </div>
                        <p className="text-xs font-mono text-[#DDD4C5] font-semibold">
                          {ind.correctMappedCount}/{ind.mappedQuestionsCount} items correct ({ind.scorePct}%)
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#DDD4C5]">{ind.displayStatus}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* C. SYLLABUS CHAPTER BREAKDOWN */}
            <section className="space-y-4">
              <div className="border-b-2 border-[#3D3328] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-extrabold flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-[#8FA184]" />
                  <span>Syllabus Chapter Mastery Breakdown</span>
                </h2>
                <span className="text-xs uppercase font-mono text-[#C8BFB4] font-semibold">
                  {result.subjectName} Chapters Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.academicPerformance.chapterBreakdown.map((ch) => (
                  <div
                    key={`${ch.chapterNumber}-${ch.chapter}`}
                    className="p-4 sm:p-5 bg-[#211C18] border-2 border-[#4E4133] rounded-md flex items-center justify-between gap-4 shadow-md hover:border-[#6B5A47] transition-all"
                  >
                    <div>
                      <span className="text-xs font-mono uppercase text-[#A8D49E] block font-extrabold tracking-wider">
                        Chapter {ch.chapterNumber}
                      </span>
                      <span className="font-serif font-bold text-base text-white mt-0.5 block">
                        {ch.chapter}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-base sm:text-lg font-black text-white block">
                        {ch.correct} / {ch.attempted}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#DDD4C5] mt-0.5 block">
                        {ch.accuracyPct}% accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* D. QUESTION DERIVATION REVIEW SECTION */}
            <section className="space-y-4">
              <div className="border-b-2 border-[#3D3328] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-extrabold">
                  Question &amp; Derivation Monograph
                </h2>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewFilter("all")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm border-2 transition-all cursor-pointer ${
                      reviewFilter === "all"
                        ? "bg-white text-[#12100E] border-white font-black shadow-md"
                        : "bg-[#241F1A] text-[#DDD4C5] border-[#4E4133] hover:border-white hover:text-white font-bold"
                    }`}
                  >
                    All (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("wrong")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm border-2 transition-all cursor-pointer ${
                      reviewFilter === "wrong"
                        ? "bg-rose-600 text-white border-rose-300 font-black shadow-md"
                        : "bg-[#241F1A] text-[#FFB3B3] border-[#4E4133] hover:border-rose-400 font-bold"
                    }`}
                  >
                    Incorrect ({result.academicPerformance.incorrectAnswers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("correct")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm border-2 transition-all cursor-pointer ${
                      reviewFilter === "correct"
                        ? "bg-emerald-600 text-white border-emerald-300 font-black shadow-md"
                        : "bg-[#241F1A] text-[#A8E2B8] border-[#4E4133] hover:border-emerald-400 font-bold"
                    }`}
                  >
                    Correct ({result.academicPerformance.correctAnswers})
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {filteredQuestions.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-6 sm:p-7 bg-[#1F1A16] border-2 border-[#544535] rounded-md space-y-5 shadow-xl"
                  >
                    {/* Item Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b-2 border-[#3D3328] pb-3.5">
                      <span className="font-mono text-xs sm:text-sm text-[#DDD4C5] font-bold">
                        Q{String(item.slotNumber).padStart(2, "0")} · {item.chapter} ({item.difficulty})
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#1A3825] border-2 border-emerald-400 text-xs font-black text-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          Correct Choice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#421A1A] border-2 border-rose-400 text-xs font-black text-rose-200 shadow-sm">
                          <XCircle className="w-4 h-4 text-rose-300" />
                          {item.selectedOptionKey ? "Incorrect Choice" : "Unanswered"}
                        </span>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="font-serif text-lg sm:text-xl text-white leading-relaxed font-normal py-1">
                      <MathRenderer content={item.questionText} />
                    </div>

                    {/* User Selection vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-4 rounded-md border-2 shadow-md ${
                          item.isCorrect
                            ? "bg-[#1A3825]/90 border-emerald-500/80"
                            : "bg-[#421A1A]/90 border-rose-500/80"
                        }`}
                      >
                        <span className={`block text-xs uppercase font-mono tracking-wider font-extrabold ${
                          item.isCorrect ? "text-emerald-300" : "text-rose-300"
                        }`}>
                          Candidate Selection
                        </span>
                        <div className="font-semibold text-white text-base mt-1.5">
                          {item.selectedOptionKey ? (
                            <span>
                              [{item.selectedOptionKey}]{" "}
                              <MathRenderer content={item.selectedOptionText || ""} />
                            </span>
                          ) : (
                            <span className="italic text-[#DDD4C5]">No option submitted</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-md border-2 bg-[#1A3825]/90 border-emerald-500/80 shadow-md">
                        <span className="block text-xs uppercase font-mono tracking-wider text-emerald-300 font-extrabold">
                          Verified Master Key
                        </span>
                        <div className="font-semibold text-white text-base mt-1.5">
                          <span>
                            [{item.correctOptionKey}]{" "}
                            <MathRenderer content={item.correctOptionText} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Derivation / Pedagogical Explanation */}
                    <div className="p-5 sm:p-6 bg-[#161310] border-2 border-[#5A4A3A] rounded-md space-y-2.5 shadow-inner">
                      <div className="text-white text-sm sm:text-base leading-relaxed font-sans">
                        <strong className="text-[#A8D49E] mr-2 font-mono text-xs sm:text-sm uppercase tracking-wider block sm:inline font-black">Derivation &amp; Proof:</strong>
                        <MathRenderer content={item.explanation} />
                      </div>
                      <p className="text-xs text-[#C5BDB2] font-mono pt-2.5 border-t border-[#332A20] flex items-center gap-2">
                        <span>Syllabus Reference:</span>
                        <span className="text-white font-bold bg-[#26201A] px-2 py-0.5 rounded border border-[#44382C]">{item.syllabusReference}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* E. FOOTER ACTIONS & NOTICE */}
            <div className="p-6 sm:p-8 bg-[#211C18] border-2 border-[#544535] rounded-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Ready for Cycle #{result.cycleNumber + 1}?
                </h4>
                <p className="text-xs sm:text-sm text-[#DDD4C5] mt-1">
                  Next 10 unseen questions guaranteed from the 100-question subject reservoir.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/junior">
                  <Button variant="secondary" size="md" className="bg-[#2A231C] border-2 border-[#544535] text-white hover:bg-[#382F26] font-mono font-bold px-4 py-2">
                    Academy Entrance
                  </Button>
                </Link>
                <Link
                  href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[#2D5A47] hover:bg-[#386D56] text-white font-black font-mono border-2 border-white/30 shadow-lg px-6 py-2.5"
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
