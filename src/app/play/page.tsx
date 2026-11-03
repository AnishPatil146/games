"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { useGameSession } from "@/lib/useGameSession";
import { CharacterPresentation } from "@/lib/types";

export default function PlayIntroPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const {
    session,
    playerDisplayName,
    savedEvents,
    isLoading,
    submitProfile,
    beginAnonymousSession,
    startFreshSession,
  } = useGameSession();

  const [step, setStep] = useState<"presentation" | "profile">("presentation");
  const [presentation, setPresentation] =
    useState<CharacterPresentation>("UNSPECIFIED");

  const [displayName, setDisplayName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [consent, setConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasActiveRun =
    !isLoading &&
    session?.status === "in_progress" &&
    savedEvents.some(
      (e) =>
        e.event_type === "game_started" ||
        e.event_type === "chapter_started" ||
        e.event_type === "choice_selected"
    );

  const handleSelectPresentation = (selected: CharacterPresentation) => {
    setPresentation(selected);
    setErrorMsg(null);
    setStep("profile");
  };

  const handleResumeRun = () => {
    const ch = Math.min(Math.max(session?.current_chapter || 1, 1), 6);
    router.push(`/play/${ch}`);
  };

  const handleStartFresh = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await startFreshSession("UNSPECIFIED");
      setStep("presentation");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not reset session."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWithProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setErrorMsg(
        "Enter a display name, or choose 'Continue Anonymously' below."
      );
      return;
    }

    if (!consent) {
      setErrorMsg(
        "Explicit consent is required before saving an optional player profile."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProfile(
        trimmedName,
        instagramUsername.trim() || undefined,
        true,
        presentation
      );
      router.push("/play/1");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong saving your profile."
      );
      setIsSubmitting(false);
    }
  };

  const handleSkipAnonymously = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await beginAnonymousSession(presentation, true);
      router.push("/play/1");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to initialize anonymous session."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Resume In-Progress Journey Banner */}
        {hasActiveRun && session && (
          <div className="mb-10 border border-[#545E4E]/35 bg-[#E9ECE6]/65 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
                Unfinished Folio Detected
              </p>
              <p className="text-sm text-[#1C1917]">
                {playerDisplayName ? (
                  <>
                    Signed as{" "}
                    <span className="font-medium">{playerDisplayName}</span> ·{" "}
                  </>
                ) : (
                  <>Anonymous session · </>
                )}
                Currently at Chapter 0{session.current_chapter}.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleResumeRun}
              >
                Resume Ch. 0{session.current_chapter}
              </Button>
              <Button
                type="button"
                variant="subtle"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleStartFresh()}
                title="Start a brand-new session"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "presentation" ? (
            <motion.section
              key="presentation"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="prologue-heading"
              className="space-y-10"
            >
              <div className="space-y-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
                  Prologue · Step 01 of 02
                </p>
                <h1
                  id="prologue-heading"
                  className="font-serif text-3xl sm:text-4xl text-[#1C1917]"
                >
                  Choose a narrative silhouette
                </h1>
                <p className="text-sm text-[#57524C] max-w-md mx-auto leading-relaxed">
                  Purely a visual and atmospheric preference for your final
                  monograph. Every chapter, puzzle, and interpretation remains
                  identical regardless of choice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => handleSelectPresentation("HIM")}
                  className="group p-7 text-left border border-[#DDD4C5] bg-[#F3EDE2]/65 hover:bg-[#F3EDE2] hover:border-[#1C1917] transition-all rounded-sm cursor-pointer flex flex-col justify-between min-h-[196px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
                      Silhouette I
                    </span>
                    <svg
                      viewBox="0 0 32 32"
                      className="w-7 h-7 stroke-[#1C1917] fill-none"
                      strokeWidth="1.2"
                      aria-hidden="true"
                    >
                      <circle cx="16" cy="10" r="4.5" />
                      <path d="M8 27 L10 17 L22 17 L24 27" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 pt-6">
                    <span className="block font-serif text-2xl text-[#1C1917] tracking-wide">
                      HIM
                    </span>
                    <span className="block text-xs text-[#57524C] leading-relaxed">
                      Tailored overcoat, rain-darkened station stone, quiet
                      meridian framing.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPresentation("HER")}
                  className="group p-7 text-left border border-[#DDD4C5] bg-[#F3EDE2]/65 hover:bg-[#F3EDE2] hover:border-[#1C1917] transition-all rounded-sm cursor-pointer flex flex-col justify-between min-h-[196px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
                      Silhouette II
                    </span>
                    <svg
                      viewBox="0 0 32 32"
                      className="w-7 h-7 stroke-[#1C1917] fill-none"
                      strokeWidth="1.2"
                      aria-hidden="true"
                    >
                      <circle cx="16" cy="10" r="4.5" />
                      <path d="M9 27 C10 19 12 17 16 17 C20 17 22 19 23 27" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 pt-6">
                    <span className="block font-serif text-2xl text-[#1C1917] tracking-wide">
                      HER
                    </span>
                    <span className="block text-xs text-[#57524C] leading-relaxed">
                      Draped wool silhouette, warm amber study light, poised
                      architectural framing.
                    </span>
                  </div>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectPresentation("UNSPECIFIED")}
                  className="text-xs uppercase tracking-[0.2em] text-[#57524C] hover:text-[#1C1917] underline underline-offset-4 py-2 px-4 transition-colors cursor-pointer"
                >
                  Continue without selecting either
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="profile"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="signature-heading"
              className="space-y-8"
            >
              <div className="space-y-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
                  Prologue · Step 02 of 02 · Optional Signature
                </p>
                <h1
                  id="signature-heading"
                  className="font-serif text-3xl sm:text-4xl text-[#1C1917]"
                >
                  Sign your narrative dossier
                </h1>
                <p className="text-sm text-[#57524C] max-w-md mx-auto leading-relaxed">
                  You may personalize your final report with a name, or enter
                  the six chapters completely anonymously.
                </p>
              </div>

              <form
                onSubmit={(e) => void handleStartWithProfile(e)}
                className="bg-[#F3EDE2]/65 border border-[#DDD4C5] p-6 sm:p-8 rounded-sm space-y-6"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#8A8178] pb-3 border-b border-[#DDD4C5]">
                  <span>
                    Selected Silhouette:{" "}
                    <strong className="text-[#1C1917] font-medium">
                      {presentation === "UNSPECIFIED"
                        ? "Unspecified"
                        : presentation}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("presentation")}
                    className="underline underline-offset-4 hover:text-[#1C1917] cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="display-name-input"
                      className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C] mb-2"
                    >
                      Display Name
                    </label>
                    <input
                      id="display-name-input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Elena, Arjun, M."
                      maxLength={60}
                      className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-sm text-[#1C1917] placeholder:text-[#8A8178]/70 focus:outline-none focus:border-[#1C1917] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="instagram-handle-input"
                      className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C] mb-2"
                    >
                      Instagram Handle{" "}
                      <span className="text-[#8A8178] normal-case tracking-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="instagram-handle-input"
                      type="text"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                      placeholder="@username"
                      maxLength={40}
                      className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-sm text-[#1C1917] placeholder:text-[#8A8178]/70 focus:outline-none focus:border-[#1C1917] transition-colors"
                    />
                  </div>
                </div>

                {/* Transparent Consent & Data Governance Disclosure */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#1C1917] rounded border-[#DDD4C5] cursor-pointer"
                    />
                    <span className="text-xs text-[#57524C] leading-relaxed">
                      I consent to storing my optional display name, handle, and
                      in-game chapter choices to generate my narrative report.
                      Records are visible only to the project&apos;s sole
                      authorized curator and may be erased at any time via{" "}
                      <Link
                        href="/privacy"
                        className="underline underline-offset-2 text-[#1C1917]"
                      >
                        Privacy &amp; Data Deletion
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <p
                    role="alert"
                    className="text-xs text-[#9E6B68] bg-[#F5EBEA] px-3.5 py-2.5 rounded-sm border border-[#9E6B68]/30"
                  >
                    {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex flex-col space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <span>
                      {isSubmitting
                        ? "Preparing Chapter 01..."
                        : "Save Signature & Begin"}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-2.5" />
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-[#DDD4C5]" />
                    <span className="flex-shrink mx-3 text-[10px] uppercase tracking-[0.22em] text-[#8A8178]">
                      or play unrecorded by name
                    </span>
                    <div className="flex-grow border-t border-[#DDD4C5]" />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={isSubmitting}
                    onClick={() => void handleSkipAnonymously()}
                    className="w-full"
                  >
                    Continue Anonymously
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#8A8178] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#545E4E] shrink-0" />
                  <span>
                    No third-party ad trackers. Request deletion anytime on
                    /privacy.
                  </span>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
