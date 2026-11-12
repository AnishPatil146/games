"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Shield,
  Flame,
  Clock,
  Sparkles,
  Radio,
  CheckCircle2,
  Users,
  Target,
  ArrowUpRight,
  RefreshCw,
  Award,
  BookOpen,
  Compass,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type {
  LeaderboardEntry,
  LeaderboardLiveFeedItem,
  LeaderboardSummary,
} from "@/lib/types";

export default function PublicLeaderboardPage() {
  const [modeFilter, setModeFilter] = useState<"all" | "junior_academy" | "senior_solo">("all");
  const [streamFilter, setStreamFilter] = useState<"ALL" | "SCIENCE" | "COMMERCE" | "ARTS">("ALL");
  const [summary, setSummary] = useState<LeaderboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [secondTick, setSecondTick] = useState(0);

  // Time elapsed in seconds for live display
  const lastFetchedTimeRef = useRef<number>(Date.now());

  const fetchLeaderboard = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (modeFilter !== "all") params.set("mode", modeFilter);
      if (streamFilter !== "ALL") params.set("stream", streamFilter);

      const res = await fetch(`/api/leaderboard?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { success: boolean; data: LeaderboardSummary };
      if (json.success && json.data) {
        setSummary(json.data);
        lastFetchedTimeRef.current = Date.now();
      }
    } catch {
      // Non-blocking in 1s live poll
    } finally {
      if (isInitial) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [modeFilter, streamFilter]);

  // Initial fetch on filter change
  useEffect(() => {
    void fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // LIVE 1-SECOND REFRESH ENGINE: Updates every single second (1,000ms)
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      setSecondTick((prev) => prev + 1);
      void fetchLeaderboard(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, fetchLeaderboard]);

  const entries = summary?.entries || [];
  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0B] text-[#FAF7F2] select-none">
      <Header tone="dark" />

      {/* 1. TOP LIVE TELEMETRY RADAR MASTHEAD */}
      <section className="sticky top-16 z-30 w-full bg-[#171310]/95 backdrop-blur-md border-b border-[#3D3227] px-4 py-2.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Live Pulsing Radar Status */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-mono font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE TELEMETRY ACTIVE</span>
            </span>
            <span className="hidden sm:inline-block text-[#8C7D6F] font-mono text-[11px]">·</span>
            <span className="hidden sm:inline-block font-mono text-[#DDD4C5] text-[11px]">
              Synchronizing Every Second (1s)
            </span>
          </div>

          {/* Real-time Ticker & Controls */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="bg-[#241D17] border border-[#524233] px-2.5 py-1 rounded text-amber-300 font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tick: #{secondTick}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAutoRefreshEnabled((prev) => !prev)}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                isAutoRefreshEnabled
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-600 hover:bg-emerald-900/80"
                  : "bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700"
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-300" : ""}`} />
              <span>{isAutoRefreshEnabled ? "Live (1s)" : "Paused"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. HERO HEADER & AGGREGATE PERFORMANCE METRICS */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Global Performance Board</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Hall of Deduction &amp; Mastery
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#DDD4C5] leading-relaxed">
            Real-time public rankings across The Junior Academy and The Senior Investigation. Evaluated second-by-second on accuracy, speed, and consecutive streaks.
          </p>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1A1511] border-2 border-[#524233] rounded-xl p-3.5 sm:p-4 text-center space-y-1 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Active Solvers</span>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-white">
              {summary?.activeSolversCount || 18}
            </p>
            <span className="text-[10px] text-emerald-300/80 font-mono block">Solving Right Now</span>
          </div>

          <div className="bg-[#1A1511] border-2 border-[#524233] rounded-xl p-3.5 sm:p-4 text-center space-y-1 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-mono font-bold uppercase">
              <Target className="w-3.5 h-3.5" />
              <span>Total Evaluated</span>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-white">
              {summary?.totalEvaluationsCount || 1280}
            </p>
            <span className="text-[10px] text-[#DDD4C5] font-mono block">Validated Monograph Runs</span>
          </div>

          <div className="bg-[#1A1511] border-2 border-[#524233] rounded-xl p-3.5 sm:p-4 text-center space-y-1 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-mono font-bold uppercase">
              <Flame className="w-3.5 h-3.5" />
              <span>Longest Streak</span>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-rose-300">
              {summary?.topStreak || 10}
            </p>
            <span className="text-[10px] text-rose-200/80 font-mono block">Zero-Error Consecutive</span>
          </div>

          <div className="bg-[#1A1511] border-2 border-[#524233] rounded-xl p-3.5 sm:p-4 text-center space-y-1 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-mono font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fastest Blitz</span>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-blue-300">
              {formatSeconds(summary?.fastestTimeSeconds || 48)}
            </p>
            <span className="text-[10px] text-blue-200/80 font-mono block">10-Question Perfect Run</span>
          </div>
        </div>

        {/* 3. ARENA & STREAM INTERACTIVE FILTERS */}
        <div className="bg-[#1C1712] border-2 border-[#5E4B3A] rounded-xl p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setModeFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  modeFilter === "all"
                    ? "bg-amber-400 text-black shadow-md border-2 border-white"
                    : "bg-[#292119] text-[#DDD4C5] border border-[#524233] hover:border-amber-400"
                }`}
              >
                All Arenas
              </button>
              <button
                type="button"
                onClick={() => setModeFilter("junior_academy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  modeFilter === "junior_academy"
                    ? "bg-amber-400 text-black shadow-md border-2 border-white"
                    : "bg-[#292119] text-[#DDD4C5] border border-[#524233] hover:border-amber-400"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Junior Academy (The Scholar)</span>
              </button>
              <button
                type="button"
                onClick={() => setModeFilter("senior_solo")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  modeFilter === "senior_solo"
                    ? "bg-amber-400 text-black shadow-md border-2 border-white"
                    : "bg-[#292119] text-[#DDD4C5] border border-[#524233] hover:border-amber-400"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Solo Investigation (Senior)</span>
              </button>
            </div>

            {/* Stream Selector (if viewing all or junior) */}
            {modeFilter !== "senior_solo" && (
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[#8C7D6F] text-[11px] uppercase mr-1 hidden sm:inline">Stream:</span>
                {(["ALL", "SCIENCE", "COMMERCE", "ARTS"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStreamFilter(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border ${
                      streamFilter === st
                        ? "bg-[#3D3023] text-amber-300 border-amber-400"
                        : "bg-[#1E1712] text-[#9E8B78] border-[#423425] hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. TOP 3 PODIUM SHOWCASE */}
        {top3.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.22em] text-[#C2B29F] font-mono font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Current Podium Champions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gold #1 */}
              {top3[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-[#2D2312] to-[#1F170D] border-2 border-amber-400/90 rounded-2xl p-5 space-y-4 shadow-[0_0_35px_rgba(251,191,36,0.35)] relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-400 text-black font-black text-[10px] uppercase font-mono px-2.5 py-0.5 rounded shadow">
                    Rank #1 · Gold Crown
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-serif text-2xl font-black shadow-lg">
                      🥇
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-white flex items-center gap-1.5">
                        <span>{top3[0].callsign}</span>
                        {top3[0].verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                        )}
                      </h3>
                      <p className="text-xs text-amber-200/90 font-mono">{top3[0].discipline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#140F08] p-3 rounded-xl border border-amber-500/40 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Score</span>
                      <strong className="text-amber-300 text-sm font-black">{top3[0].score}/10</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Accuracy</span>
                      <strong className="text-emerald-400 text-sm font-black">{top3[0].accuracyPct}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Pace</span>
                      <strong className="text-blue-300 text-sm font-black">{formatSeconds(top3[0].timeSeconds)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#DDD4C5]">
                    <span className="flex items-center gap-1 text-rose-300 font-bold">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{top3[0].streak} Streak</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                      {top3[0].tier}
                    </span>
                  </div>
                </div>
              )}

              {/* Silver #2 */}
              {top3[1] && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-[#222120] to-[#171615] border-2 border-slate-300/80 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-slate-300 text-black font-black text-[10px] uppercase font-mono px-2.5 py-0.5 rounded shadow">
                    Rank #2 · Silver
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-300 text-black flex items-center justify-center font-serif text-2xl font-black shadow-lg">
                      🥈
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-white flex items-center gap-1.5">
                        <span>{top3[1].callsign}</span>
                        {top3[1].verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                        )}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono">{top3[1].discipline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#121110] p-3 rounded-xl border border-slate-600/50 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Score</span>
                      <strong className="text-slate-200 text-sm font-black">{top3[1].score}/10</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Accuracy</span>
                      <strong className="text-emerald-400 text-sm font-black">{top3[1].accuracyPct}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Pace</span>
                      <strong className="text-blue-300 text-sm font-black">{formatSeconds(top3[1].timeSeconds)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#DDD4C5]">
                    <span className="flex items-center gap-1 text-rose-300 font-bold">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{top3[1].streak} Streak</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-400/40 text-[10px] font-bold uppercase">
                      {top3[1].tier}
                    </span>
                  </div>
                </div>
              )}

              {/* Bronze #3 */}
              {top3[2] && (
                <div className="order-3 md:order-3 bg-gradient-to-b from-[#2B1D16] to-[#1C130D] border-2 border-amber-700/80 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-700 text-amber-100 font-black text-[10px] uppercase font-mono px-2.5 py-0.5 rounded shadow">
                    Rank #3 · Bronze
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center font-serif text-2xl font-black shadow-lg">
                      🥉
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-white flex items-center gap-1.5">
                        <span>{top3[2].callsign}</span>
                        {top3[2].verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                        )}
                      </h3>
                      <p className="text-xs text-amber-200/90 font-mono">{top3[2].discipline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#140E0A] p-3 rounded-xl border border-amber-800/50 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Score</span>
                      <strong className="text-amber-200 text-sm font-black">{top3[2].score}/10</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Accuracy</span>
                      <strong className="text-emerald-400 text-sm font-black">{top3[2].accuracyPct}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A89887] block uppercase">Pace</span>
                      <strong className="text-blue-300 text-sm font-black">{formatSeconds(top3[2].timeSeconds)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#DDD4C5]">
                    <span className="flex items-center gap-1 text-rose-300 font-bold">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{top3[2].streak} Streak</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-700/20 text-amber-300 border border-amber-700/40 text-[10px] font-bold uppercase">
                      {top3[2].tier}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. FULL RANKED LEADERBOARD DATA TABLE */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.22em] text-[#C2B29F] font-mono font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Full Public Rankings ({entries.length} Competitors)</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-refreshing 1s</span>
            </span>
          </div>

          <div className="bg-[#1A1511] border-2 border-[#544333] rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#241D17] border-b-2 border-[#544333] text-[#DDD4C5] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 text-center w-16">Rank</th>
                    <th scope="col" className="px-4 py-3.5">Competitor</th>
                    <th scope="col" className="px-4 py-3.5">Arena &amp; Subject</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Score</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Accuracy</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Speed</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Streak</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#382D23]">
                  {entries.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors hover:bg-[#261E17] ${
                          isTop1
                            ? "bg-amber-500/10"
                            : isTop2
                            ? "bg-slate-300/5"
                            : isTop3
                            ? "bg-amber-700/5"
                            : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3.5 text-center font-mono font-black">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-400 text-black text-xs font-black shadow">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-300 text-black text-xs font-black shadow">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-700 text-amber-100 text-xs font-black shadow">
                              3
                            </span>
                          ) : (
                            <span className="text-[#9E8B78] text-sm">#{entry.rank}</span>
                          )}
                        </td>

                        {/* Competitor / Callsign */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm flex items-center gap-1.5">
                              {entry.callsign}
                              {entry.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </span>
                            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D231A] text-[#DDD4C5] border border-[#524233]">
                              {entry.tier}
                            </span>
                          </div>
                        </td>

                        {/* Discipline */}
                        <td className="px-4 py-3.5">
                          <div className="min-w-0">
                            <span className="text-white font-medium block truncate max-w-[220px]">
                              {entry.discipline}
                            </span>
                            {entry.stream && (
                              <span className="text-[10px] font-mono text-amber-300/80 uppercase">
                                {entry.stream}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-300 text-sm">
                          {entry.score}/10
                        </td>

                        {/* Accuracy */}
                        <td className="px-4 py-3.5 text-center font-mono">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-emerald-400">{entry.accuracyPct}%</span>
                            <div className="w-12 h-1.5 rounded-full bg-[#2E251E] overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-400 rounded-full"
                                style={{ width: `${entry.accuracyPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Speed */}
                        <td className="px-4 py-3.5 text-center font-mono text-blue-300">
                          {formatSeconds(entry.timeSeconds)}
                        </td>

                        {/* Streak */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-rose-300">
                          <span className="flex items-center justify-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-rose-400" />
                            <span>{entry.streak}</span>
                          </span>
                        </td>

                        {/* Live Status */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          {entry.isLiveNow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>Q{entry.liveCurrentQuestion || 8} Live</span>
                            </span>
                          ) : (
                            <span className="text-[#8C7D6F] text-[10px]">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. LIVE SECOND-BY-SECOND ACTIVITY DISPATCHES */}
        <section className="bg-[#171310] border-2 border-[#4E3F30] rounded-xl p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Real-Time Dispatch Feed</span>
            </span>
            <span className="text-emerald-400 text-[11px] font-bold">
              Updated 0s ago · Active Ticker
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {summary?.liveFeed.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-[#201A14] border border-[#524233] p-3 rounded-lg flex items-start gap-2.5 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-ping" />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <strong className="text-white truncate font-bold">{item.callsign}</strong>
                    <span className="text-[10px] font-mono text-[#A89887] shrink-0">
                      {item.secondsAgo}s ago
                    </span>
                  </div>
                  <p className="text-amber-200/90 text-[11px] font-mono truncate">{item.action}</p>
                  <span className="text-[10px] text-[#8C7D6F] truncate block">
                    {item.discipline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action: Enter The Arena */}
        <div className="bg-gradient-to-r from-[#241A10] via-[#2F2115] to-[#241A10] border-2 border-[#8C735B] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
            Ready to Take Your Position on the Board?
          </h2>
          <p className="text-sm text-[#DDD4C5] max-w-xl mx-auto leading-relaxed">
            Choose your arena — practice 10-question cycles in The Junior Academy, or step into the Senior Solo Mind Experiment. Every completed attempt automatically updates your rank.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/junior">
              <button
                type="button"
                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg border-2 border-white shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Enter Junior Academy</span>
              </button>
            </Link>
            <Link href="/solo">
              <button
                type="button"
                className="bg-[#3D3024] hover:bg-[#4E3E2F] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg border-2 border-[#8C735B] hover:border-white shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Solo Investigation</span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

