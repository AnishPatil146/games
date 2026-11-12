"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  KeyRound,
  MailOpen,
  RotateCcw,
  Share2,
  Star,
  Trophy,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { PlayerReviewModal } from "@/components/reviews/PlayerReviewModal";
import {
  ChoiceMapStep,
  SeniorChoiceMap,
} from "@/components/senior/SeniorChoiceMap";
import { GameplayReport } from "@/lib/types";
import { useGameSession } from "@/lib/useGameSession";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultReportPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { startFreshSession, trackEvent } = useGameSession();

  const [report, setReport] = useState<GameplayReport | null>(null);
  const [choiceMapSteps, setChoiceMapSteps] = useState<ChoiceMapStep[]>([]);
  const [seventhDoor, setSeventhDoor] = useState<{
    unlocked: boolean;
    completed: boolean;
    choiceLabel: string | null;
  }>({ unlocked: false, completed: false, choiceLabel: null });
  const [hiddenLetter, setHiddenLetter] = useState<{
    unlocked: boolean;
    read: boolean;
  }>({ unlocked: false, read: false });
  const [letterOpen, setLetterOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [claimKey, setClaimKey] = useState<string | null>(null);
  const [claimInput, setClaimInput] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    let active = true;
    const localLastSession =
      typeof window !== "undefined"
        ? localStorage.getItem("the_unwritten_last_session_id") ||
          localStorage.getItem("the_unwritten_session_id")
        : null;

    const headers: Record<string, string> = {};
    if (localLastSession) {
      headers["x-session-id"] = localLastSession;
    }

    const query =
      localLastSession && resolvedParams.sessionId === "current"
        ? `?sessionId=${encodeURIComponent(localLastSession)}`
        : "";

    fetch(`/api/result/${resolvedParams.sessionId}${query}`, { headers })
      .then((res) => res.json() as Promise<{
        report?: GameplayReport;
        choiceMapSteps?: ChoiceMapStep[];
        claimKey?: string;
        seventhDoorStatus?: {
          unlocked: boolean;
          completed: boolean;
          choiceLabel: string | null;
        };
        hiddenLetterStatus?: {
          unlocked: boolean;
          read: boolean;
        };
        error?: string;
      }>)
      .then((data) => {
        if (!active) return;
        if (data.report) {
          setReport(data.report);
          setChoiceMapSteps(data.choiceMapSteps || []);
          if (data.seventhDoorStatus) {
            setSeventhDoor(data.seventhDoorStatus);
          }
          if (data.hiddenLetterStatus) {
            setHiddenLetter(data.hiddenLetterStatus);
            if (data.hiddenLetterStatus.read) {
              setLetterOpen(true);
            }
          }
          if (data.claimKey) {
            setClaimKey(data.claimKey);
          }
          setErrorMsg(null);
        } else {
          // If sessionId was not resolved directly, gracefully fallback to /api/result/current
          if (resolvedParams.sessionId !== "current") {
            fetch(`/api/result/current`, { headers })
              .then((r) => r.json())
              .then((fallbackData) => {
                if (fallbackData?.report && active) {
                  setReport(fallbackData.report);
                  setChoiceMapSteps(fallbackData.choiceMapSteps || []);
                  if (fallbackData.claimKey) setClaimKey(fallbackData.claimKey);
                  setErrorMsg(null);
                } else if (active) {
                  setErrorMsg(data.error || "Unable to load report.");
                }
              })
              .catch(() => {
                if (active) setErrorMsg(data.error || "Unable to load report.");
              });
            return;
          }
          setErrorMsg(data.error || "Unable to load report.");
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setErrorMsg(err instanceof Error ? err.message : "Unable to load report.");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [resolvedParams.sessionId]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim()) return;
    setIsClaiming(true);
    setIsLoading(true);
    try {
      const url = `/api/result/${resolvedParams.sessionId}?claim=${encodeURIComponent(claimInput.trim())}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        report?: GameplayReport;
        choiceMapSteps?: ChoiceMapStep[];
        claimKey?: string;
        seventhDoorStatus?: {
          unlocked: boolean;
          completed: boolean;
          choiceLabel: string | null;
        };
        hiddenLetterStatus?: {
          unlocked: boolean;
          read: boolean;
        };
        error?: string;
      };
      if (!res.ok || !data.report) {
        throw new Error(data.error || "Failed to verify session claim key.");
      }
      setReport(data.report);
      setChoiceMapSteps(data.choiceMapSteps || []);
      if (data.seventhDoorStatus) setSeventhDoor(data.seventhDoorStatus);
      if (data.hiddenLetterStatus) {
        setHiddenLetter(data.hiddenLetterStatus);
        if (data.hiddenLetterStatus.read) setLetterOpen(true);
      }
      if (data.claimKey) setClaimKey(data.claimKey);
      setErrorMsg(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Claim verification failed.");
    } finally {
      setIsClaiming(false);
      setIsLoading(false);
    }
  };

  const handleOpenHiddenLetter = async () => {
    setLetterOpen(true);
    if (!hiddenLetter.read) {
      setHiddenLetter((prev) => ({ ...prev, read: true }));
      await trackEvent(6, "hidden_letter_read", {
        discoveredVia: "dossier_correspondence",
      });
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareText = `THE UNWRITTEN — Narrative Dossier: ${report.archetype}. "${report.subtitle}"`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `THE UNWRITTEN — ${report.archetype}`,
          text: shareText,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} — ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleReplay = async () => {
    setIsResetting(true);
    try {
      await startFreshSession("UNSPECIFIED");
      router.push("/play");
    } catch {
      router.push("/play");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-6 h-6 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8178]">
              Synthesizing Personal Monograph
            </p>
          </div>
        ) : errorMsg || !report ? (
          <div className="max-w-lg mx-auto py-16 text-center space-y-6">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#9E6B68] font-mono font-bold">
              Personal Investigation Archive
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-black">
              Synthesizing Investigation Dossier
            </h1>
            <p className="text-sm text-[#57524C] leading-relaxed">
              {errorMsg ||
                "Your deduction monograph is being compiled. If you just concluded a session or reloaded, you can refresh your archive below or explore another investigation."}
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  setIsLoading(true);
                  setErrorMsg(null);
                  window.location.href = "/result/current";
                }}
              >
                Refresh Dossier
              </Button>
              <Link href="/solo">
                <Button size="md" variant="secondary">Solo Investigation</Button>
              </Link>
              <Link href="/">
                <Button size="md" variant="secondary">Return to Hub</Button>
              </Link>
            </div>

            {/* Collapsed In-Browser Dossier Claim & Device Linking Form */}
            <details className="mt-8 text-left bg-white border border-[#DDD4C5] rounded-lg p-4 shadow-sm group">
              <summary className="text-xs font-mono uppercase tracking-wider text-[#8A8178] font-bold cursor-pointer hover:text-[#1C1917] select-none">
                ▸ Have a recovery session token or claim key?
              </summary>
              <form
                onSubmit={(e) => void handleClaimSubmit(e)}
                className="pt-4 space-y-3"
              >
                <label
                  htmlFor="claim-key-input"
                  className="block text-[10px] uppercase tracking-wider font-mono text-[#8A8178] font-bold"
                >
                  Enter Session Claim Key or Original Token:
                </label>
                <div className="flex gap-2">
                  <input
                    id="claim-key-input"
                    type="text"
                    required
                    placeholder="e.g. 7A8B9C0D or session_token"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#8A5A36]"
                  />
                  <Button size="sm" type="submit" disabled={isClaiming}>
                    {isClaiming ? "Verifying..." : "Claim Dossier"}
                  </Button>
                </div>
                <p className="text-[11px] text-[#8A8178]">
                  Claiming binds this dossier to your current browser session and establishes authenticated ownership.
                </p>
              </form>
            </details>
          </div>
        ) : (
          <motion.article
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            {/* Shareable Monograph Cover Plate */}
            <section className="bg-[#1C1814] text-[#FAF7F2] border-2 border-[#544535] rounded-md p-7 sm:p-12 relative overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div
                className="absolute inset-4 border border-[#8FA184]/30 pointer-events-none rounded-sm"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-[#DDD4C5] border-b-2 border-[#3D3328] pb-4 font-bold">
                  <span>THE UNWRITTEN · SENIOR NARRATIVE DOSSIER</span>
                  <div className="flex items-center gap-3">
                    {claimKey && (
                      <span className="font-mono text-emerald-300 bg-emerald-950/80 border-2 border-emerald-500/80 px-2.5 py-0.5 rounded text-xs font-bold">
                        CLAIM KEY: {claimKey}
                      </span>
                    )}
                    <span>
                      Prepared for{" "}
                      <strong className="text-white font-black ml-1 bg-[#28211A] px-2.5 py-0.5 rounded border border-[#4E3E2E]">
                        {report.playerName}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-4 py-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#A8D49E] font-extrabold">
                    Primary Narrative Archetype
                  </p>
                  <h1 className="font-serif text-4xl sm:text-6xl text-white tracking-tight leading-none font-black drop-shadow-md">
                    {report.archetype}
                  </h1>
                  <p className="font-serif italic text-lg sm:text-2xl text-[#F2E8DC] max-w-2xl font-medium">
                    {report.subtitle}
                  </p>
                </div>

                <p className="text-sm sm:text-base text-[#E8DFD3] leading-relaxed max-w-2xl font-normal">
                  {report.interpretation}
                </p>

                <div className="pt-4 border-t-2 border-[#3D3328] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-[0.22em] text-[#DDD4C5] block font-bold">
                      Pattern Confidence · <strong className="text-white">{report.confidence}</strong>
                    </span>
                    <span className="text-[#C8BFB4] text-xs">
                      {report.confidenceRationale}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#DDD4C5] shrink-0 font-medium">
                    Secondary Resonance:{" "}
                    <span className="text-white font-bold bg-[#28211A] px-2 py-0.5 rounded border border-[#4E3E2E]">
                      {report.runnerUpArchetype}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Share & Replay Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3EDE2] border border-[#DDD4C5] px-5 py-4 rounded-sm">
              <p className="text-xs text-[#57524C]">
                Capture a screenshot of your monograph cover above or share an
                invitation link.
              </p>
              <div className="flex items-center gap-2.5">
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
                      Share Experience
                    </>
                  )}
                </Button>
                <Link href="/leaderboard?mode=senior_solo">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                  >
                    <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Leaderboard
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => void handleReplay()}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  New Journey
                </Button>
              </div>
            </div>

            {/* OPTIONAL SEVENTH DOOR THRESHOLD & DISCOVERABLE HIDDEN LETTER */}
            {(seventhDoor.unlocked || hiddenLetter.unlocked) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {seventhDoor.unlocked && (
                  <div className="p-6 bg-[#141210] text-[#FAF7F2] border border-[#3E3730] rounded-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#C8B28E]">
                        <KeyRound className="w-3.5 h-3.5" />
                        {seventhDoor.completed
                          ? "Threshold VII Inscribed"
                          : "Threshold VII Unlocked"}
                      </span>
                      <h2 className="font-serif text-2xl text-[#FAF7F2]">
                        The Seventh Door
                      </h2>
                      <p className="text-xs text-[#D6CEC0] leading-relaxed">
                        {seventhDoor.completed
                          ? `You entered the unindexed chamber and recorded your closing gesture: "${seventhDoor.choiceLabel}".`
                          : "Because you examined subtle archival clues during your journey, an unindexed seventh chamber stands unlocked behind the sixth horizon."}
                      </p>
                    </div>
                    {!seventhDoor.completed && (
                      <div>
                        <Link href="/play/7">
                          <Button variant="ivory" size="sm" className="group">
                            <span>Enter The Seventh Door</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {hiddenLetter.unlocked && (
                  <div className="p-6 bg-[#F3EDE2] text-[#1C1917] border border-[#CFC5B4] rounded-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#545E4E] font-semibold">
                        <MailOpen className="w-3.5 h-3.5" />
                        Discoverable Correspondence
                      </span>
                      <h2 className="font-serif text-2xl text-[#1C1917]">
                        The Archivist&apos;s Hidden Letter
                      </h2>
                      {!letterOpen ? (
                        <p className="text-xs text-[#57524C] leading-relaxed">
                          Tucked inside the lining of the dossier is a folded
                          sheet of cotton vellum unlocked by the clues you
                          inspected.
                        </p>
                      ) : (
                        <blockquote className="text-xs sm:text-sm font-serif italic text-[#1C1917] leading-relaxed border-l-2 border-[#545E4E] pl-3.5 py-1">
                          &ldquo;To the traveler who paused to look closer: we
                          built these six rooms not to measure speed, nor to
                          grade obedience, but to see who still notices quiet
                          things when nobody instructs them to. Keep that
                          habit—it is rarer than certainty.&rdquo;
                          <footer className="not-italic font-sans text-[10px] uppercase tracking-[0.2em] text-[#8A8178] mt-2">
                            — Unsigned Folio Margin, Room II
                          </footer>
                        </blockquote>
                      )}
                    </div>
                    {!letterOpen && (
                      <div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleOpenHiddenLetter()}
                        >
                          Unseal Hidden Letter
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* VISUAL CHOICE MAP */}
            {choiceMapSteps.length > 0 && (
              <section className="space-y-4">
                <SeniorChoiceMap
                  steps={choiceMapSteps}
                  seventhDoor={seventhDoor}
                />
              </section>
            )}

            {/* SECTION I: Strictly Factual Gameplay Results */}
            <section className="space-y-4">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  I. Factual Gameplay Telemetry
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Directly Measured Session Counts
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Chapters
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.chaptersCompleted}/6
                  </span>
                </div>

                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Puzzles Solved
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.puzzlesSolved}/
                    {report.factualResults.puzzlesAttempted}
                  </span>
                </div>

                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Accuracy
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.accuracyPct !== null
                      ? `${report.factualResults.accuracyPct}%`
                      : "—"}
                  </span>
                </div>

                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Clues Examined
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.cluesInspectedCount}
                  </span>
                </div>

                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Hints Used
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.hintsUsed}
                  </span>
                </div>

                <div className="p-4 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                    Avg Pace
                  </span>
                  <span className="block font-serif text-2xl text-[#1C1917] mt-1">
                    {report.factualResults.avgResponseTimeSeconds !== null
                      ? `${report.factualResults.avgResponseTimeSeconds}s`
                      : "—"}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION II: Explicitly Selected Preferences */}
            <section className="space-y-4">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  II. Explicitly Selected Preferences
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Direct Choices Without Inference
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
                    Chapter 04 · Atelier Composition
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">Ground Tone</dt>
                      <dd className="text-[#1C1917] font-medium text-right">
                        {report.explicitPreferences.canvasPalette || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">Arrangement</dt>
                      <dd className="text-[#1C1917] font-medium text-right">
                        {report.explicitPreferences.canvasArrangement || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">Placed Forms</dt>
                      <dd className="text-[#1C1917] font-medium text-right">
                        {report.explicitPreferences.canvasObjects.length > 0
                          ? report.explicitPreferences.canvasObjects.join(", ")
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
                    Chapter 06 · Closing Sanctuary
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">Horizon</dt>
                      <dd className="text-[#1C1917] font-medium text-right">
                        {report.explicitPreferences.worldEnvironment || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">Claimed Relic</dt>
                      <dd className="text-[#1C1917] font-medium text-right">
                        {report.explicitPreferences.worldObject || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#8A8178]">First Hour</dt>
                      <dd className="text-[#1C1917] font-medium text-right max-w-[230px]">
                        {report.explicitPreferences.worldActivity || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            {/* SECTION III: Tentative Inferred Tendencies & Chapter Trace */}
            <section className="space-y-6">
              <div className="border-b border-[#DDD4C5] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  III. Tentative In-Story Tendencies
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Interpretive Reflection Based on Decisions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#F3EDE2]/65 border border-[#DDD4C5] rounded-sm space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#1C1917] font-semibold">
                    Observed Narrative Leanings
                  </h3>
                  <ul className="space-y-2.5 text-sm text-[#1C1917]">
                    {report.observedTendencies.map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#545E4E] mt-2 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-[#DDD4C5] space-y-2">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                      Supporting Evidence in Session
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#57524C] leading-relaxed">
                      {report.supportingEvidence.map((ev, i) => (
                        <li key={i}>· {ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#1C1917] font-semibold">
                    Notable Crossroads
                  </h3>
                  {report.interestingDecisions.length === 0 ? (
                    <p className="text-xs text-[#8A8178]">
                      Complete additional chapters to populate decision notes.
                    </p>
                  ) : (
                    <ol className="space-y-3.5">
                      {report.interestingDecisions.map((item) => (
                        <li
                          key={`${item.chapter}-${item.chapterTitle}`}
                          className="text-sm border-l-2 border-[#DDD4C5] pl-3.5 space-y-0.5"
                        >
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                            Chapter 0{item.chapter} · {item.chapterTitle}
                          </span>
                          <span className="block text-[#1C1917] leading-snug">
                            {item.summary}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </section>

            {/* Player Review & Field Notes Dispatch Callout */}
            <section className="p-6 sm:p-8 bg-[#201A14] border-2 border-amber-500/60 rounded-xl text-center space-y-3.5 shadow-2xl ring-1 ring-amber-500/20">
              <div className="flex items-center justify-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                ))}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Share Your Deductive Impressions
              </h3>
              <p className="text-xs sm:text-sm text-[#DDD4C5] max-w-lg mx-auto leading-relaxed">
                {hasReviewed
                  ? "Your dispatch has been preserved in the Academy archives. Thank you for contributing to The Unwritten!"
                  : "How was your journey through the 8 chambers? Leave a review and rating for the creator and community."}
              </p>
              {!hasReviewed && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs font-mono uppercase tracking-wider border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer transition-all active:scale-95 inline-flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-black" />
                    <span>Inscribe Player Review</span>
                  </button>
                </div>
              )}
            </section>

            {/* Closing Reflection & Explicit Non-Clinical Disclaimer */}
            <section className="p-7 sm:p-9 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-center space-y-4">
              <p className="font-serif italic text-xl sm:text-2xl text-[#1C1917] max-w-2xl mx-auto leading-relaxed">
                &ldquo;{report.closingMessage}&rdquo;
              </p>
              <p className="text-xs text-[#57524C] max-w-xl mx-auto leading-relaxed pt-2 border-t border-[#DDD4C5]">
                <strong>Methodological Disclaimer:</strong> THE UNWRITTEN is a
                work of interactive narrative fiction. Archetypes and inferred
                tendencies reflect patterns within fictional game chapters
                only—they do not measure IQ, mental health, clinical traits, or
                real-world psychological diagnoses.
              </p>
            </section>
          </motion.article>
        )}

        <PlayerReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            setHasReviewed(true);
            setShowReviewModal(false);
          }}
          defaultCategory="solo"
          defaultMode="senior"
        />
      </main>

      <Footer />
    </div>
  );
}
