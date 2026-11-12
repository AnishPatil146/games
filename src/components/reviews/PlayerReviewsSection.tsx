"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquareQuote, Sparkles, Plus, Award, CheckCircle2 } from "lucide-react";
import type { PlayerReview, ReviewCategory, ReviewStats } from "@/lib/types";
import { PlayerReviewModal } from "./PlayerReviewModal";

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All Dispatches" },
  { id: "solo", label: "Solo Campaign" },
  { id: "junior", label: "Junior Academy" },
  { id: "story", label: "Story & Lore" },
  { id: "puzzles", label: "Puzzles & Logic" },
  { id: "general", label: "General" },
];

export function PlayerReviewsSection() {
  const [reviews, setReviews] = useState<PlayerReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchReviews = async (cat: string) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (cat !== "all") qs.set("category", cat);
      qs.set("limit", "18");

      const res = await fetch(`/api/reviews?${qs.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as {
          reviews?: PlayerReview[];
          stats?: ReviewStats;
        };
        if (data.reviews) setReviews(data.reviews);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews(activeCategory);
  }, [activeCategory]);

  const handleReviewSubmitted = (newRev: PlayerReview) => {
    setReviews((prev) => [newRev, ...prev]);
    if (stats) {
      setStats({
        ...stats,
        totalReviews: stats.totalReviews + 1,
      });
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      {/* 1. Header & Community Rating Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-white/10 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-[0.22em] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Dispatches &amp; Testimonials</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2] font-black tracking-wide">
            Voices from the Panopticon &amp; Academy
          </h2>

          <p className="text-xs sm:text-sm text-[#DDD4C5] max-w-2xl font-light leading-relaxed">
            Unfiltered field notes, deductive debriefs, and academic impressions recorded by verified players and scholars.
          </p>
        </div>

        {/* Aggregate Score & Action */}
        <div className="flex flex-wrap items-center gap-4">
          {stats && stats.totalReviews > 0 ? (
            <div className="px-5 py-3 rounded-xl bg-[#221A14] border-2 border-[#544333] flex items-center gap-3.5 shadow-xl">
              <div className="text-center">
                <span className="font-serif text-3xl font-black text-amber-300 leading-none">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                  / 5.0
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-[#FAF7F2] font-bold block">
                  {stats.totalReviews} Verified Review{stats.totalReviews === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-xl bg-[#221A14] border border-[#544333] text-xs font-mono text-amber-200">
              Awaiting First Community Dispatches
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs font-mono uppercase tracking-wider border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === tab.id
                ? "bg-[#FAF7F2] text-[#12100E] border-white shadow-md font-black"
                : "bg-[#1E1712] text-[#DDD4C5] border-[#4A3928] hover:border-amber-400/50 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Review Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300 font-mono">
            Retrieving Field Dispatches...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#1E1712] border-2 border-[#4A3928] rounded-2xl p-8">
          <MessageSquareQuote className="w-10 h-10 mx-auto text-zinc-500" />
          <p className="font-serif text-lg text-white">No dispatches in this category yet.</p>
          <p className="text-xs text-[#DDD4C5] max-w-sm mx-auto">
            Be the first investigator or scholar to inscribe your impressions.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-amber-500 text-black font-mono font-black text-xs uppercase tracking-wider"
          >
            Inscribe First Dispatch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-2xl bg-[#1C1713] border-2 transition-all flex flex-col justify-between shadow-xl space-y-4 ${
                rev.featured
                  ? "border-amber-400/80 shadow-[0_10px_35px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/40"
                  : "border-[#4A3928] hover:border-[#8C735B]"
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges & Stars */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                            : "text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {rev.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-mono uppercase font-black tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        Featured
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                      {rev.category}
                    </span>
                  </div>
                </div>

                {/* Review Headline */}
                <h3 className="font-serif font-black text-base sm:text-lg text-white leading-snug">
                  {rev.title}
                </h3>

                {/* Feedback Quote */}
                <p className="text-xs sm:text-sm text-[#E7E0D3] leading-relaxed font-light italic">
                  &ldquo;{rev.feedback}&rdquo;
                </p>

                {/* Creator Official Response (if present) */}
                {rev.adminResponse && (
                  <div className="p-3.5 rounded-xl bg-[#261E16] border-l-2 border-amber-400 space-y-1 mt-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Creator Response · Anish Patil
                    </span>
                    <p className="text-xs text-[#FAF7F2] font-sans leading-relaxed">
                      {rev.adminResponse}
                    </p>
                  </div>
                )}
              </div>

              {/* Author & Footer Metadata */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2E251E] border border-[#8C735B] flex items-center justify-center text-amber-200 font-mono font-bold text-xs shrink-0">
                    {rev.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-sans font-bold text-white text-xs block truncate">
                      {rev.playerName}
                    </span>
                    {rev.instagramId && (
                      <span className="font-mono text-[11px] text-amber-300/80 block truncate">
                        @{rev.instagramId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <PlayerReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        defaultCategory={
          activeCategory !== "all" ? (activeCategory as ReviewCategory) : "general"
        }
      />
    </section>
  );
}
