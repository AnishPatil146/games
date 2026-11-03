"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
} from "lucide-react";
import { GameplayReport } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function ResultPage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || "";

  const [report, setReport] = useState<GameplayReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fire celebratory subtle confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#5B6356", "#8C827A", "#A37070", "#E0D7CB"],
      });
    } catch {
      // ignore
    }

    fetch(`/api/result/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load personal report");
        return res.json();
      })
      .then((data) => {
        if (data.report) {
          setReport(data.report);
        } else {
          throw new Error("No report data returned");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin mb-4" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#78716C]">
            Synthesizing Your Choices & Patterns...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-sm text-[#A37070]">{error || "Report not found"}</p>
          <Link href="/play" className="text-xs uppercase tracking-wider underline">
            Return to Beginning
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 sm:py-16 w-full space-y-10">
        {/* Screenshot-ready Editorial Card */}
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 sm:p-10 rounded border border-[#E0D7CB] bg-[#F4EFE7] shadow-sm space-y-8 relative overflow-hidden"
        >
          {/* Subtle watermark background seal */}
          <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none select-none text-[#1C1917]">
            <Compass className="w-64 h-64" />
          </div>

          {/* Dossier Header */}
          <div className="border-b border-[#E0D7CB] pb-6 space-y-1 flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#78716C] block">
                The Unwritten • Personal Dossier
              </span>
              <h1 className="text-sm font-semibold uppercase tracking-wider text-[#1C1917]">
                Record of {report.playerName}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8C827A] block">
                Date Completed
              </span>
              <span className="text-xs text-[#57534E]">
                {new Date(report.completedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Main Archetype Banner */}
          <div className="text-center py-4 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#5B6356] font-medium">
              Primary Inferred Archetype
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C1917] font-normal">
              {report.archetype}
            </h2>
            <p className="text-xs sm:text-sm font-serif italic text-[#78716C] max-w-md mx-auto">
              &ldquo;{report.subtitle}&rdquo;
            </p>
            <div className="pt-1 flex items-center justify-center space-x-2">
              <span className="text-[10px] uppercase tracking-wider text-[#78716C]">
                Pattern Confidence:
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                  report.confidence === "Strong"
                    ? "bg-[#5B6356] text-[#FAF8F5]"
                    : "bg-[#E0D7CB] text-[#1C1917]"
                }`}
              >
                {report.confidence}
              </span>
            </div>
          </div>

          {/* Interpretation Body */}
          <div className="p-5 rounded bg-[#FAF8F5] border border-[#E0D7CB] space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
              Synthesized Interpretation
            </h3>
            <p className="text-xs sm:text-sm font-serif text-[#292524] leading-relaxed">
              {report.interpretation}
            </p>
          </div>

          {/* Observed Strengths */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
              Observed Behavioral Hallmarks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {report.observedStrengths.map((str, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF8F5] rounded border border-[#E0D7CB] text-xs text-[#44403C] flex items-start space-x-2"
                >
                  <Award className="w-3.5 h-3.5 text-[#5B6356] flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concrete Gameplay Evidence */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
              Supporting Gameplay Decisions
            </h3>
            <ul className="space-y-2 text-xs text-[#57534E]">
              {report.supportingEvidence.map((ev, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#5B6356] font-bold">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Separate Puzzle & Deduction Metrics */}
          <div className="p-5 rounded bg-[#FAF8F5] border border-[#E0D7CB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                Logical & Problem-Solving Performance
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-[#8C827A]">
                Factual Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                  Accuracy
                </span>
                <span className="text-base font-semibold text-[#1C1917]">
                  {report.puzzlePerformance.accuracyRate}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                  Puzzles Solved
                </span>
                <span className="text-base font-semibold text-[#1C1917]">
                  {report.puzzlePerformance.solvedCorrectly} / {report.puzzlePerformance.totalPuzzles}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                  Hints Requested
                </span>
                <span className="text-base font-semibold text-[#1C1917]">
                  {report.puzzlePerformance.hintsUsed}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                  Avg Time
                </span>
                <span className="text-base font-semibold text-[#1C1917]">
                  {report.puzzlePerformance.avgResponseTimeSeconds}s
                </span>
              </div>
            </div>
          </div>

          {/* Selected World Preferences */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
              Explored Sanctuary & Aesthetic Choices
            </h3>
            <p className="text-xs text-[#57534E]">
              Primary environment:{" "}
              <strong>{report.exploredEnvironments.join(", ")}</strong>
              {report.creativeComposition && (
                <>
                  {" "}• Canvas mood: <strong>{report.creativeComposition.mood}</strong>
                </>
              )}
            </p>
          </div>

          {/* Closing Message */}
          <div className="pt-4 border-t border-[#E0D7CB] text-center space-y-1">
            <p className="text-sm font-serif italic text-[#1C1917]">
              &ldquo;{report.closingMessage}&rdquo;
            </p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C827A]">
              THE UNWRITTEN • ARCHIVAL RECORD
            </span>
          </div>
        </motion.div>

        {/* Ethical Non-Clinical Disclaimer */}
        <div className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] flex items-start space-x-3 text-xs text-[#78716C] leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-[#8C827A] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Methodology Note:</strong> This report reflects behavioral
            tendencies, priorities, and pacing recorded solely within this fictional
            experience. It does not constitute a clinical, psychological, or
            medical assessment.
          </p>
        </div>

        {/* Social Sharing & Replay Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleShare}
            className="w-full sm:w-auto"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                <span>LINK COPIED TO CLIPBOARD</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                <span>SHARE THIS REPORT</span>
              </>
            )}
          </Button>

          <Link
            href="/play"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-medium border border-[#D6D3D1] bg-[#FAF8F5] text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            <span>PLAY AGAIN WITH NEW CHOICES</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
