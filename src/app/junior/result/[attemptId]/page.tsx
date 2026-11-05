"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  RotateCcw,
  Share2,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { MathRenderer } from "@/components/math/MathRenderer";
import { JuniorAttemptResult } from "@/lib/platform-types";

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
            "This Junior Mode result belongs to another session or is not yet available."
          );
        }
        if (active) {
          setResult(data);
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Unable to load result."
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
    const shareSummary = `THE UNWRITTEN · Junior Mode (${result.subjectName}): ${result.academicPerformance.scoreOutOf10}/10 (${result.academicPerformance.accuracyPct}%) — ${result.descriptiveProfile.title}.`;
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-6 h-6 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8178]">
              Compiling Academic &amp; Reasoning Monograph
            </p>
          </div>
        ) : errorMsg || !result ? (
          <div className="max-w-lg mx-auto py-20 text-center space-y-5">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#9E6B68]">
              Restricted or Missing Result
            </p>
            <h1 className="font-serif text-3xl text-[#1C1917]">
              Result dossier could not be opened.
            </h1>
            <p className="text-sm text-[#57524C] leading-relaxed">{errorMsg}</p>
            <Link href="/junior">
              <Button size="md">Enter Junior Studio</Button>
            </Link>
          </div>
        ) : (
          <motion.article
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* 1. SHAREABLE MONOGRAPH RESULT CARD */}
            <section className="bg-[#141210] text-[#FAF7F2] border border-[#3E3730] rounded-sm p-7 sm:p-11 relative overflow-hidden">
              <div
                className="absolute inset-4 border border-[#FAF7F2]/10 pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.26em] text-[#A89F93] border-b border-[#FAF7F2]/12 pb-4">
                  <span>
                    THE UNWRITTEN · JUNIOR MODE ({result.board}{" "}
                    {result.academicYear})
                  </span>
                  <span>
                    Participant:{" "}
                    <strong className="text-[#FAF7F2] font-medium">
                      {result.participantName}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 p-6 bg-[#1C1917] border border-[#FAF7F2]/15 rounded-sm text-center space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-[#C8B28E] block">
                      {result.subjectName} · Attempt #{result.attemptNumber}
                    </span>
                    <div className="font-serif text-5xl sm:text-6xl text-[#FAF7F2] leading-none py-1">
                      {result.academicPerformance.scoreOutOf10}
                      <span className="text-2xl text-[#8A8178]"> / 10</span>
                    </div>
                    <p className="font-mono text-xs text-[#D6CEC0]">
                      {result.academicPerformance.accuracyPct}% Accuracy ·{" "}
                      {result.academicPerformance.correctAnswers} Correct ·{" "}
                      {result.academicPerformance.incorrectAnswers} Incorrect
                    </p>
                  </div>

                  <div className="md:col-span-7 space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.26em] text-[#C8B28E] block">
                      Descriptive Learning Reflection ({result.stream} Stream)
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2] leading-tight">
                      {result.descriptiveProfile.title}
                    </h1>
                    <p className="font-serif italic text-base sm:text-lg text-[#D6CEC0]">
                      {result.descriptiveProfile.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[#E7E0D3] leading-relaxed font-light">
                      {result.descriptiveProfile.narrative}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#FAF7F2]/12 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#A89F93]">
                  <span>
                    Cycle {result.cycleNumber} ·{" "}
                    {result.difficultyPreference} Calibration · Engine{" "}
                    {result.scoringAlgorithmVersion}
                  </span>
                  <span>
                    Algorithm: {result.descriptiveProfile.scoringAlgorithmVersion}
                  </span>
                </div>
              </div>
            </section>

            {/* Share & Continue Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3EDE2] border border-[#DDD4C5] px-5 py-4 rounded-sm">
              <p className="text-xs text-[#57524C]">
                Ready for the next 10 unseen questions in {result.subjectName}?
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleShare()}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-[#545E4E]" />
                      Copied Summary
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      Share Result Card
                    </>
                  )}
                </Button>
                <Link
                  href={`/junior?stream=${result.stream}&subject=${result.subjectSlug}`}
                >
                  <Button variant="primary" size="sm">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Next 10-Question Run
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. STREAM-SPECIFIC ABILITY INDICATORS */}
            <section className="space-y-4">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  I. Stream Reasoning Indicators
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Minimum 2 Mapped Questions Required Per Dimension
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.abilityIndicators.map((ind) => (
                  <div
                    key={ind.key}
                    className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-xl text-[#1C1917]">
                        {ind.label}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] rounded-sm border ${ind.qualitativeBand === "Strong"
                            ? "bg-[#545E4E]/15 border-[#545E4E] text-[#545E4E] font-semibold"
                            : ind.qualitativeBand === "Consistent"
                              ? "bg-[#F3EDE2] border-[#CFC5B4] text-[#1C1917]"
                              : ind.qualitativeBand === "Developing"
                                ? "bg-[#9E6B68]/12 border-[#9E6B68] text-[#9E6B68]"
                                : "bg-[#F3EDE2]/60 border-[#DDD4C5] text-[#8A8178]"
                          }`}
                      >
                        {ind.qualitativeBand}
                      </span>
                    </div>

                    <p className="text-xs text-[#57524C] leading-relaxed">
                      {ind.supportingEvidenceSummary}
                    </p>

                    {ind.scorePct !== null ? (
                      <div className="space-y-1.5">
                        <div className="w-full h-2 bg-[#E7E0D3] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#545E4E]"
                            style={{ width: `${ind.scorePct}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#57524C]">
                          {ind.correctMappedCount}/{ind.mappedQuestionsCount}{" "}
                          mapped items correct ({ind.scorePct}%)
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#8A8178]">
                        {ind.displayStatus}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. CHAPTER BREAKDOWN */}
            <section className="space-y-4">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  II. Syllabus Chapter Breakdown
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  {result.subjectName} Chapters Sampled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.academicPerformance.chapterBreakdown.map((ch) => (
                  <div
                    key={`${ch.chapterNumber}-${ch.chapter}`}
                    className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A8178] block">
                        Chapter {ch.chapterNumber}
                      </span>
                      <span className="font-serif text-base text-[#1C1917]">
                        {ch.chapter}
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-sm font-semibold text-[#1C1917] block">
                        {ch.correct}/{ch.attempted}
                      </span>
                      <span className="text-[#8A8178]">{ch.accuracyPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. COMPLETE 10-QUESTION ANSWER & EXPLANATION REVIEW */}
            <section className="space-y-5">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  III. Complete Question &amp; Explanation Review
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Verified Solutions &amp; Syllabus Citations
                </span>
              </div>

              <div className="space-y-4">
                {result.questionReview.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-5 sm:p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-[11px] text-[#8A8178]">
                        Q{String(item.slotNumber).padStart(2, "0")} ·{" "}
                        {item.chapter} ({item.difficulty})
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#545E4E]">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9E6B68]">
                          <XCircle className="w-4 h-4" />
                          {item.selectedOptionKey ? "Incorrect" : "Unanswered"}
                        </span>
                      )}
                    </div>

                    <div className="font-serif text-lg text-[#1C1917] leading-snug">
                      <MathRenderer text={item.questionText} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 rounded-sm border ${item.isCorrect
                            ? "bg-[#545E4E]/10 border-[#545E4E]"
                            : "bg-[#9E6B68]/10 border-[#9E6B68]"
                          }`}
                      >
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-[#57524C]">
                          Your Selection
                        </span>
                        <div className="font-medium text-[#1C1917] mt-0.5 block">
                          {item.selectedOptionKey ? (
                            <span>
                              {item.selectedOptionKey}.{" "}
                              <MathRenderer text={item.selectedOptionText || ""} />
                            </span>
                          ) : (
                            "No option selected"
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-sm border bg-[#545E4E]/10 border-[#545E4E]">
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-[#545E4E]">
                          Verified Answer Key
                        </span>
                        <div className="font-medium text-[#1C1917] mt-0.5 block">
                          <span>
                            {item.correctOptionKey}.{" "}
                            <MathRenderer text={item.correctOptionText} />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F3EDE2]/75 border border-[#E5DEC9] rounded-sm space-y-1 text-xs">
                      <div className="text-[#1C1917] leading-relaxed">
                        <strong className="mr-1">Explanation:</strong>
                        <MathRenderer text={item.explanation} />
                      </div>
                      <p className="text-[11px] text-[#8A8178]">
                        Reference: {item.syllabusReference}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. NON-CLINICAL / NON-BOARD DISCLAIMER */}
            <section className="p-6 sm:p-8 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-xs text-[#57524C] leading-relaxed space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#1C1917] font-semibold">
                Academic &amp; Interpretive Notice
              </p>
              <p>{result.descriptiveProfile.disclaimer}</p>
            </section>
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
}
