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
    <div className="relative min-h-screen flex flex-col bg-[#14110E] text-[#FAF7F2]">
      {/* Background Illustrated Achievement Hall with Light Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/art/environments/env_junior_achievement_hall.jpg"
          alt="Academy Achievement Hall"
          fill
          priority
          className="object-cover object-center opacity-40 filter brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#14110E]/80 via-[#181410]/70 to-[#14110E]/85" />
      </div>
      {/* 1. ACADEMY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#1D1814]/98 backdrop-blur-md border-b-2 border-[#4E3F30] px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/junior"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            title="Return to Academy Hub"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm">
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
              <span className="text-[11px] uppercase font-mono text-amber-300 block font-bold">
                Evaluation Monograph
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleShare()}
              className="bg-[#2D2620] hover:bg-[#3D332A] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-md border-2 border-[#8A755D] shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Summary</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Share Certificate</span>
                </>
              )}
            </button>

            {result && (
              <Link
                href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
              >
                <button
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded-md border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next 10 Questions</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN EVALUATION CERTIFICATE */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300 font-mono font-bold">
              Synthesizing Academic Derivation Monograph
            </p>
          </div>
        ) : errorMsg || !result ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-5 bg-[#241F1A] border-2 border-[#544535] rounded-xl p-8 shadow-2xl">
            <XCircle className="w-12 h-12 mx-auto text-rose-400" />
            <h1 className="font-serif text-2xl text-white font-black">
              Evaluation Dossier Not Found
            </h1>
            <p className="text-sm text-[#DDD4C5] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <button
                type="button"
                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-md border-2 border-white shadow-lg cursor-pointer transition-all"
              >
                Return to Academy Hub
              </button>
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
            <section className="bg-[#241F1A] text-[#FAF7F2] border-2 border-[#8A7356] rounded-xl p-6 sm:p-10 relative overflow-hidden shadow-2xl ring-1 ring-amber-500/30">
              {/* Ornate Inner Border Line */}
              <div
                className="absolute inset-3 border border-amber-400/40 pointer-events-none rounded-lg"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-8">
                {/* Certificate Top Seal */}
                <div className="bg-[#2F2720] border-2 border-[#544535] p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs uppercase font-mono tracking-[0.2em] text-[#C2E0B8] font-bold">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                    <span className="text-white">THE UNWRITTEN ACADEMY · EVALUATION CERTIFICATE</span>
                  </div>
                  <span className="text-[#DDD4C5]">
                    Candidate: <strong className="text-white font-black text-sm bg-[#1A1613] px-3 py-1 rounded border border-[#544535] ml-1">{result.participantName}</strong>
                  </span>
                </div>

                {/* Main Score Plate & Scholar Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Score Box */}
                  <div className="md:col-span-5 p-6 sm:p-8 bg-[#2C241D] border-2 border-amber-500 rounded-xl text-center space-y-4 shadow-xl">
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-400 shadow-md mb-2">
                      <Image
                        src="/art/characters/junior_student.png"
                        alt="The Scholar"
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <span className="text-xs uppercase font-mono tracking-wider text-amber-200 block font-bold">
                      {result.subjectName} · Attempt #{result.attemptNumber}
                    </span>

                    <div className="font-serif text-6xl sm:text-7xl text-white font-black leading-none py-1 drop-shadow-md">
                      {result.academicPerformance.scoreOutOf10}
                      <span className="text-3xl text-amber-300 font-bold"> / 10</span>
                    </div>

                    <div className="pt-3 border-t-2 border-[#4E3F30] space-y-2.5">
                      <span className="bg-emerald-500 text-black font-black text-sm px-4 py-1.5 rounded-full inline-block shadow-md font-mono">
                        {result.academicPerformance.accuracyPct}% Precision Accuracy
                      </span>
                      <div className="flex items-center justify-center gap-2 text-xs font-mono pt-1">
                        <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-black shadow-sm">
                          {result.academicPerformance.correctAnswers} Correct
                        </span>
                        <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-black shadow-sm">
                          {result.academicPerformance.incorrectAnswers} Incorrect
                        </span>
                      </div>
                      {rank && (
                        <div className="inline-block px-4 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs uppercase font-mono font-black shadow-md mt-2">
                          Rank: {rank.title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Narrative Monograph */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase font-mono tracking-wider px-3.5 py-1 rounded-md bg-[#2D4536] border-2 border-emerald-400 text-emerald-200 font-black">
                        {result.stream} Stream Folio
                      </span>
                      <span className="text-xs text-white font-mono font-bold bg-[#2C241D] px-3 py-1 rounded border-2 border-[#544535]">
                        Cycle {result.cycleNumber} · {result.difficultyPreference}
                      </span>
                    </div>

                    <h1 className="font-serif text-2xl sm:text-4xl text-white leading-tight font-black tracking-wide drop-shadow-sm">
                      {result.descriptiveProfile.title}
                    </h1>

                    <p className="font-serif italic text-base sm:text-xl text-amber-200 font-semibold leading-snug">
                      {result.descriptiveProfile.subtitle}
                    </p>

                    <p className="text-base text-[#F5EFEB] leading-relaxed font-sans">
                      {result.descriptiveProfile.narrative}
                    </p>
                  </div>
                </div>

                {/* Certificate Footer Metadata */}
                <div className="pt-4 border-t-2 border-[#4E3F30] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#DDD4C5] font-semibold">
                  <span>
                    Deterministic Scoring Engine v{result.scoringAlgorithmVersion} · MSBSHSE / NCERT 2026
                  </span>
                  <span className="text-emerald-300 font-bold">
                    Zero-Repeat Question Bank Cycle Guarantee Active
                  </span>
                </div>
              </div>
            </section>

            {/* B. STREAM REASONING INDICATORS */}
            <section className="space-y-4">
              <div className="border-b-2 border-[#4E3F30] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-black flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>Cognitive &amp; Academic Ability Dimensions</span>
                </h2>
                <span className="text-xs uppercase font-mono text-[#DDD4C5] font-bold">
                  Dimension Mastery Matrix
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.abilityIndicators.map((ind) => (
                  <div
                    key={ind.key}
                    className="p-5 sm:p-6 bg-[#241F1A] border-2 border-[#6E5A44] rounded-xl space-y-3.5 shadow-xl hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif font-black text-base sm:text-lg text-white">
                        {ind.label}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs uppercase font-mono font-black rounded-md border-2 shadow-sm ${
                          ind.qualitativeBand === "Strong"
                            ? "bg-emerald-500 text-black border-white"
                            : ind.qualitativeBand === "Consistent"
                            ? "bg-amber-400 text-black border-white"
                            : ind.qualitativeBand === "Developing"
                            ? "bg-rose-500 text-white border-white"
                            : "bg-stone-600 text-white border-white"
                        }`}
                      >
                        {ind.qualitativeBand}
                      </span>
                    </div>

                    <p className="text-sm text-[#F5EFEB] leading-relaxed">
                      {ind.supportingEvidenceSummary}
                    </p>

                    {ind.scorePct !== null ? (
                      <div className="space-y-2 pt-1">
                        <div className="w-full h-2.5 bg-[#141210] rounded-full overflow-hidden border border-[#544535]">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${ind.scorePct}%` }}
                          />
                        </div>
                        <p className="text-xs font-mono text-white font-bold">
                          {ind.correctMappedCount}/{ind.mappedQuestionsCount} items correct ({ind.scorePct}%)
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-white font-medium">{ind.displayStatus}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* C. SYLLABUS CHAPTER BREAKDOWN */}
            <section className="space-y-4">
              <div className="border-b-2 border-[#4E3F30] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-black flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <span>Syllabus Chapter Mastery Breakdown</span>
                </h2>
                <span className="text-xs uppercase font-mono text-[#DDD4C5] font-bold">
                  {result.subjectName} Chapters Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.academicPerformance.chapterBreakdown.map((ch) => (
                  <div
                    key={`${ch.chapterNumber}-${ch.chapter}`}
                    className="p-5 bg-[#241F1A] border-2 border-[#6E5A44] rounded-xl flex items-center justify-between gap-4 shadow-xl hover:border-amber-400 transition-all"
                  >
                    <div>
                      <span className="text-xs font-mono uppercase text-emerald-300 block font-black tracking-wider">
                        Chapter {ch.chapterNumber}
                      </span>
                      <span className="font-serif font-black text-base sm:text-lg text-white mt-1 block">
                        {ch.chapter}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-lg font-black text-white block">
                        {ch.correct} / {ch.attempted}
                      </span>
                      <span className={`text-xs font-mono font-black mt-1 block px-2.5 py-0.5 rounded-full ${
                        ch.accuracyPct >= 80
                          ? "bg-emerald-600 text-white"
                          : ch.accuracyPct >= 50
                          ? "bg-amber-500 text-black"
                          : "bg-rose-600 text-white"
                      }`}>
                        {ch.accuracyPct}% accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* D. QUESTION DERIVATION REVIEW SECTION */}
            <section className="space-y-4">
              <div className="border-b-2 border-[#4E3F30] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl text-white font-black">
                  Question &amp; Derivation Monograph
                </h2>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewFilter("all")}
                    className={`px-4 py-2 text-xs font-mono rounded-md border-2 transition-all cursor-pointer ${
                      reviewFilter === "all"
                        ? "bg-white text-black border-white font-black shadow-lg"
                        : "bg-[#2A231C] text-white border-[#6E5A44] hover:border-white font-bold"
                    }`}
                  >
                    All (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("wrong")}
                    className={`px-4 py-2 text-xs font-mono rounded-md border-2 transition-all cursor-pointer ${
                      reviewFilter === "wrong"
                        ? "bg-rose-600 text-white border-white font-black shadow-lg"
                        : "bg-[#2A231C] text-rose-300 border-[#6E5A44] hover:border-rose-400 font-bold"
                    }`}
                  >
                    Incorrect ({result.academicPerformance.incorrectAnswers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("correct")}
                    className={`px-4 py-2 text-xs font-mono rounded-md border-2 transition-all cursor-pointer ${
                      reviewFilter === "correct"
                        ? "bg-emerald-600 text-white border-white font-black shadow-lg"
                        : "bg-[#2A231C] text-emerald-300 border-[#6E5A44] hover:border-emerald-400 font-bold"
                    }`}
                  >
                    Correct ({result.academicPerformance.correctAnswers})
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredQuestions.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-6 sm:p-8 bg-[#241F1A] border-2 border-[#7D6852] rounded-xl space-y-6 shadow-2xl ring-1 ring-amber-500/20"
                  >
                    {/* Item Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#2E2822] border-2 border-[#544535] p-4 rounded-lg">
                      <span className="font-mono text-sm sm:text-base text-white font-bold">
                        Question {String(item.slotNumber).padStart(2, "0")} · {item.chapter} ({item.difficulty})
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 border-2 border-white text-xs font-black text-black shadow-md">
                          <CheckCircle2 className="w-4 h-4 text-black" />
                          Correct Choice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 border-2 border-white text-xs font-black text-white shadow-md">
                          <XCircle className="w-4 h-4 text-white" />
                          {item.selectedOptionKey ? "Incorrect Choice" : "Unanswered"}
                        </span>
                      )}
                    </div>

                    {/* Question Text Box */}
                    <div className="p-5 rounded-lg bg-[#181410] border-2 border-[#544535] text-white text-lg sm:text-xl font-medium leading-relaxed shadow-inner">
                      <MathRenderer content={item.questionText} />
                    </div>

                    {/* User Selection vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div
                        className={`p-5 rounded-lg border-2 shadow-lg ${
                          item.isCorrect
                            ? "bg-[#143B25] border-emerald-400"
                            : "bg-[#451818] border-rose-400"
                        }`}
                      >
                        <div className={`text-xs uppercase font-mono tracking-wider font-black flex items-center gap-1.5 ${
                          item.isCorrect ? "text-emerald-300" : "text-rose-300"
                        }`}>
                          {item.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>YOUR ANSWER (CORRECT)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>YOUR ANSWER (INCORRECT)</span>
                            </>
                          )}
                        </div>
                        <div className="font-black text-white text-base sm:text-lg mt-2.5">
                          {item.selectedOptionKey ? (
                            <span>
                              [{item.selectedOptionKey}]{" "}
                              <MathRenderer content={item.selectedOptionText || ""} />
                            </span>
                          ) : (
                            <span className="italic text-rose-200">No option submitted</span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 rounded-lg border-2 bg-[#143B25] border-emerald-400 shadow-lg">
                        <div className="text-xs uppercase font-mono tracking-wider text-emerald-300 font-black flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>VERIFIED MASTER KEY</span>
                        </div>
                        <div className="font-black text-white text-base sm:text-lg mt-2.5">
                          <span>
                            [{item.correctOptionKey}]{" "}
                            <MathRenderer content={item.correctOptionText} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Derivation / Pedagogical Explanation */}
                    <div className="p-6 bg-[#181410] border-2 border-amber-500/80 rounded-lg space-y-3 shadow-inner">
                      <div className="text-amber-300 font-mono text-sm uppercase tracking-wider flex items-center gap-2 font-black border-b border-[#3D3328] pb-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Derivation &amp; Pedagogical Proof</span>
                      </div>
                      <div className="text-white text-base sm:text-lg leading-relaxed font-sans pt-1">
                        <MathRenderer content={item.explanation} />
                      </div>
                      <p className="text-xs text-[#DDD4C5] font-mono pt-3 border-t border-[#332A20] flex items-center gap-2">
                        <span className="font-bold text-white">Syllabus Reference:</span>
                        <span className="text-amber-200 font-black bg-[#2B231B] px-3 py-1 rounded border border-[#544535]">{item.syllabusReference}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* E. FOOTER ACTIONS & NOTICE */}
            <div className="p-6 sm:p-8 bg-[#241F1A] border-2 border-[#8A7356] rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
              <div>
                <h4 className="font-serif font-black text-lg sm:text-xl text-white">
                  Ready for Cycle #{result.cycleNumber + 1}?
                </h4>
                <p className="text-xs sm:text-sm text-[#DDD4C5] mt-1 font-medium">
                  Next 10 unseen questions guaranteed from the 100-question subject reservoir.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/junior">
                  <button
                    type="button"
                    className="bg-[#2D2620] hover:bg-[#3D332A] text-white font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded-md border-2 border-[#8A755D] shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    Academy Entrance
                  </button>
                </Link>
                <Link
                  href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
                >
                  <button
                    type="button"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-md border-2 border-white shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Begin Next 10 Questions</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
