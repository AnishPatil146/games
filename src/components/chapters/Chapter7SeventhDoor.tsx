"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, LockOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { EventType } from "@/lib/types";
import { createStopwatch } from "@/lib/timing";

interface Chapter7Props {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onComplete: () => void;
}

const SEVENTH_DOOR_CHOICES = [
  {
    id: "leave_lantern_lit",
    title: "Leave the Brass Lantern Burning",
    subtitle: "Keep the threshold illuminated for whoever arrives next",
    reflection:
      "You set the lantern beside the unindexed ledger so the next visitor never enters in darkness.",
  },
  {
    id: "inscribe_margin_note",
    title: "Inscribe an Unsigned Margin Note",
    subtitle: "Add a quiet observation to the archive without claiming authorship",
    reflection:
      "Your handwriting joins a century of anonymous witnesses along the vellum edge.",
  },
  {
    id: "seal_the_ledger",
    title: "Close and Seal the Folio",
    subtitle: "Preserve the room's stillness undisturbed",
    reflection:
      "Some rooms keep their meaning precisely because nothing inside them was taken.",
  },
];

export function Chapter7SeventhDoor({
  onTrackEvent,
  onComplete,
}: Chapter7Props) {
  const prefersReducedMotion = useReducedMotion();
  const [stopwatch] = useState(() => createStopwatch());
  const [unsealed, setUnsealed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnseal = async () => {
    if (unsealed) return;
    setUnsealed(true);
    await onTrackEvent("seventh_door_unlocked", {
      unlockedVia: "threshold_chamber",
      elapsedMs: stopwatch.elapsedMs(),
    });
  };

  const handleSelectAct = async (choiceId: string) => {
    if (selectedChoice || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedChoice(choiceId);

    const elapsedMs = stopwatch.elapsedMs();
    await onTrackEvent("choice_selected", {
      choiceId,
      chapter: 7,
      responseTimeMs: elapsedMs,
    });
    await onTrackEvent("seventh_door_completed", {
      doorChoice: choiceId,
      durationMs: elapsedMs,
    });
    setIsSubmitting(false);
  };

  const chosenObj = SEVENTH_DOOR_CHOICES.find((c) => c.id === selectedChoice);

  return (
    <div className="space-y-10">
      {/* Chapter Header */}
      <header className="space-y-3 border-b border-[#DDD4C5] pb-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-[#9E6B68]">
          <span>Optional Epilogue · Threshold VII</span>
          <span>Unlocked by Archival Scrutiny</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
          The Seventh Door
        </h1>
        <p className="text-sm sm:text-base text-[#57524C] leading-relaxed max-w-2xl">
          Behind the sixth horizon stands a narrow cedar doorway that does not
          appear on the station map. Only travelers who lingered over hidden
          details across earlier chapters notice its hairline seam.
        </p>
      </header>

      {/* Architectural Seventh Door Artwork */}
      <div className="relative rounded-sm overflow-hidden border border-[#2E2924] bg-[#141210] text-[#FAF7F2] p-8 sm:p-12">
        <svg
          viewBox="0 0 640 240"
          className="w-full h-48 sm:h-56 mx-auto"
          role="img"
          aria-label="An arched cedar and brass doorway set into quiet stone"
        >
          <defs>
            <radialGradient id="doorGlow" cx="50%" cy="50%" r="55%">
              <stop
                offset="0%"
                stopColor={unsealed ? "#C8B28E" : "#545E4E"}
                stopOpacity={unsealed ? "0.38" : "0.16"}
              />
              <stop offset="100%" stopColor="#141210" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="640" height="240" fill="#141210" />
          <circle cx="320" cy="120" r="130" fill="url(#doorGlow)" />
          {/* Outer Stone Arch */}
          <path
            d="M 245 225 L 245 95 A 75 75 0 0 1 395 95 L 395 225"
            fill="none"
            stroke="#57524C"
            strokeWidth="2"
          />
          {/* Inner Door Leaf */}
          <path
            d={
              unsealed
                ? "M 258 225 L 258 98 A 62 62 0 0 1 360 55 L 360 212 Z"
                : "M 258 225 L 258 98 A 62 62 0 0 1 382 98 L 382 225 Z"
            }
            fill="#1E1B18"
            stroke="#C8B28E"
            strokeWidth="1.5"
          />
          {/* Brass Seal */}
          <circle
            cx={unsealed ? 342 : 362}
            cy="142"
            r="7"
            fill={unsealed ? "#C8B28E" : "none"}
            stroke="#C8B28E"
            strokeWidth="1.5"
          />
          <text
            x="320"
            y="28"
            textAnchor="middle"
            fontSize="10"
            letterSpacing="4"
            fill="#A89F93"
          >
            FOLIO VII · UNINDEXED CHAMBER
          </text>
        </svg>

        {!unsealed ? (
          <div className="text-center space-y-4 pt-4">
            <p className="font-serif italic text-lg text-[#D6CEC0] max-w-lg mx-auto">
              &ldquo;Not every room asks to be solved. One room simply asks what
              you leave behind when no score is kept.&rdquo;
            </p>
            <Button variant="ivory" size="md" onClick={() => void handleUnseal()}>
              <KeyRound className="w-4 h-4 mr-2" />
              Turn the Unindexed Latch
            </Button>
          </div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 pt-2 border-t border-[#FAF7F2]/10"
          >
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#C8B28E]">
              <LockOpen className="w-3.5 h-3.5" />
              Chamber Unsealed
            </p>
            <p className="text-xs sm:text-sm text-[#D6CEC0] max-w-xl mx-auto leading-relaxed">
              Inside rests a reading desk, an unsealed brass lantern, and an
              open vellum ledger bearing traces of everyone who noticed the
              hidden clues before you.
            </p>
          </motion.div>
        )}
      </div>

      {/* Choice Selection once unsealed */}
      {unsealed && (
        <section className="space-y-5">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Choose your final act inside the chamber:
          </h2>

          <div className="grid grid-cols-1 gap-3.5">
            {SEVENTH_DOOR_CHOICES.map((opt) => {
              const isSelected = selectedChoice === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(selectedChoice) || isSubmitting}
                  onClick={() => void handleSelectAct(opt.id)}
                  className={`w-full text-left p-5 rounded-sm border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                      : selectedChoice
                      ? "bg-[#F3EDE2]/40 text-[#8A8178] border-[#DDD4C5] opacity-60 cursor-default"
                      : "bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] border-[#DDD4C5]"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-serif text-lg sm:text-xl">
                      {opt.title}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#C8B28E]">
                        Inscribed
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? "text-[#D6CEC0]" : "text-[#57524C]"
                    }`}
                  >
                    {opt.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {chosenObj && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-4"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#545E4E]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Seventh Threshold Recorded</span>
              </div>
              <p className="font-serif italic text-lg text-[#1C1917]">
                {chosenObj.reflection}
              </p>
              <div>
                <Button size="md" onClick={onComplete}>
                  Return to Personal Monograph
                </Button>
              </div>
            </motion.div>
          )}
        </section>
      )}
    </div>
  );
}

