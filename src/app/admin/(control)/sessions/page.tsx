"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { GameSession } from "@/lib/types";
import { Button } from "@/components/Button";
import {
  formatDateTime,
  formatDurationSeconds,
} from "@/components/admin/formatters";

const PAGE_SIZE = 15;

async function requestAdminSessions(): Promise<GameSession[]> {
  const res = await fetch("/api/admin/sessions", { cache: "no-store" });
  const data = (await res.json()) as {
    sessions?: GameSession[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Unable to fetch sessions.");
  }
  return data.sessions || [];
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");
  const [identityFilter, setIdentityFilter] = useState<
    "all" | "registered" | "anonymous"
  >("all");
  const [page, setPage] = useState(1);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await requestAdminSessions();
      setSessions(items);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load sessions."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestAdminSessions()
      .then((items) => {
        if (active) setSessions(items);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load sessions."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (identityFilter === "registered" && !s.player_id) return false;
      if (identityFilter === "anonymous" && Boolean(s.player_id)) return false;

      if (!q) return true;
      const name = s.player?.display_name?.toLowerCase() || "anonymous";
      const handle = s.player?.instagram_username?.toLowerCase() || "";
      const source = (
        s.campaign_source ||
        s.utm_source ||
        "direct"
      ).toLowerCase();
      const arch = (s.result_archetype || "").toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        name.includes(q) ||
        handle.includes(q) ||
        source.includes(q) ||
        arch.includes(q)
      );
    });
  }, [sessions, query, statusFilter, identityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#8A8178] font-mono">
            Control Centre · Session Telemetry
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
            Sessions ({sessions.length})
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => void loadSessions()}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#8A8178] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search session UUID, player, campaign source, archetype..."
            aria-label="Search sessions"
            className="w-full pl-9 pr-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(1);
          }}
          aria-label="Filter sessions by status"
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>

        <select
          value={identityFilter}
          onChange={(e) => {
            setIdentityFilter(e.target.value as typeof identityFilter);
            setPage(1);
          }}
          aria-label="Filter sessions by registration mode"
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
        >
          <option value="all">Registered &amp; Anonymous</option>
          <option value="registered">Registered Only</option>
          <option value="anonymous">Anonymous Only</option>
        </select>
      </div>

      {errorMsg && (
        <p className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/35 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg}
        </p>
      )}

      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
            Loading session records...
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-2">
            <p className="text-sm font-medium text-[#1C1917]">
              {sessions.length === 0
                ? "No gameplay sessions persisted yet."
                : "No sessions match your active filters."}
            </p>
            <p className="text-xs text-[#8A8178]">
              Every public landing visit and playthrough creates a real session
              entry here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DDD4C5] bg-[#F3EDE2]/60 text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Identity</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Archetype</th>
                  <th className="py-3 px-4">Started</th>
                  <th className="py-3 px-4 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE6DA]">
                {paginated.map((s) => {
                  const durationSec =
                    s.completed_at && s.started_at
                      ? Math.max(
                          0,
                          (new Date(s.completed_at).getTime() -
                            new Date(s.started_at).getTime()) /
                            1000
                        )
                      : null;
                  return (
                    <tr key={s.id} className="hover:bg-[#F3EDE2]/45">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#57524C]">
                        {s.id.slice(0, 8)}…
                      </td>
                      <td className="py-3.5 px-4">
                        {s.player ? (
                          <Link
                            href={`/admin/players/${s.player.id}`}
                            className="font-medium text-[#1C1917] hover:underline"
                          >
                            {s.player.display_name}
                          </Link>
                        ) : (
                          <span className="text-[#8A8178] italic">
                            Anonymous
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {s.campaign_source || s.utm_source || "direct"}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        0{s.current_chapter}/06
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${
                            s.status === "completed"
                              ? "bg-[#E9ECE6] text-[#545E4E]"
                              : "bg-[#EFE4CE] text-[#7E6747]"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatDurationSeconds(durationSec)}
                      </td>
                      <td className="py-3.5 px-4 font-serif italic text-sm">
                        {s.result_archetype || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[#57524C] whitespace-nowrap">
                        {formatDateTime(s.started_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/sessions/${s.id}`}
                          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-[#1C1917] hover:text-[#545E4E] font-medium"
                        >
                          Events <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-[#DDD4C5] flex items-center justify-between text-xs text-[#57524C]">
            <span>
              Page {safePage} of {totalPages} ({filtered.length} sessions)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
