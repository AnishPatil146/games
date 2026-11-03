"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { AdminPlayerListItem } from "@/lib/types";
import { Button } from "@/components/Button";
import { formatDateTime } from "@/components/admin/formatters";

const PAGE_SIZE = 12;

async function requestAdminPlayers(): Promise<AdminPlayerListItem[]> {
  const res = await fetch("/api/admin/players", { cache: "no-store" });
  const data = (await res.json()) as {
    players?: AdminPlayerListItem[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Unable to load player directory.");
  }
  return data.players || [];
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<AdminPlayerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");
  const [presentationFilter, setPresentationFilter] = useState<
    "all" | "HIM" | "HER" | "UNSPECIFIED"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "sessions">(
    "newest"
  );
  const [page, setPage] = useState(1);

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await requestAdminPlayers();
      setPlayers(items);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load players."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestAdminPlayers()
      .then((items) => {
        if (active) setPlayers(items);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load players."
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

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = players.filter((p) => {
      if (statusFilter !== "all" && p.latestStatus !== statusFilter) {
        return false;
      }
      if (
        presentationFilter !== "all" &&
        p.character_presentation !== presentationFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        p.display_name.toLowerCase().includes(q) ||
        (p.instagram_username || "").toLowerCase().includes(q) ||
        (p.latestArchetype || "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      if (sortBy === "name") {
        return a.display_name.localeCompare(b.display_name);
      }
      if (sortBy === "sessions") {
        return b.sessionCount - a.sessionCount;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return list;
  }, [players, query, statusFilter, presentationFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredPlayers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#8A8178] font-mono">
            Control Centre · Registered Directory
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
            Players ({players.length})
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => void loadPlayers()}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-[#8A8178] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, @instagram, archetype, ID..."
            aria-label="Search registered players"
            className="w-full pl-9 pr-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(1);
          }}
          aria-label="Filter by completion status"
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>

        <select
          value={presentationFilter}
          onChange={(e) => {
            setPresentationFilter(e.target.value as typeof presentationFilter);
            setPage(1);
          }}
          aria-label="Filter by character silhouette"
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
        >
          <option value="all">All Silhouettes</option>
          <option value="HIM">HIM</option>
          <option value="HER">HER</option>
          <option value="UNSPECIFIED">Unspecified</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          aria-label="Sort players"
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Display Name (A–Z)</option>
          <option value="sessions">Most Sessions</option>
        </select>
      </div>

      {errorMsg && (
        <p className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/35 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg}
        </p>
      )}

      {/* Directory Table */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
            Loading registered players...
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-2">
            <p className="text-sm font-medium text-[#1C1917]">
              {players.length === 0
                ? "No registered players recorded yet."
                : "No players match the current search or filter."}
            </p>
            <p className="text-xs text-[#8A8178]">
              {players.length === 0
                ? "Visitors who sign their dossier with explicit consent on /play appear here. Anonymous runs appear under Sessions."
                : "Try clearing search terms or switching filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DDD4C5] bg-[#F3EDE2]/60 text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Instagram</th>
                  <th className="py-3 px-4">Silhouette</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4">Sessions</th>
                  <th className="py-3 px-4">Latest Status</th>
                  <th className="py-3 px-4">Archetype</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE6DA]">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F3EDE2]/45">
                    <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                      {p.display_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#57524C]">
                      {p.instagram_username ? `@${p.instagram_username}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {p.character_presentation}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#E9ECE6] text-[#545E4E] rounded-sm">
                        {p.profile_consent ? "Consented" : "No"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{p.sessionCount}</td>
                    <td className="py-3.5 px-4">
                      {p.latestStatus === "completed" ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#E9ECE6] text-[#545E4E] rounded-sm">
                          Completed
                        </span>
                      ) : p.latestStatus ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#EFE4CE] text-[#7E6747] rounded-sm">
                          Ch. 0{p.latestChapter || 1}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-serif italic text-sm text-[#1C1917]">
                      {p.latestArchetype || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-[#57524C] whitespace-nowrap">
                      {formatDateTime(p.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/players/${p.id}`}
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-[#1C1917] hover:text-[#545E4E] font-medium"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredPlayers.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-[#DDD4C5] flex items-center justify-between text-xs text-[#57524C]">
            <span>
              Page {safePage} of {totalPages} ({filteredPlayers.length} matching)
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
