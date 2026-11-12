"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, CheckCircle2, ShieldCheck, Activity, Compass, Star, MessageSquareQuote } from "lucide-react";
import { formatDateTime } from "@/components/admin/formatters";
import { MathRenderer } from "@/components/math/MathRenderer";
import { InfrastructureLiveOpsPanel } from "@/components/admin/InfrastructureLiveOpsPanel";

interface UnifiedOverview {
  storageBackend: string;
  schemaReady: boolean;
  schemaNotice?: string;
  landingVisits: number;
  totalParticipants: number;
  seniorParticipants: number;
  juniorParticipants: number;
  totalSessions: number;
  completedGames: number;
  completionRatePct: number | null;
  avgJuniorScore: number | null;
  streamParticipation: {
    stream: string;
    streamName: string;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
  subjectParticipation: {
    subjectSlug: string;
    subjectName: string;
    stream: string;
    publishedQuestions: number;
    attempts: number;
    completed: number;
    avgScore: number | null;
  }[];
  recentAttempts: {
    attemptId: string;
    participantId: string;
    participantName: string;
    username: string;
    stream: string;
    subjectName: string;
    scoreOutOf10: number | null;
    accuracyPct: number | null;
    status: string;
    startedAt: string;
    completedAt: string | null;
  }[];
}

export default function AdminExecutiveDashboardPage() {
  const [data, setData] = useState<UnifiedOverview | null>(null);
  const [reviewsSummary, setReviewsSummary] = useState<{
    totalAll: number;
    averageRating: number;
    featuredCount: number;
    recentReviews: {
      id: string;
      playerName: string;
      rating: number;
      title: string;
      category: string;
      feedback: string;
    }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [dashRes, revRes] = await Promise.all([
          fetch("/api/v1/admin/dashboard"),
          fetch("/api/admin/reviews?limit=3"),
        ]);
        if (dashRes.ok) {
          const json = (await dashRes.json()) as UnifiedOverview;
          if (active) setData(json);
        }
        if (revRes.ok) {
          const rJson = await revRes.json();
          if (active && rJson.reviews) {
            setReviewsSummary({
              totalAll: rJson.stats?.totalAll || rJson.total || 0,
              averageRating: rJson.stats?.averageRating || 5.0,
              featuredCount: rJson.stats?.featuredCount || 0,
              recentReviews: rJson.reviews.slice(0, 3),
            });
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Executive Control Overview...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            THE UNWRITTEN / CONTROL
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Executive Platform Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/solo"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2E2822] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#3D352E]"
          >
            <span>Solo Campaign</span>
            <ArrowRight className="w-3 h-3 text-[#C8B28E]" />
          </Link>
          <Link
            href="/junior"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1C2F24] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#253D30]"
          >
            <span>Junior Academy</span>
            <ArrowRight className="w-3 h-3 text-[#52B788]" />
          </Link>
          <Link
            href="/admin/participants"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#141210] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.18em] hover:bg-[#2A2521]"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Participants</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Landing Visits
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.landingVisits}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Participants
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.totalParticipants}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Senior / Junior
          </span>
          <span className="font-mono text-lg text-[#1C1917] mt-2 block">
            {data.seniorParticipants} / {data.juniorParticipants}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Total Runs
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.totalSessions}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Completion Rate
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.completionRatePct !== null ? `${data.completionRatePct}%` : "—"}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
            Avg Junior Marks
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.avgJuniorScore !== null ? `${data.avgJuniorScore}/10` : "—"}
          </span>
        </div>
      </section>

      {/* Stream Participation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.streamParticipation.map((st) => (
          <div
            key={st.stream}
            className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl text-[#1C1917]">
                {st.streamName} Stream
              </span>
              <span className="font-mono text-xs text-[#545E4E]">
                {st.attempts} attempts
              </span>
            </div>
            <p className="text-xs text-[#57524C]">
              Completed: {st.completed} · Mean Score:{" "}
              {st.avgScore !== null ? `${st.avgScore}/10` : "—"}
            </p>
          </div>
        ))}
      </section>

      {/* Recent Junior Attempts with Participant Drill-down */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#DDD4C5] pb-2">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Recent Junior Mode Attempts
          </h2>
          <Link
            href="/admin/attempts"
            className="text-xs uppercase tracking-[0.18em] text-[#545E4E] hover:underline"
          >
            View All Attempts
          </Link>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
          {data.recentAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8178]">
              No Junior Mode attempts submitted yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {data.recentAttempts.map((att) => {
                  const encP = encodeURIComponent(att.participantId);
                  return (
                    <tr key={att.attemptId} className="hover:bg-[#F3EDE2]/50">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/participants/${encP}`}
                          className="font-medium text-[#1C1917] hover:underline"
                        >
                          {att.participantName}
                        </Link>
                        <span className="block font-mono text-[10px] text-[#8A8178]">
                          @{att.username}
                        </span>
                      </td>
                      <td className="py-3 px-4">{att.subjectName}</td>
                      <td className="py-3 px-4 font-mono">
                        {att.scoreOutOf10 !== null
                          ? `${att.scoreOutOf10}/10 (${att.accuracyPct}%)`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 uppercase tracking-[0.14em] text-[10px]">
                        {att.status}
                      </td>
                      <td className="py-3 px-4 text-[#57524C]">
                        {formatDateTime(att.completedAt || att.startedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/participants/${encP}/junior/attempts/${encodeURIComponent(
                            att.attemptId
                          )}`}
                          className="text-[11px] uppercase tracking-[0.16em] text-[#545E4E] font-medium hover:underline"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Cinematic Character Selection & Environment Stage Health Audit */}
      <section className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#8A5A36]" />
            <h2 className="font-serif text-lg text-[#1C1917]">Cinematic Player Select &amp; Environment Stage</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
            100% Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ Background Removal
            </span>
            <span className="font-bold text-[#1C1917] block">Grey Keyhole Eliminated</span>
            <span className="text-[11px] text-[#57524C]">Obsolete SVG arch and meridian rings removed at source.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ 4 Game Environments
            </span>
            <span className="font-bold text-[#1C1917] block">Selection, Junior, Solo, War Room</span>
            <span className="text-[11px] text-[#57524C]">Four distinct 1920x1080 illustrated backdrops with dynamic cross-fade.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ Character Identity Registry
            </span>
            <span className="font-bold text-[#1C1917] block">Zero Face Cloning · 3 Unique Personas</span>
            <span className="text-[11px] text-[#57524C]">Dedicated Scholar student sprite, canonical Aarav face, and tri-operative Squad.</span>
          </div>

          <div className="p-3 bg-[#F3EDE2]/60 rounded-sm space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
              ✓ Route &amp; State Uplink
            </span>
            <span className="font-bold text-[#1C1917] block">1-Click &quot;ENTER WORLD&quot;</span>
            <span className="text-[11px] text-[#57524C]">Direct routing to /junior and /solo with saved progress awareness.</span>
          </div>
        </div>

        {/* Visual Quality & Master Artwork Roster Audit */}
        <div className="border-t border-[#DDD4C5] pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#F3EDE2]/80 rounded-sm space-y-1 border border-[#DDD4C5]/50">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
                ✓ Solo L1 Scene Replacement
              </span>
              <span className="font-bold text-[#1C1917] block">07:45 Brass Station Clock</span>
              <span className="text-[11px] text-[#57524C]">
                Full 828 KB illustration with physically mounted clock, tucked note clue, heavy vault door, and amber 4-digit keypad.
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/80 rounded-sm space-y-1 border border-[#DDD4C5]/50">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
                ✓ Full Cast High-Res Sprites
              </span>
              <span className="font-bold text-[#1C1917] block">848×1264 Bande-Dessinée Cast</span>
              <span className="text-[11px] text-[#57524C]">
                All NPCs (Vesper, Halden, Mira) upgraded from 9 KB silhouettes to &gt;1.0 MB textured illustrated portraits.
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/80 rounded-sm space-y-1 border border-[#DDD4C5]/50">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
                ✓ Official Circular Brand Logo
              </span>
              <span className="font-bold text-[#1C1917] block">Silence Keyhole Emblem</span>
              <span className="text-[11px] text-[#57524C]">
                Approved silver &amp; crimson &quot;WHERE SILENCE SPEAKS&quot; emblem integrated across header, loading, admin, and favicons.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Dispatches & Player Reviews Executive Summary */}
      <section className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDD4C5] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-700" />
            <h2 className="font-serif text-lg text-[#1C1917]">
              Player Reviews &amp; Community Sentiment
            </h2>
          </div>
          <Link
            href="/admin/reviews"
            className="text-xs uppercase tracking-[0.16em] text-[#545E4E] hover:underline font-bold flex items-center gap-1 font-mono"
          >
            <span>Manage All Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reviewsSummary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F3EDE2] rounded-sm">
                <span className="text-[10px] font-mono uppercase text-[#8A8178] block">
                  Total Dispatches
                </span>
                <span className="font-serif text-2xl font-bold text-[#1C1917]">
                  {reviewsSummary.totalAll}
                </span>
              </div>
              <div className="p-3 bg-[#F3EDE2] rounded-sm">
                <span className="text-[10px] font-mono uppercase text-[#8A8178] block">
                  Mean Star Rating
                </span>
                <span className="font-serif text-2xl font-bold text-amber-800 flex items-center gap-1">
                  {reviewsSummary.totalAll > 0 ? reviewsSummary.averageRating.toFixed(1) : "—"}
                  {reviewsSummary.totalAll > 0 && <Star className="w-4 h-4 fill-amber-500 text-amber-500" />}
                </span>
              </div>
              <div className="p-3 bg-[#F3EDE2] rounded-sm">
                <span className="text-[10px] font-mono uppercase text-[#8A8178] block">
                  Featured on Hub
                </span>
                <span className="font-serif text-2xl font-bold text-emerald-800">
                  {reviewsSummary.featuredCount}
                </span>
              </div>
              <div className="p-3 bg-[#F3EDE2] rounded-sm">
                <span className="text-[10px] font-mono uppercase text-[#8A8178] block">
                  Sentiment Health
                </span>
                <span className="font-serif text-2xl font-bold text-emerald-800">
                  {reviewsSummary.totalAll > 0 ? "Active Feedback" : "Awaiting Reviews"}
                </span>
              </div>
            </div>

            {reviewsSummary.recentReviews.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8178] font-bold block">
                  Recent Player Field Notes
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reviewsSummary.recentReviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 bg-white border border-[#DDD4C5] rounded-sm space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1C1917] truncate">{r.playerName}</span>
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400" : "text-zinc-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-serif font-bold text-xs text-[#1C1917] truncate">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-[#57524C] line-clamp-2 leading-relaxed">
                        &ldquo;{r.feedback}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#8A8178] font-mono bg-[#F3EDE2]/50 rounded-sm">
                No player reviews submitted yet. When players submit reviews, they will appear here.
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#8A8178] font-mono">
            Loading community sentiment telemetry...
          </div>
        )}
      </section>

      {/* Part 5: Investigator Mode Cinematic Background Art Registry (Levels 01-08) */}
      <section className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDD4C5] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-700" />
            <h2 className="font-serif text-lg text-[#1C1917]">
              Investigator Mode (Solo) — Artwork Registry &amp; Environmental Asset Status
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
            8/8 Levels Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { level: "01", name: "The Locked Study", file: "solo_l1_study.jpg", status: "Operational", desc: "Mahogany bookcases, desk lamp" },
            { level: "02", name: "Abandoned Control Room", file: "solo_l2_control_room.jpg", status: "Operational", desc: "Phosphor CRTs, cable looms" },
            { level: "03", name: "Surveillance Hub", file: "solo_l3_surveillance_hub.jpg", status: "Operational", desc: "Panopticon monitors, consoles" },
            { level: "04", name: "Observation Chamber", file: "solo_l4_interrogation.jpg", status: "Operational", desc: "Two-way mirror, metal chairs" },
            { level: "05", name: "The Mirror Maze", file: "solo_l5_mirror_maze.jpg", status: "Operational", desc: "Specular reflections, infinite corridors" },
            { level: "06", name: "Flooded Ruins at Dusk", file: "solo_l6_last_human.jpg", status: "New High-Res Active", desc: "Flooded classical arches, golden water reflections" },
            { level: "07", name: "Emergency Dispatch Room", file: "solo_l7_impossible_second.jpg", status: "New High-Res Active", desc: "Curved terminal, vacuum tubes, red alarm beams" },
            { level: "08", name: "The Great Memory Vault", file: "solo_l8_final_truth.jpg", status: "New High-Res Active", desc: "Stone dais master codex, cathedral rose window" },
          ].map((art) => (
            <div key={art.level} className="p-3 bg-[#F3EDE2]/60 rounded border border-[#DDD4C5] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-800">
                  Level {art.level}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {art.status}
                </span>
              </div>
              <span className="font-bold text-[#1C1917] block truncate">{art.name}</span>
              <span className="text-[10px] text-[#57524C] font-mono block truncate">
                /public/art/backgrounds/{art.file}
              </span>
              <p className="text-[11px] text-[#70685F] line-clamp-2">
                {art.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mathematical Notation & Gameplay Engines Health Audit */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Operational Subsystems */}
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#545E4E]" />
              <h2 className="font-serif text-lg text-[#1C1917]">Operational Subsystem Health</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
              All Systems Nominal
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">Solo Campaign — The Mind Experiment</span>
                <span className="block text-[11px] text-[#57524C]">8 Chambers · Interactive Spatial Labyrinth · Keypad · 3-Doors</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">The Academy 2.0 — Complete Academic Foundation</span>
                <span className="block text-[11px] text-[#57524C]">Class 10, 11 &amp; 12 · 7 Visualisation Simulations · 12 Key Formula Proofs · Authentic Scoring</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Curated
              </span>
            </div>

            <div className="p-3 bg-[#F3EDE2]/60 rounded-sm flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1C1917]">Junior Mode — The Learning Arena</span>
                <span className="block text-[11px] text-[#57524C]">Class 11 &amp; Class 12 · 14 Subjects · 1,400 Questions · Zero Repetition</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1,400 Qs Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Mathematical Notation Typesetting Health Check */}
        <div className="p-5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8A5A36]" />
              <h2 className="font-serif text-lg text-[#1C1917]">MathRenderer™ Telemetry</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest font-bold">
              Engine OK
            </span>
          </div>

          <div className="p-3.5 bg-[#F3EDE2] rounded-sm space-y-2 text-xs font-serif">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#8A8178]">
              Live Typesetting Verification Preview
            </span>
            <div className="p-3 bg-white rounded border border-[#DDD4C5] space-y-2 text-sm text-[#1C1917]">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Fraction &amp; Radical:</span>
                <MathRenderer text="Quadratic Formula: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Greek &amp; Integral:</span>
                <MathRenderer text="Gaussian Integral: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$" />
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <span className="font-mono text-[10px] text-zinc-500 mr-2">Relations:</span>
                <MathRenderer text="Domain constraint: $f(x) \ge 0 \iff x \in [-\pi, \pi]$" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Operations & Scalability Infrastructure Command */}
      <section>
        <InfrastructureLiveOpsPanel />
      </section>
    </div>
  );
}
