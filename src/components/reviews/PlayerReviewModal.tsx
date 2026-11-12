"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import type { PlayerReview, ReviewCategory } from "@/lib/types";

interface PlayerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (review: PlayerReview) => void;
  defaultCategory?: ReviewCategory;
  defaultMode?: "senior" | "junior" | "both" | "general";
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs Polish — 1 Star",
  2: "Fair Attempt — 2 Stars",
  3: "Good Deductive Experience — 3 Stars",
  4: "Great Atmospheric Mystery — 4 Stars",
  5: "Exceptional Masterpiece — 5 Stars",
};

const CATEGORIES: { id: ReviewCategory; label: string }[] = [
  { id: "general", label: "General Experience" },
  { id: "solo", label: "Solo Campaign" },
  { id: "junior", label: "Junior Academy" },
  { id: "story", label: "Story & Atmosphere" },
  { id: "puzzles", label: "Puzzles & Logic" },
  { id: "design", label: "Art & Audio Design" },
];

export function PlayerReviewModal({
  isOpen,
  onClose,
  onReviewSubmitted,
  defaultCategory = "general",
  defaultMode = "general",
}: PlayerReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<ReviewCategory>(defaultCategory);
  const [playerName, setPlayerName] = useState<string>("");
  const [instagramId, setInstagramId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Pre-fill username and Instagram if player is registered
  useEffect(() => {
    try {
      const stored = localStorage.getItem("the_unwritten_player");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          username?: string;
          instagramId?: string;
        };
        if (parsed.username && !playerName) {
          setPlayerName(parsed.username);
        }
        if (parsed.instagramId && !instagramId) {
          setInstagramId(parsed.instagramId);
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen, playerName, instagramId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = playerName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter your callsign or username (at least 2 characters).");
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length < 2) {
      setErrorMsg("Please provide a brief headline for your review.");
      return;
    }

    const cleanFeedback = feedback.trim();
    if (!cleanFeedback || cleanFeedback.length < 5) {
      setErrorMsg("Please share at least a sentence of feedback (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: cleanName,
          instagramId: instagramId.trim() || undefined,
          rating,
          title: cleanTitle,
          feedback: cleanFeedback,
          category,
          modePlayed: defaultMode,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        review?: PlayerReview;
        error?: string;
      };

      if (!res.ok || !data.review) {
        throw new Error(data.error || "Failed to record your review.");
      }

      setIsSuccess(true);
      onReviewSubmitted(data.review);

      // Auto close after celebrating
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-xl bg-[#1A1511] text-[#FAF7F2] border-2 border-[#544333] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-[#241D17] border-b-2 border-[#4A3928] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-950/80 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-wide">
                Inscribe Your Dispatch
              </h2>
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-200">
                Player Review &amp; Community Feedback
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">
                Dispatch Preserved
              </h3>
              <p className="text-xs sm:text-sm text-[#DDD4C5] max-w-sm mx-auto leading-relaxed">
                Thank you for your thoughts. Your review has been inscribed into the Academy archives and published to the community board.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Star Rating Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-200 font-bold">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isLit = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label={`${starVal} Star`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isLit
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-mono font-bold text-[#DDD4C5]">
                    {RATING_LABELS[activeRating]}
                  </span>
                </div>
              </div>

              {/* 2. Category Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-200 font-bold">
                  Focus Area
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        category === c.id
                          ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                          : "bg-[#292119] text-[#DDD4C5] border-[#544333] hover:border-amber-400/60"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Player Callsign & Optional Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Your Callsign / Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Agent_Zero or Priya N."
                    maxLength={60}
                    className="w-full px-3.5 py-2.5 bg-[#14100D] border-2 border-[#544333] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Instagram ID <span className="text-zinc-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      value={instagramId}
                      onChange={(e) => setInstagramId(e.target.value.replace(/^@+/, ""))}
                      placeholder="handle"
                      maxLength={60}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#14100D] border-2 border-[#544333] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Review Headline / Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Headline <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The spatial labyrinth in Chamber 5 was unforgettable"
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border-2 border-[#544333] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* 5. Detailed Review Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Field Report / Feedback <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share what worked, moments that challenged your thinking, or suggestions for the creator..."
                  maxLength={2000}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border-2 border-[#544333] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                />
                <span className="block text-right text-[10px] font-mono text-zinc-500">
                  {feedback.length} / 2000 characters
                </span>
              </div>

              {/* 6. Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-[#544333] text-xs font-mono font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs font-mono uppercase tracking-wider border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Dispatch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
