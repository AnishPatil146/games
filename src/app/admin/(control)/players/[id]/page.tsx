"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import {
  GameSession,
  GameplayEvent,
  GameplayReport,
  Player,
  PlayerPreference,
} from "@/lib/types";
import { formatDateTime } from "@/components/admin/formatters";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PlayerDetailPayload {
  player: Player | null;
  sessions: GameSession[];
  session: GameSession;
  events: GameplayEvent[];
  preferences: PlayerPreference[];
  report: GameplayReport;
}

async function requestPlayerDetail(
  lookupId: string
): Promise<PlayerDetailPayload> {
  const res = await fetch(`/api/admin/players/${lookupId}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as Partial<PlayerDetailPayload> & {
    error?: string;
  };
  if (!res.ok || !json.session || !json.report) {
    throw new Error(json.error || "Player dossier not found.");
  }
  return {
    player: json.player || null,
    sessions: json.sessions || [json.session],
    session: json.session,
    events: json.events || [],
    preferences: json.preferences || [],
    report: json.report,
  };
}

export default function AdminPlayerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [data, setData] = useState<PlayerDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDetail = useCallback(async (lookupId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const payload = await requestPlayerDetail(lookupId);
      setData(payload);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load detail.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestPlayerDetail(resolvedParams.id)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load detail."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.24em] text-[#8A8178]">
        Loading player dossier...
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/players"
          className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-[#57524C] hover:text-[#1C1917]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Players
        </Link>
        <div className="p-6 bg-[#F5EBEA] border border-[#9E6B68]/40 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg || "Record not found."}
        </div>
      </div>
    );
  }

  const { player, sessions, session, events, report } = data;
  const clueEvents = events.filter((e) => e.event_type === "clue_inspected");
  const puzzleEvents = events.filter(
    (e) => e.event_type === "puzzle_attempted"
  );
  const choiceEvents = events.filter((e) => e.event_type === "choice_selected");

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/players"
          className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-[#57524C] hover:text-[#1C1917]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Player Directory
        </Link>

        <Link
          href={`/admin/sessions/${session.id}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#545E4E] hover:text-[#1C1917] font-medium"
        >
          Open Raw Event Timeline <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Profile Header Card */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DDD4C5] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#8A8178] font-mono">
              {player ? `Player ID · ${player.id}` : `Anonymous Session · ${session.id}`}
            </p>
            <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
              {player?.display_name || "Anonymous Traveler"}
            </h1>
            {player?.instagram_username && (
              <p className="text-sm font-mono text-[#545E4E] mt-1">
                @{player.instagram_username}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm">
              Silhouette: {session.character_presentation}
            </span>
            <span
              className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] rounded-sm ${
                session.status === "completed"
                  ? "bg-[#E9ECE6] text-[#545E4E]"
                  : "bg-[#EFE4CE] text-[#7E6747]"
              }`}
            >
              {session.status === "completed"
                ? "Completed"
                : `In Progress · Ch. 0${session.current_chapter}`}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Consent Verified
            </dt>
            <dd className="text-[#1C1917] font-medium mt-1">
              {player?.profile_consent ? "Yes (Explicit)" : "Anonymous Mode"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Profile Created
            </dt>
            <dd className="text-[#1C1917] mt-1">
              {formatDateTime(player?.created_at || session.started_at)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Campaign Source
            </dt>
            <dd className="text-[#1C1917] font-mono mt-1">
              {session.campaign_source || session.utm_source || "direct"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Total Linked Sessions
            </dt>
            <dd className="text-[#1C1917] font-mono mt-1">{sessions.length}</dd>
          </div>
        </dl>

        {/* Session History Switcher */}
        {sessions.length > 1 && (
          <div className="pt-4 border-t border-[#DDD4C5] space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
              Session History (Click to inspect)
            </span>
            <div className="flex flex-wrap gap-2">
              {sessions.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => void loadDetail(s.id)}
                  className={`px-3 py-1.5 text-xs font-mono border rounded-sm cursor-pointer ${
                    s.id === session.id
                      ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                      : "bg-[#F6F3EC] text-[#1C1917] border-[#DDD4C5]"
                  }`}
                >
                  Run #{sessions.length - idx} · {s.status} (
                  {formatDateTime(s.started_at)})
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Chapter-by-Chapter Progression */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1917]">
          Chapter Progression
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((ch) => {
            const started = events.some(
              (e) => e.chapter === ch && e.event_type === "chapter_started"
            );
            const completed =
              session.status === "completed" ||
              session.current_chapter > ch ||
              events.some(
                (e) => e.chapter === ch && e.event_type === "chapter_completed"
              );
            return (
              <div
                key={ch}
                className={`p-3 border rounded-sm text-xs ${
                  completed
                    ? "bg-[#E9ECE6]/75 border-[#545E4E]/45 text-[#1C1917]"
                    : started || session.current_chapter === ch
                    ? "bg-[#EFE4CE]/75 border-[#C9B795] text-[#1C1917]"
                    : "bg-[#F6F3EC] border-[#DDD4C5] text-[#8A8178]"
                }`}
              >
                <span className="block font-mono text-[10px] uppercase">
                  Chapter 0{ch}
                </span>
                <span className="block font-medium mt-1">
                  {completed ? "Completed" : started ? "In Progress" : "Unvisited"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decisions, Clues & Puzzle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Recorded Choices ({choiceEvents.length})
          </h2>
          {choiceEvents.length === 0 ? (
            <p className="text-xs text-[#8A8178]">No choices recorded yet.</p>
          ) : (
            <ul className="space-y-3 text-xs divide-y divide-[#EDE6DA]">
              {choiceEvents.map((ev, i) => (
                <li key={i} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#8A8178]">
                    <span>Chapter 0{ev.chapter}</span>
                    <span>
                      {ev.event_data?.durationMs
                        ? `${Math.round(Number(ev.event_data.durationMs) / 100) / 10}s`
                        : ""}
                    </span>
                  </div>
                  <p className="font-mono text-[#1C1917]">
                    {String(
                      ev.event_data?.choiceId ||
                        ev.event_data?.environment ||
                        "choice"
                    )}
                  </p>
                  {Boolean(ev.event_data?.replyPreview) && (
                    <p className="italic text-[#57524C]">
                      Reply: &ldquo;{String(ev.event_data.replyPreview)}&rdquo;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Clues ({clueEvents.length}) &amp; Puzzles ({puzzleEvents.length})
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block mb-1">
                Inspected Clues
              </span>
              {clueEvents.length === 0 ? (
                <p className="text-[#8A8178]">None inspected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {clueEvents.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm font-mono text-[11px]"
                    >
                      Ch.0{c.chapter}: {String(c.event_data?.clueId || "clue")}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EDE6DA]">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block mb-2">
                Puzzle Attempts
              </span>
              {puzzleEvents.length === 0 ? (
                <p className="text-[#8A8178]">No puzzle attempts recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {puzzleEvents.map((p, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-medium text-[#1C1917]">
                          Ch.0{p.chapter} ·{" "}
                          {String(p.event_data?.puzzle || "Puzzle")}
                        </span>
                        <span className="block font-mono text-[11px] text-[#57524C]">
                          Input:{" "}
                          {String(
                            p.event_data?.codeEntered ??
                              p.event_data?.selectedAnswer ??
                              "—"
                          )}{" "}
                          · Time:{" "}
                          {p.event_data?.timeToSolveMs
                            ? `${Math.round(Number(p.event_data.timeToSolveMs) / 100) / 10}s`
                            : "—"}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase rounded-sm ${
                          p.event_data?.isCorrect
                            ? "bg-[#E9ECE6] text-[#545E4E]"
                            : "bg-[#F5EBEA] text-[#9E6B68]"
                        }`}
                      >
                        {p.event_data?.isCorrect ? "Solved" : "Incorrect"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Explicit Preferences & Generated Archetype Synthesis */}
      <section className="bg-[#141210] text-[#FAF7F2] rounded-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FAF7F2]/12 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#8FA184] font-mono">
              Generated Archetype Report · Confidence: {report.confidence}
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl mt-1">
              {report.archetype}
            </h2>
          </div>
          <Link
            href={`/result/${session.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#D6CEC0] hover:text-[#FAF7F2]"
          >
            View Public Report <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-sm text-[#D6CEC0] leading-relaxed">
          {report.interpretation}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 bg-[#1C1916] border border-[#2B2723] rounded-sm">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
              Ch.04 Studio Composition
            </span>
            <span className="text-[#FAF7F2] block mt-1">
              {report.explicitPreferences.canvasPalette || "—"} (
              {report.explicitPreferences.canvasArrangement || "—"})
            </span>
            <span className="text-[#A89F93] block mt-0.5">
              {report.explicitPreferences.canvasObjects.join(", ") || "—"}
            </span>
          </div>

          <div className="p-3.5 bg-[#1C1916] border border-[#2B2723] rounded-sm">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
              Ch.06 Horizon &amp; Relic
            </span>
            <span className="text-[#FAF7F2] block mt-1">
              {report.explicitPreferences.worldEnvironment || "—"}
            </span>
            <span className="text-[#A89F93] block mt-0.5">
              {report.explicitPreferences.worldObject || "—"}
            </span>
          </div>

          <div className="p-3.5 bg-[#1C1916] border border-[#2B2723] rounded-sm">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block">
              Ch.06 First Hour Activity
            </span>
            <span className="text-[#FAF7F2] block mt-1">
              {report.explicitPreferences.worldActivity || "—"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
