"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import {
  GameSession,
  GameplayEvent,
  GameplayReport,
  Player,
  PlayerPreference,
} from "@/lib/types";
import {
  formatDateTime,
  formatDurationSeconds,
} from "@/components/admin/formatters";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SessionDetailResponse {
  session: GameSession;
  player: Player | null;
  events: GameplayEvent[];
  preferences: PlayerPreference[];
  report: GameplayReport;
}

export default function AdminSessionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [detail, setDetail] = useState<SessionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/sessions/${resolvedParams.id}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as Partial<SessionDetailResponse> & {
          error?: string;
        };
        if (!res.ok || !json.session || !json.report) {
          throw new Error(json.error || "Session not found.");
        }
        if (active) {
          setDetail({
            session: json.session,
            player: json.player || null,
            events: json.events || [],
            preferences: json.preferences || [],
            report: json.report,
          });
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load session."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.24em] text-[#8A8178]">
        Reconstructing chronological session timeline...
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/sessions"
          className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-[#57524C]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sessions
        </Link>
        <p className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/35 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg || "Session not found."}
        </p>
      </div>
    );
  }

  const { session, player, events, preferences, report } = detail;
  const baseStartMs = new Date(
    events[0]?.created_at || session.started_at
  ).getTime();
  const totalDurationSec =
    session.completed_at && session.started_at
      ? (new Date(session.completed_at).getTime() -
          new Date(session.started_at).getTime()) /
        1000
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/sessions"
          className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-[#57524C] hover:text-[#1C1917]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sessions
        </Link>

        {player && (
          <Link
            href={`/admin/players/${player.id}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#545E4E] hover:text-[#1C1917] font-medium"
          >
            <User className="w-3.5 h-3.5" />
            Player Profile ({player.display_name})
          </Link>
        )}
      </div>

      {/* Session Header */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#DDD4C5] pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8A8178] font-mono">
              Session UUID · {session.id}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1C1917] mt-1">
              {player ? player.display_name : "Anonymous Session"} —{" "}
              <span className="italic">{report.archetype}</span>
            </h1>
          </div>
          <span
            className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] rounded-sm self-start ${
              session.status === "completed"
                ? "bg-[#E9ECE6] text-[#545E4E]"
                : "bg-[#EFE4CE] text-[#7E6747]"
            }`}
          >
            {session.status}
          </span>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Started
            </dt>
            <dd className="mt-1">{formatDateTime(session.started_at)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Completed
            </dt>
            <dd className="mt-1">{formatDateTime(session.completed_at)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Duration
            </dt>
            <dd className="mt-1 font-mono">
              {formatDurationSeconds(totalDurationSec)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Campaign Attribution
            </dt>
            <dd className="mt-1 font-mono">
              {session.campaign_source || session.utm_source || "direct"} /{" "}
              {session.campaign_medium || session.utm_medium || "none"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
              Recorded Events
            </dt>
            <dd className="mt-1 font-mono">{events.length}</dd>
          </div>
        </dl>
      </section>

      {/* Persisted Preferences */}
      {preferences.length > 0 && (
        <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-3">
          <h2 className="font-serif text-lg text-[#1C1917]">
            Explicit Preferences ({preferences.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {preferences.map((pref, i) => (
              <div
                key={i}
                className="px-3 py-2 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm text-xs"
              >
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8A8178] block">
                  {pref.preference_category}
                </span>
                <span className="font-medium text-[#1C1917]">
                  {pref.selected_value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chronological Event Stream */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Chronological Event Log ({events.length})
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] font-mono">
            Ordered Ascending
          </span>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-[#8A8178] py-8 text-center">
            No events recorded for this session yet.
          </p>
        ) : (
          <ol className="relative border-l border-[#DDD4C5] ml-3 space-y-4">
            {events.map((ev, idx) => {
              const evTimeMs = ev.created_at
                ? new Date(ev.created_at).getTime()
                : baseStartMs;
              const offsetSec = Math.max(
                0,
                Math.round(((evTimeMs - baseStartMs) / 1000) * 10) / 10
              );
              const payloadKeys = Object.keys(ev.event_data || {});

              return (
                <li key={ev.id || idx} className="ml-5 space-y-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#545E4E] absolute -left-[5.5px] mt-1.5"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-[#1C1917] text-[#FAF7F2] rounded-sm">
                      {ev.event_type}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm">
                      Ch. 0{ev.chapter}
                    </span>
                    <span className="font-mono text-[11px] text-[#545E4E]">
                      +{offsetSec}s
                    </span>
                    <span className="text-[11px] text-[#8A8178] ml-auto">
                      {formatDateTime(ev.created_at)}
                    </span>
                  </div>

                  {payloadKeys.length > 0 && (
                    <pre className="p-3 bg-[#F6F3EC] border border-[#EDE6DA] rounded-sm text-[11px] font-mono text-[#1C1917] overflow-x-auto">
                      {JSON.stringify(ev.event_data, null, 2)}
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
