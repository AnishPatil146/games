"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Eye } from "lucide-react";
import { Button } from "@/components/Button";
import { LastTrainArtwork } from "@/components/artwork/SceneArtwork";
import { EventType } from "@/lib/types";

interface ChapterProps {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onComplete: () => void;
}

export function Chapter1LastTrain({ onTrackEvent, onComplete }: ChapterProps) {
  const prefersReducedMotion = useReducedMotion();
  const mountTimeRef = useRef<number>(0);

  const [inspectedWallet, setInspectedWallet] = useState(false);
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  const getElapsedMs = () =>
    Math.max(100, Math.round(performance.now() - mountTimeRef.current));

  const handleInspectFirst = async () => {
    if (inspectedWallet || finalChoice) return;
    setInspectedWallet(true);
    await onTrackEvent("clue_inspected", {
      clueId: "fallen_leather_wallet",
      elapsedMs: getElapsedMs(),
    });
    await onTrackEvent("choice_selected", {
      choiceId: "investigate_first",
      durationMs: getElapsedMs(),
    });
  };

  const handleCommitChoice = async (choiceId: string) => {
    if (isSubmitting || finalChoice) return;
    setIsSubmitting(true);
    const durationMs = getElapsedMs();

    setFinalChoice(choiceId);
    await onTrackEvent("choice_selected", {
      choiceId,
      inspectedFirst: inspectedWallet,
      durationMs,
    });
    setIsSubmitting(false);
  };

  const handleProceed = async () => {
    await onTrackEvent("chapter_completed", {
      finalChoice,
      inspectedWallet,
      durationMs: getElapsedMs(),
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Chapter Rubric */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 01 · Platform 4</span>
          <span className="inline-flex items-center gap-1.5 text-[#9E6B68] font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>23:58</span>
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Last Train
        </h1>
      </div>

      {/* Bespoke Atmospheric Artwork */}
      <figure className="border border-[#DDD4C5] rounded-sm overflow-hidden bg-[#171615] shadow-sm">
        <LastTrainArtwork inspectedWallet={inspectedWallet} />
        <figcaption className="px-4 py-2.5 bg-[#141210] text-[#A89F93] text-[11px] tracking-[0.06em] flex items-center justify-between">
          <span>Northbound Terminus · Pneumatic doors closing in 18 seconds</span>
          {inspectedWallet && (
            <span className="text-[#D8C39E] uppercase tracking-[0.16em] text-[10px]">
              Artifact Examined
            </span>
          )}
        </figcaption>
      </figure>

      {/* Narrative Prose */}
      <div className="space-y-4 font-serif text-lg sm:text-[19px] leading-relaxed text-[#1C1917]">
        <p>
          Rain needles the iron canopy above Platform 4. Ahead of you, the last
          midnight express idles with its carriage doors parted—amber warmth
          spilling across wet stone. If those doors seal without you, there is
          no other train until dawn.
        </p>
        <p>
          Ten paces toward the dark exit stairwell, a stranger in a charcoal
          coat turns away. A worn calfskin wallet slips from their pocket and
          lands silently beside the yellow platform line. They have not noticed.
        </p>
      </div>

      {/* Interactive Wallet Detail Reveal */}
      <AnimatePresence>
        {inspectedWallet && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="p-5 bg-[#F3EDE2] border-l-2 border-[#545E4E] rounded-r-sm space-y-2"
          >
            <div className="flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] text-[#545E4E] font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Closer Observation</span>
            </div>
            <p className="text-sm text-[#1C1917] leading-relaxed">
              Kneeling briefly, you glimpse an archival transit credential
              embossed{" "}
              <span className="font-medium italic">Dr. Aris Thorne</span>,
              several crisp notes, and a folded slip of rag paper bearing one
              inked line:{" "}
              <span className="font-serif italic">
                &ldquo;Platform 4 — before midnight.&rdquo;
              </span>{" "}
              The carriage chime sounds its final warning.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision Matrix or Consequence Resolution */}
      {!finalChoice ? (
        <div className="space-y-3 pt-2" role="group" aria-label="Chapter 1 choices">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178] pb-1">
            How do you act in the remaining seconds?
          </p>

          {!inspectedWallet && (
            <button
              type="button"
              onClick={() => void handleInspectFirst()}
              className="w-full text-left p-4 sm:p-5 border border-[#DDD4C5] bg-[#F3EDE2]/55 hover:bg-[#F3EDE2] hover:border-[#545E4E] transition-all rounded-sm cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-[#1C1917]">
                  Inspect the fallen wallet first
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#545E4E]">
                  Observe
                </span>
              </div>
              <p className="text-xs text-[#57524C] mt-1">
                Take three seconds to check its contents before committing to
                the train or the stranger.
              </p>
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleCommitChoice("return_wallet")}
            className="w-full text-left p-4 sm:p-5 border border-[#DDD4C5] bg-[#FAF7F2] hover:bg-[#F3EDE2] hover:border-[#1C1917] transition-all rounded-sm cursor-pointer"
          >
            <span className="block font-medium text-sm text-[#1C1917]">
              Forfeit the train and return the wallet in person
            </span>
            <span className="block text-xs text-[#57524C] mt-1">
              Retrieve the leather case and hurry toward the stairwell, letting
              the midnight express depart.
            </span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleCommitChoice("call_out")}
            className="w-full text-left p-4 sm:p-5 border border-[#DDD4C5] bg-[#FAF7F2] hover:bg-[#F3EDE2] hover:border-[#1C1917] transition-all rounded-sm cursor-pointer"
          >
            <span className="block font-medium text-sm text-[#1C1917]">
              Call out sharply across the platform
            </span>
            <span className="block text-xs text-[#57524C] mt-1">
              Alert the stranger from beside the open carriage door so you can
              still step aboard in time.
            </span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleCommitChoice("catch_train")}
            className="w-full text-left p-4 sm:p-5 border border-[#DDD4C5] bg-[#FAF7F2] hover:bg-[#F3EDE2] hover:border-[#1C1917] transition-all rounded-sm cursor-pointer"
          >
            <span className="block font-medium text-sm text-[#1C1917]">
              Step onto the train before the doors seal
            </span>
            <span className="block text-xs text-[#57524C] mt-1">
              Hold to your departure schedule and leave the platform undisturbed.
            </span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 bg-[#F3EDE2]/80 border border-[#DDD4C5] rounded-sm space-y-5"
        >
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
            Recorded Consequence
          </p>
          <p className="font-serif italic text-lg text-[#1C1917] leading-relaxed">
            {finalChoice === "return_wallet" &&
              "Behind you, the pneumatic doors seal with a muted hiss and tail-lights dissolve into mist. At the stairwell, the stranger turns in quiet astonishment, presses the wallet to their coat, and points toward a recessed service door beneath the station arches."}
            {finalChoice === "call_out" &&
              "Your voice cuts cleanly beneath the iron vaulting. The stranger pivots, spots the calfskin case under the lamp, and raises a gloved hand in gratitude just as you step across the threshold of the departing carriage."}
            {finalChoice === "catch_train" &&
              "You cross into the quiet carriage a breath before the rubber seals lock. Through rain-streaked glass, the leather wallet diminishes beneath the platform lamp until darkness swallows the terminus."}
          </p>

          <div className="pt-1 flex justify-end">
            <Button onClick={() => void handleProceed()} size="md">
              <span>Continue to Chapter 02</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
