"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MessageSquare,
  Sparkles,
  Send,
  Flag,
  Archive,
  Pin,
  RefreshCw,
} from "lucide-react";
import type { PlayerReview, ReviewCategory, ReviewStatus } from "@/lib/types";
import { formatDateTime } from "@/components/admin/formatters";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<PlayerReview[]>([]);
  const [stats, setStats] = useState<{
    totalAll: number;
    averageRating: number;
    approvedCount: number;
    pendingCount: number;
    flaggedCount: number;
    featuredCount: number;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Editing admin response
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>("");
  const [isSavingResponse, setIsSavingResponse] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        rating: String(ratingFilter),
        page: String(page),
        limit: "25",
      });
      if (search.trim()) qs.set("search", search.trim());

      const res = await fetch(`/api/admin/reviews?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) setReviews(data.reviews);
        if (data.stats) setStats(data.stats);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, [search, statusFilter, categoryFilter, ratingFilter, page]);

  const handleToggleFeatured = async (rev: PlayerReview) => {
    try {
      const res = await fetch(`/api/admin/reviews/${rev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !rev.featured }),
      });
      if (res.ok) {
        const json = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? json.review : r))
        );
        if (stats) {
          setStats({
            ...stats,
            featuredCount: rev.featured
              ? stats.featuredCount - 1
              : stats.featuredCount + 1,
          });
        }
      }
    } catch {
      // error
    }
  };

  const handleUpdateStatus = async (rev: PlayerReview, newStatus: ReviewStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${rev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? json.review : r))
        );
      }
    } catch {
      // error
    }
  };

  const handleSaveResponse = async (id: string) => {
    setIsSavingResponse(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminResponse: draftResponse.trim() || null }),
      });
      if (res.ok) {
        const json = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === id ? json.review : r)));
        setEditingResponseId(null);
        setDraftResponse("");
      }
    } finally {
      setIsSavingResponse(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this player review?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // error
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <header className="border-b border-[#DDD4C5] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            THE UNWRITTEN / COMMUNITY &amp; SENTIMENT
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Player Reviews &amp; Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-[#57524C] mt-1 max-w-2xl">
            Live player feedback, star ratings, and community reviews. Pin featured reviews to the homepage or reply as the Creator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchReviews()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-xs font-mono uppercase tracking-[0.16em] text-[#1C1917] hover:bg-[#F3EDE2] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </header>

      {/* 2. Top Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
              Total Reviews
            </span>
            <span className="block font-serif text-2xl sm:text-3xl font-black text-[#1C1917]">
              {stats.totalAll}
            </span>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
              Mean Rating
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-black text-amber-700">
                {stats.averageRating.toFixed(1)}
              </span>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
              Approved
            </span>
            <span className="block font-serif text-2xl sm:text-3xl font-black text-emerald-800">
              {stats.approvedCount}
            </span>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
              Featured on Hub
            </span>
            <span className="block font-serif text-2xl sm:text-3xl font-black text-amber-600">
              {stats.featuredCount}
            </span>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
              Pending / Flagged
            </span>
            <span className="block font-serif text-2xl sm:text-3xl font-black text-rose-800">
              {stats.pendingCount + stats.flaggedCount}
            </span>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] p-4 rounded-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8A8178] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by player, @instagram, headline, or text..."
              className="w-full pl-9 pr-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none"
            >
              <option value="all">All Focus Areas</option>
              <option value="solo">Solo Campaign</option>
              <option value="junior">Junior Academy</option>
              <option value="story">Story &amp; Lore</option>
              <option value="puzzles">Puzzles &amp; Logic</option>
              <option value="design">Art &amp; Design</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none"
            >
              <option value={0}>All Stars</option>
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★☆</option>
              <option value={3}>3 Stars ★★★☆☆</option>
              <option value={2}>2 Stars ★★☆☆☆</option>
              <option value={1}>1 Star ★☆☆☆☆</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="featured">Featured Only</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono uppercase tracking-widest text-[#8A8178]">
            Loading Player Reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-[#8A8178]" />
            <p className="font-serif text-lg text-[#1C1917]">No reviews match your filters.</p>
            <p className="text-xs text-[#57524C]">Adjust your search query or reset status filters.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 sm:p-6 bg-[#FAF7F2] border rounded-sm transition-all space-y-4 ${
                rev.featured
                  ? "border-amber-400 bg-amber-50/20 shadow-sm"
                  : "border-[#DDD4C5] hover:border-[#8A8178]"
              }`}
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E0D3] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Star Rating */}
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating ? "fill-amber-400" : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-mono text-xs font-bold text-[#1C1917]">
                    {rev.rating} / 5
                  </span>

                  <span className="text-[#8A8178]">•</span>

                  <span className="font-bold text-xs text-[#1C1917]">
                    {rev.playerName}
                  </span>

                  {rev.instagramId && (
                    <span className="font-mono text-xs text-[#545E4E]">
                      @{rev.instagramId}
                    </span>
                  )}

                  <span className="text-[#8A8178]">•</span>

                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#F3EDE2] text-[#57524C] border border-[#DDD4C5]">
                    {rev.category}
                  </span>

                  {rev.featured && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Featured
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm border font-bold ${
                      rev.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : rev.status === "pending"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : rev.status === "flagged"
                        ? "bg-rose-50 text-rose-800 border-rose-300"
                        : "bg-zinc-100 text-zinc-600 border-zinc-300"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#8A8178]">
                  {formatDateTime(rev.createdAt)}
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                <h3 className="font-serif font-black text-base text-[#1C1917]">
                  {rev.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#403B35] leading-relaxed font-sans">
                  &ldquo;{rev.feedback}&rdquo;
                </p>
              </div>

              {/* Admin / Creator Response */}
              {rev.adminResponse && editingResponseId !== rev.id && (
                <div className="p-3.5 bg-[#F3EDE2] border-l-2 border-[#545E4E] rounded-sm space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#545E4E] font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Response from The Creator (Anish Patil)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResponseId(rev.id);
                        setDraftResponse(rev.adminResponse || "");
                      }}
                      className="text-[10px] text-[#545E4E] hover:underline cursor-pointer"
                    >
                      Edit Response
                    </button>
                  </div>
                  <p className="text-[#1C1917] italic">{rev.adminResponse}</p>
                </div>
              )}

              {/* Editing Response Box */}
              {editingResponseId === rev.id && (
                <div className="p-3.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#545E4E] font-bold">
                    Compose Creator Response
                  </span>
                  <textarea
                    rows={3}
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    placeholder="Write an official creator reply that appears directly beneath this review on the homepage..."
                    className="w-full p-2.5 bg-white border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResponseId(null);
                        setDraftResponse("");
                      }}
                      className="px-3 py-1.5 border border-[#DDD4C5] text-xs font-mono rounded-sm hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingResponse}
                      onClick={() => void handleSaveResponse(rev.id)}
                      className="px-3 py-1.5 bg-[#1C1917] text-white text-xs font-mono rounded-sm hover:bg-[#342F2A] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSavingResponse ? "Saving..." : "Save Creator Reply"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-[#E7E0D3] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Feature Button */}
                  <button
                    type="button"
                    onClick={() => void handleToggleFeatured(rev)}
                    className={`px-3 py-1.5 rounded-sm font-mono text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      rev.featured
                        ? "bg-amber-500 text-black border-amber-600 shadow-sm"
                        : "bg-white text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{rev.featured ? "Unpin from Hub" : "Pin as Featured"}</span>
                  </button>

                  {/* Status Toggle Buttons */}
                  {rev.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(rev, "approved")}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-[#DDD4C5] hover:border-emerald-400 rounded-sm font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rev.status !== "flagged" && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(rev, "flagged")}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-[#DDD4C5] hover:border-rose-400 rounded-sm font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Flag className="w-3 h-3 text-rose-600" />
                      <span>Flag</span>
                    </button>
                  )}

                  {rev.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(rev, "archived")}
                      className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-[#DDD4C5] rounded-sm font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3" />
                      <span>Archive</span>
                    </button>
                  )}

                  {!rev.adminResponse && editingResponseId !== rev.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResponseId(rev.id);
                        setDraftResponse("");
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-[#F3EDE2] text-[#545E4E] border border-[#DDD4C5] rounded-sm font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Add Creator Reply</span>
                    </button>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => void handleDeleteReview(rev.id)}
                  className="px-2.5 py-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  title="Permanently Delete Review"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#DDD4C5] pt-4 text-xs font-mono">
          <span className="text-[#8A8178]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
