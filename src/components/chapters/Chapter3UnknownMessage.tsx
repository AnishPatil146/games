"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Send, ShieldAlert, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter3Props {
  onComplete: (choiceId: string, durationMs: number, pathTaken: string[]) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
}

export function Chapter3UnknownMessage({ onComplete, onEvent }: Chapter3Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [hasInspectedMetadata, setHasInspectedMetadata] = useState(false);
  const [hasExaminedSurroundings, setHasExaminedSurroundings] = useState(false);
  const [outcomeRevealed, setOutcomeRevealed] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    onEvent("chapter_started", { chapter: 3, title: "The Unknown Message" });
  }, [onEvent]);

  const handleActionClick = (actionId: string) => {
    const elapsed = Date.now() - startTimeRef.current;
    const nextHistory = [...actionHistory, actionId];
    setActionHistory(nextHistory);

    onEvent("choice_selected", {
      chapter: 3,
      choiceId: actionId,
      durationMs: elapsed,
      step: nextHistory.length,
    });

    if (actionId === "investigate_sender") {
      setHasInspectedMetadata(true);
    } else if (actionId === "look_for_evidence") {
      setHasExaminedSurroundings(true);
    } else {
      setSelectedAction(actionId);
      setOutcomeRevealed(true);
    }
  };

  const handleSendCustomReply = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const actionId = "reply_immediately";
    const nextHistory = [...actionHistory, actionId];
    setActionHistory(nextHistory);
    setSelectedAction(actionId);

    onEvent("choice_selected", {
      chapter: 3,
      choiceId: actionId,
      customReply: replyText,
      durationMs: elapsed,
      step: nextHistory.length,
    });

    setOutcomeRevealed(true);
  };

  const handleProceed = () => {
    const elapsed = Date.now() - startTimeRef.current;
    onComplete(selectedAction || "investigate_sender", elapsed, actionHistory);
  };

  return (
    <div className="space-y-8">
      {/* Narrative Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Encrypted Transmission • 03:14 AM</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Unknown Message
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          A low vibration on the glass desk. A single line from an unlisted frequency.
        </p>
      </div>

      {/* The Incoming Message Display */}
      <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7]/80 max-w-lg mx-auto shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-2 text-[11px] text-[#78716C]">
          <span className="uppercase tracking-wider">Origin: UNKNOWN_NODE_49</span>
          <span>Just now</span>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded border border-[#E0D7CB] font-serif text-lg text-[#1C1917] text-center italic">
          &ldquo;I know what happened yesterday.&rdquo;
        </div>

        <div className="text-[11px] text-[#8C827A] flex items-center justify-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-[#A37070]" />
          <span>Encrypted routing • No caller ID available</span>
        </div>
      </div>

      {/* Atmospheric Investigation Details */}
      <div className="space-y-3">
        <AnimatePresence>
          {hasInspectedMetadata && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded border border-[#5B6356]/40 bg-[#EDF0EB] text-xs space-y-1.5 text-[#2C3328]"
            >
              <div className="flex items-center space-x-2 font-medium uppercase tracking-wider text-[11px] text-[#5B6356]">
                <Search className="w-3.5 h-3.5" />
                <span>Transmission Analysis</span>
              </div>
              <p className="leading-relaxed">
                The timestamp originates from an internal relay located in the
                same metropolitan exchange as the railway terminal from Chapter 1.
                The signal hopped through three relay stations before reaching your device.
              </p>
            </motion.div>
          )}

          {hasExaminedSurroundings && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded border border-[#5B6356]/40 bg-[#EDF0EB] text-xs space-y-1.5 text-[#2C3328]"
            >
              <div className="flex items-center space-x-2 font-medium uppercase tracking-wider text-[11px] text-[#5B6356]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Environmental Sweep</span>
              </div>
              <p className="leading-relaxed">
                You step toward the tall library window overlooking the street.
                A dark sedan is parked under the streetlamp with its hazard lights off.
                No footprints in the fresh damp gravel, yet someone has recently cleared the sill.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decision Selection */}
      {!outcomeRevealed ? (
        <div className="space-y-4 pt-2">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
            How do you respond to the unknown sender?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!hasInspectedMetadata && (
              <button
                onClick={() => handleActionClick("investigate_sender")}
                className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all group"
              >
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356]">
                  Investigate Sender First
                </span>
                <span className="block text-xs text-[#78716C]">
                  Trace the IP packets, gateway relay, and origin metadata before communicating.
                </span>
              </button>
            )}

            {!hasExaminedSurroundings && (
              <button
                onClick={() => handleActionClick("look_for_evidence")}
                className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all group"
              >
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356]">
                  Look for Evidence First
                </span>
                <span className="block text-xs text-[#78716C]">
                  Observe your immediate perimeter, windows, and surveillance blind spots.
                </span>
              </button>
            )}

            <button
              onClick={() => handleActionClick("ignore_message")}
              className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all group"
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356]">
                Ignore the Message
              </span>
              <span className="block text-xs text-[#78716C]">
                Turn off notifications. Do not grant them the leverage of your attention.
              </span>
            </button>

            <button
              onClick={() => handleActionClick("confront_sender")}
              className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#1C1917] text-left transition-all group"
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1 group-hover:text-[#5B6356]">
                Demand Immediate Identity
              </span>
              <span className="block text-xs text-[#78716C]">
                Send a direct response: &ldquo;Who are you and what do you want?&rdquo;
              </span>
            </button>
          </div>

          {/* Custom Reply Box */}
          <div className="pt-2">
            <div className="p-4 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#57534E]">
                Or Type a Specific Reply:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  maxLength={120}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendCustomReply}
                  disabled={replyText.trim().length === 0}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Consequence & Transition */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4"
        >
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#5B6356] font-semibold">
            <CornerDownRight className="w-4 h-4" />
            <span>Echoes in the Static</span>
          </div>

          <div className="text-sm font-serif text-[#292524] leading-relaxed">
            {selectedAction === "ignore_message" ? (
              <p>
                You slide the receiver into the leather folder and walk away from the desk.
                Five minutes pass in absolute stillness. By refusing to engage in another&apos;s
                game of suspense, you retain initiative. No further transmission arrives.
              </p>
            ) : selectedAction === "reply_immediately" || selectedAction === "confront_sender" ? (
              <p>
                Your response transmits across the wire. Three dots appear instantly on the
                recipient screen, pulsing in sync with your pulse. A second text follows:
                &ldquo;You answer faster than you look. Let us see if you can create as boldly as you react.&rdquo;
              </p>
            ) : (
              <p>
                Your analytical delay gave you vital context. You now know you are not dealing
                with a stranger across the globe, but a spectator in your immediate perimeter.
                The game has shifted from passive defense to deliberate awareness.
              </p>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <Button variant="primary" size="md" onClick={handleProceed}>
              <span>PROCEED TO CHAPTER 04</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

