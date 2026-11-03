"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Train, HelpCircle, ArrowRight, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter1Props {
  onComplete: (choiceId: string, durationMs: number, history: string[]) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
}

export function Chapter1LastTrain({ onComplete, onEvent }: Chapter1Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [investigatedWallet, setInvestigatedWallet] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<string[]>([]);
  const [outcomeRevealed, setOutcomeRevealed] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    onEvent("chapter_started", { chapter: 1, title: "The Last Train" });
  }, [onEvent]);

  const handleAction = (actionId: string) => {
    const elapsed = Date.now() - startTimeRef.current;
    const newHistory = [...decisionHistory, actionId];
    setDecisionHistory(newHistory);
    setSelectedAction(actionId);

    onEvent("choice_selected", {
      chapter: 1,
      choiceId: actionId,
      durationMs: elapsed,
      stepCount: newHistory.length,
      investigatedFirst: investigatedWallet,
    });

    if (actionId === "investigate_first") {
      setInvestigatedWallet(true);
    } else {
      setOutcomeRevealed(true);
    }
  };

  const handleProceed = () => {
    const elapsed = Date.now() - startTimeRef.current;
    onComplete(selectedAction || "return_wallet", elapsed, decisionHistory);
  };

  return (
    <div className="space-y-8">
      {/* Narrative Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <Clock className="w-3.5 h-3.5" />
          <span>Platform 4 • 23:58 PM</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Last Train
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          A platform shrouded in fog. The final bell has already sounded.
        </p>
      </div>

      {/* Atmospheric Narrative */}
      <div className="prose prose-stone text-[#292524] text-sm sm:text-base leading-relaxed space-y-4 font-serif">
        <p>
          Cold night air rolls off the wet iron tracks. The express train idles
          with a low, rhythmic vibration, exhaust rising into the dim halogen lamps.
          The doors are scheduled to seal in forty seconds.
        </p>
        <p>
          A tall figure in a dark wool overcoat hurries past you toward the
          platform stairs, shoulders hunched against the mist. As they turn the
          tiled corner, a heavy leather billfold slips from their overcoat pocket
          and hits the wet stone tiles with a muffled thud.
        </p>
        <p>
          The train conductor raises his whistle. If you turn around to retrieve
          the wallet, you will almost certainly miss the train. If you board now,
          the stranger will disappear into the city night.
        </p>
      </div>

      {/* Investigation Details if examined */}
      <AnimatePresence>
        {investigatedWallet && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded border border-[#5B6356]/30 bg-[#EDF0EB]/60 text-xs sm:text-sm space-y-2 text-[#2C3328]"
          >
            <div className="flex items-center space-x-2 font-medium uppercase tracking-wider text-[11px] text-[#5B6356]">
              <Eye className="w-3.5 h-3.5" />
              <span>Closer Inspection</span>
            </div>
            <p className="leading-relaxed">
              You crouch slightly to scrutinize the dropped item. It is made of
              worn saddle leather, secured with a brass clasp. Tucked inside the
              exterior fold is a handwritten transit card and an envelope stamped
              with an official seal: &ldquo;St. Jude Medical Archives.&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Choices */}
      {!outcomeRevealed ? (
        <div className="space-y-3 pt-4">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C] mb-2">
            What is your immediate response?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("return_wallet")}
              className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all duration-200 group"
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356] transition-colors">
                Return the Wallet
              </span>
              <span className="block text-xs text-[#78716C]">
                Pick up the wallet and chase after the stranger, willingly forfeiting the train.
              </span>
            </button>

            <button
              onClick={() => handleAction("call_out")}
              className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all duration-200 group"
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356] transition-colors">
                Call Out Loudly
              </span>
              <span className="block text-xs text-[#78716C]">
                Shout across the foggy platform to alert them before stepping onto the carriage.
              </span>
            </button>

            {!investigatedWallet && (
              <button
                onClick={() => handleAction("investigate_first")}
                className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all duration-200 group"
              >
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356] transition-colors">
                  Investigate the Situation
                </span>
                <span className="block text-xs text-[#78716C]">
                  Examine the wallet and the stranger&apos;s trajectory before committing.
                </span>
              </button>
            )}

            <button
              onClick={() => handleAction("catch_train")}
              className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all duration-200 group"
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356] transition-colors">
                Board the Train
              </span>
              <span className="block text-xs text-[#78716C]">
                Step inside the carriage. You cannot afford to be stranded in this district.
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Narrative Consequence & Next Chapter Transition */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4"
        >
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#5B6356] font-semibold">
            <Train className="w-4 h-4" />
            <span>Trace Left Behind</span>
          </div>

          <div className="text-sm font-serif text-[#292524] leading-relaxed">
            {selectedAction === "return_wallet" && (
              <p>
                You scoop the leather case from the wet paving stones and sprint toward
                the stairs. Your voice echoes under the arches. The stranger turns, startled,
                then exhales in visible disbelief. Behind you, the pneumatic hiss of train doors
                marks the departure of your ride. You are stranded until dawn, but a debt of fate
                has been resolved.
              </p>
            )}
            {selectedAction === "call_out" && (
              <p>
                Your voice slices cleanly through the damp fog. The stranger pauses at the top of
                the stairway, glances down, and catches sight of the fallen wallet. As they hurry
                back to recover it, you pivot swiftly and cross the train threshold just as the
                conductor blows his whistle. The carriage lurches forward.
              </p>
            )}
            {selectedAction === "catch_train" && (
              <p>
                You step through the brass-trimmed sliding doors. The air inside smells of damp wool
                and aged varnish. Through the rain-streaked window, you watch the lonely leather wallet
                rest on the abandoned platform under the dim yellow lamp. The station slips into the
                darkness. You protected your own destination.
              </p>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <Button variant="primary" size="md" onClick={handleProceed}>
              <span>CONTINUE TO CHAPTER 02</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

