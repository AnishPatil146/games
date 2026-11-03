"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Radio, Search, Send } from "lucide-react";
import { Button } from "@/components/Button";
import { UnknownMessageArtwork } from "@/components/artwork/SceneArtwork";
import { createStopwatch } from "@/lib/timing";
import { EventType } from "@/lib/types";

interface ChapterProps {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onComplete: () => void;
}

const PRESET_REPLIES = [
  "State which station and what time.",
  "Who gave you this frequency?",
  "If you know, say it plainly.",
];

export function Chapter3UnknownMessage({
  onTrackEvent,
  onComplete,
}: ChapterProps) {
  const prefersReducedMotion = useReducedMotion();
  const stopwatchRef = useRef(createStopwatch());

  const [tracedSender, setTracedSender] = useState(false);
  const [sweptPerimeter, setSweptPerimeter] = useState(false);
  const [replyComposerOpen, setReplyComposerOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [finalOutcome, setFinalOutcome] = useState<
    "replied" | "ignored" | null
  >(null);
  const [sentMessageCopy, setSentMessageCopy] = useState<string | null>(null);

  useEffect(() => {
    stopwatchRef.current.reset();
  }, []);

  const getElapsedMs = () => stopwatchRef.current.elapsedMs(100);

  const handleTraceSender = async () => {
    if (tracedSender || finalOutcome) return;
    setTracedSender(true);
    await onTrackEvent("clue_inspected", {
      clueId: "relay_routing_header",
      elapsedMs: getElapsedMs(),
    });
    await onTrackEvent("choice_selected", {
      choiceId: "investigate_sender",
      durationMs: getElapsedMs(),
    });
  };

  const handleSweepPerimeter = async () => {
    if (sweptPerimeter || finalOutcome) return;
    setSweptPerimeter(true);
    await onTrackEvent("clue_inspected", {
      clueId: "casement_window_sedan",
      elapsedMs: getElapsedMs(),
    });
    await onTrackEvent("choice_selected", {
      choiceId: "look_for_evidence",
      durationMs: getElapsedMs(),
    });
  };

  const handleSendReply = async (textToSend: string) => {
    const cleaned = textToSend.trim();
    if (!cleaned || finalOutcome) return;
    setSentMessageCopy(cleaned);
    setFinalOutcome("replied");
    await onTrackEvent("choice_selected", {
      choiceId: "reply_immediately",
      replyPreview: cleaned.slice(0, 120),
      tracedSender,
      sweptPerimeter,
      durationMs: getElapsedMs(),
    });
  };

  const handleIgnoreMessage = async () => {
    if (finalOutcome) return;
    setFinalOutcome("ignored");
    await onTrackEvent("choice_selected", {
      choiceId: "ignore_message",
      tracedSender,
      sweptPerimeter,
      durationMs: getElapsedMs(),
    });
  };

  const handleProceed = async () => {
    await onTrackEvent("chapter_completed", {
      outcome: finalOutcome,
      tracedSender,
      sweptPerimeter,
      durationMs: getElapsedMs(),
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 03 · Upper Study</span>
          <span className="font-mono text-[#9E6B68]">03:14 AM</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Unknown Message
        </h1>
      </div>

      {/* Bespoke Study & Receiver Scene */}
      <figure className="border border-[#DDD4C5] rounded-sm overflow-hidden bg-[#171615]">
        <UnknownMessageArtwork sweptPerimeter={sweptPerimeter} />
        <figcaption className="px-4 py-2.5 bg-[#141210] text-[#A89F93] text-[11px] flex items-center justify-between">
          <span>Encrypted Short-Range Receiver · Channel 09</span>
          <span>
            {tracedSender ? "Relay Node: 400m Radius" : "Origin Unverified"}
          </span>
        </figcaption>
      </figure>

      {/* Incoming Transmission Display */}
      <div className="p-6 bg-[#141210] text-[#FAF7F2] rounded-sm border border-[#3E3730] space-y-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Unlisted Sender · Direct Packet</span>
          <span>Delivered 03:14:08</span>
        </div>
        <blockquote className="font-serif text-2xl sm:text-[26px] text-[#FAF7F2] leading-snug">
          &ldquo;I know what happened yesterday.&rdquo;
        </blockquote>

        {sentMessageCopy && (
          <div className="pt-3 border-t border-[#FAF7F2]/10 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8FA184]">
              Your Outgoing Transmission
            </p>
            <p className="text-sm text-[#E7E0D3] font-mono">
              &gt; {sentMessageCopy}
            </p>
          </div>
        )}
      </div>

      {/* Optional Investigative Findings */}
      <AnimatePresence>
        {(tracedSender || sweptPerimeter) && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {tracedSender && (
              <div className="p-4 bg-[#F3EDE2] border-l-2 border-[#545E4E] rounded-r-sm text-sm text-[#1C1917]">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#545E4E] font-semibold mb-1">
                  Signal Trace
                </span>
                Packet headers show zero external hops: the message originated
                from a portable repeater within four hundred meters of this
                building, timed to expire in ninety seconds.
              </div>
            )}
            {sweptPerimeter && (
              <div className="p-4 bg-[#F3EDE2] border-l-2 border-[#1C1917] rounded-r-sm text-sm text-[#1C1917]">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8A8178] font-semibold mb-1">
                  Perimeter Sweep
                </span>
                Parting the casement blind by an inch, you spot an unlit dark
                sedan parked directly beneath the corner streetlamp, exhaust
                curling faintly into the cold air.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Response Choices */}
      {!finalOutcome ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={tracedSender}
              onClick={() => void handleTraceSender()}
              className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                tracedSender
                  ? "bg-[#E9ECE6]/60 border-[#545E4E]/40 opacity-75 cursor-default"
                  : "bg-[#FAF7F2] border-[#DDD4C5] hover:bg-[#F3EDE2] hover:border-[#1C1917]"
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#545E4E] font-medium">
                <Radio className="w-3.5 h-3.5" />
                <span>
                  {tracedSender ? "Metadata Traced" : "Investigate the sender"}
                </span>
              </div>
              <p className="text-xs text-[#57524C] mt-1.5">
                Inspect packet routing headers before deciding whether to
                engage.
              </p>
            </button>

            <button
              type="button"
              disabled={sweptPerimeter}
              onClick={() => void handleSweepPerimeter()}
              className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                sweptPerimeter
                  ? "bg-[#E9ECE6]/60 border-[#545E4E]/40 opacity-75 cursor-default"
                  : "bg-[#FAF7F2] border-[#DDD4C5] hover:bg-[#F3EDE2] hover:border-[#1C1917]"
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#1C1917] font-medium">
                <Search className="w-3.5 h-3.5" />
                <span>
                  {sweptPerimeter
                    ? "Street Observed"
                    : "Look for physical evidence"}
                </span>
              </div>
              <p className="text-xs text-[#57524C] mt-1.5">
                Check the study casement window and doorway before touching the
                console.
              </p>
            </button>
          </div>

          {!replyComposerOpen ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setReplyComposerOpen(true)}
                className="p-5 text-left border border-[#1C1917] bg-[#1C1917] text-[#FAF7F2] hover:bg-[#2E2925] rounded-sm transition-colors cursor-pointer"
              >
                <span className="block text-xs uppercase tracking-[0.18em] font-medium">
                  Reply immediately
                </span>
                <span className="block text-xs text-[#D6CEC0] mt-1">
                  Challenge the sender directly to test what they actually know.
                </span>
              </button>

              <button
                type="button"
                onClick={() => void handleIgnoreMessage()}
                className="p-5 text-left border border-[#DDD4C5] bg-[#F3EDE2]/75 hover:bg-[#E7E0D3] hover:border-[#1C1917] rounded-sm transition-colors cursor-pointer"
              >
                <span className="block text-xs uppercase tracking-[0.18em] text-[#1C1917] font-medium">
                  Ignore the message
                </span>
                <span className="block text-xs text-[#57524C] mt-1">
                  Sever the carrier link and deny the sender confirmation of
                  your presence.
                </span>
              </button>
            </div>
          ) : (
            <div className="p-5 sm:p-6 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#1C1917] font-medium">
                  Compose Direct Response
                </span>
                <button
                  type="button"
                  onClick={() => setReplyComposerOpen(false)}
                  className="text-xs text-[#57524C] underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_REPLIES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => void handleSendReply(preset)}
                    className="text-xs px-3 py-2 bg-[#FAF7F2] border border-[#DDD4C5] hover:border-[#1C1917] rounded-sm text-[#1C1917] transition-colors cursor-pointer"
                  >
                    &ldquo;{preset}&rdquo;
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Or write your own response..."
                  maxLength={100}
                  aria-label="Custom reply to unknown sender"
                  className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!replyText.trim()}
                  onClick={() => void handleSendReply(replyText)}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Transmit
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 bg-[#F3EDE2]/80 border border-[#DDD4C5] rounded-sm space-y-4"
        >
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8A8178]">
            {finalOutcome === "replied"
              ? "Carrier Response Logged"
              : "Channel Terminated"}
          </p>
          <p className="font-serif italic text-lg text-[#1C1917] leading-relaxed">
            {finalOutcome === "replied"
              ? "For six seconds the receiver cursor pulses in silence. Then a single acknowledgement code flashes—and outside on the wet avenue, headlamps ignite and pull quietly out of sight."
              : "You switch off the receiver without transmitting a byte. Starved of confirmation, the anonymous relay times out; a minute later, the dark sedan down on the avenue pulls away into the rain."}
          </p>
          <div className="flex justify-end">
            <Button onClick={() => void handleProceed()} size="md">
              <span>Continue to Chapter 04</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
