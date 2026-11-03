"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Clock,
  Compass,
  CheckCircle2,
  HelpCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { GameSession, Player, GameplayEvent, PlayerPreference, GameplayReport } from "@/lib/types";
import { AdminNav } from "@/components/AdminNav";

export default function AdminPlayerDetailPage() {
  const params = useParams();
  const playerId = (params?.id as string) || "";
  const router = useRouter();

  const [session, setSession] = useState<GameSession | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [events, setEvents] = useState<GameplayEvent[]>([]);
  const [preferences, setPreferences] = useState<PlayerPreference[]>([]);
  const [report, setReport] = useState<GameplayReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/players/${playerId}`)
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to load player dossier");
        return res.json();
      })
      .then((data) => {
        setSession(data.session);
        setPlayer(data.player);
        setEvents(data.events || []);
        setPreferences(data.preferences || []);
        setReport(data.report || null);
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [playerId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-8 h-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin mb-4" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#78716C]">
            Opening Archival Record...
          </p>
        </main>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-sm text-[#A37070]">{error || "Record not found"}</p>
          <Link
            href="/admin/players"
            className="text-xs uppercase tracking-wider underline text-[#1C1917]"
          >
            Return to Player Directory
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <AdminNav />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/admin/players"
          className="inline-flex items-center text-xs uppercase tracking-wider text-[#78716C] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Player Directory</span>
        </Link>

        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E0D7CB] gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#78716C] block">
                Traveler Profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
                {player?.display_name || "Anonymous Traveler"}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded text-xs uppercase tracking-wider font-semibold ${
                  session.status === "completed"
                    ? "bg-[#EDF0EB] text-[#5B6356]"
                    : "bg-[#F2ECE2] text-[#8C827A]"
                }`}
              >
                {session.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                Instagram Username
              </span>
              <span className="font-mono text-[#1C1917]">
                {player?.instagram_username ? `@${player.instagram_username}` : "Not provided"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                Presentation Preference
              </span>
              <span className="uppercase text-[#1C1917]">
                {session.character_presentation || "UNSPECIFIED"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                Session Started
              </span>
              <span className="text-[#1C1917]">
                {new Date(session.started_at).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                Result Archetype
              </span>
              <span className="font-serif font-semibold text-[#1C1917]">
                {session.result_archetype || report?.archetype || "In progress"}
              </span>
            </div>
          </div>

          {/* Campaign context if any */}
          {(session.utm_source || session.utm_campaign) && (
            <div className="pt-2 border-t border-[#E0D7CB] text-[11px] text-[#57534E] flex items-center space-x-3">
              <span>Source: <strong>{session.utm_source || "direct"}</strong></span>
              <span>•</span>
              <span>Medium: <strong>{session.utm_medium || "none"}</strong></span>
              <span>•</span>
              <span>Campaign: <strong>{session.utm_campaign || "none"}</strong></span>
            </div>
          )}
        </div>

        {/* Preferences Saved */}
        {preferences.length > 0 && (
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
              Explicit Preferences & Selections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {preferences.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-[#E0D7CB] bg-[#F4EFE7]/50 text-xs"
                >
                  <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                    {p.preference_category.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium text-[#1C1917]">
                    {p.selected_value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Gameplay Timeline */}
        <div className="p-6 rounded border border-[#E0D7CB] bg-[#FAF8F5] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0D7CB] pb-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1C1917]">
                Chronological Gameplay Event Log
              </h2>
              <p className="text-xs text-[#78716C]">
                Every choice, clue inspection, puzzle attempt, and chapter transition.
              </p>
            </div>
            <span className="text-xs text-[#78716C]">
              {events.length} Events Logged
            </span>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-[#8C827A] py-4 text-center">
              No events recorded for this session.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D8]">
              {events.map((ev, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#5B6356] border-2 border-[#FAF8F5]" />

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-[#1C1917] uppercase tracking-wider">
                      Chapter 0{ev.chapter}: {ev.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[#8C827A] text-[10px]">
                      {ev.created_at
                        ? new Date(ev.created_at).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>

                  {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                    <div className="p-3 bg-[#F4EFE7] rounded border border-[#E0D7CB] text-[11px] font-mono text-[#44403C] overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(ev.event_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dossier Report Snapshot */}
        {report && (
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1C1917]">
              Generated Player Dossier Summary
            </h2>
            <div className="space-y-2 text-xs text-[#57534E]">
              <p>
                <strong>Archetype:</strong> {report.archetype} ({report.confidence} confidence)
              </p>
              <p>
                <strong>Interpretation:</strong> {report.interpretation}
              </p>
              <p>
                <strong>Puzzle Accuracy:</strong> {report.puzzlePerformance.accuracyRate} ({report.puzzlePerformance.solvedCorrectly} / {report.puzzlePerformance.totalPuzzles})
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
