"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Users } from "lucide-react";
import { ParticipantDirectoryItem } from "@/lib/platform-types";
import { formatDateTime } from "@/components/admin/formatters";

export default function AdminParticipantsDirectoryPage() {
  const [items, setItems] = useState<ParticipantDirectoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<
    "all" | "senior" | "junior" | "both" | "anonymous"
  >("all");
  const [sortBy, setSortBy] = useState<
    "last_activity" | "registration_date" | "total_sessions"
  >("last_activity");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const qs = new URLSearchParams({
          modeFilter,
          sortBy,
          page: String(page),
          pageSize: "15",
        });
        if (search.trim()) qs.set("search", search.trim());

        const res = await fetch(`/api/v1/admin/participants?${qs.toString()}`);
        const data = (await res.json()) as {
          items?: ParticipantDirectoryItem[];
          total?: number;
          totalPages?: number;
        };
        if (active && data.items) {
          setItems(data.items);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [search, modeFilter, sortBy, page]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-[#DDD4C5] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Control Centre · Primary Entry Point
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Participant Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#57524C] mt-1">
            Drill down from any participant into their Central Profile, modes
            played, Junior academic analytics, or Senior narrative dossier.
          </p>
        </div>
        <div className="px-3.5 py-2 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-xs font-mono text-[#1C1917]">
          {total} Participant{total === 1 ? "" : "s"} Indexed
        </div>
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#FAF7F2] border border-[#DDD4C5] p-4 rounded-sm">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#8A8178] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, @username, handle, or ID..."
            aria-label="Search participants"
            className="w-full pl-9 pr-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(
                e.target.value as
                  | "all"
                  | "senior"
                  | "junior"
                  | "both"
                  | "anonymous"
              );
              setPage(1);
            }}
            aria-label="Filter by mode played"
            className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
          >
            <option value="all">All Participants</option>
            <option value="junior">Played Junior Mode</option>
            <option value="senior">Played Senior Mode</option>
            <option value="both">Played Both Modes</option>
            <option value="anonymous">Anonymous Sessions Only</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "last_activity"
                  | "registration_date"
                  | "total_sessions"
              )
            }
            aria-label="Sort directory"
            className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm text-xs text-[#1C1917]"
          >
            <option value="last_activity">Sort: Recent Activity</option>
            <option value="registration_date">Sort: First Seen</option>
            <option value="total_sessions">Sort: Total Runs</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
            Loading Participant Directory...
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-2 px-4">
            <Users className="w-6 h-6 text-[#8A8178] mx-auto" />
            <p className="font-serif text-xl text-[#1C1917]">
              No matching participant records yet.
            </p>
            <p className="text-xs text-[#57524C]">
              Real participant entries appear automatically as visitors play
              Senior Mode or Junior Mode.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Modes Played</th>
                  <th className="py-3.5 px-4">Runs / Completed</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Drill-Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {items.map((item) => {
                  const enc = encodeURIComponent(item.participantId);
                  return (
                    <tr
                      key={item.participantId}
                      className="hover:bg-[#F3EDE2]/55 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/participants/${enc}`}
                          className="font-serif text-base text-[#1C1917] hover:underline block"
                        >
                          {item.fullName}
                        </Link>
                        <span className="font-mono text-[11px] text-[#8A8178]">
                          @{item.username}
                          {item.isAnonymous ? " · Anonymous" : " · Registered"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.modesPlayed.includes("senior") && (
                            <Link
                              href={`/admin/participants/${enc}/senior`}
                              className="px-2 py-0.5 bg-[#141210] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.16em]"
                            >
                              Senior ({item.seniorSessionsCount})
                            </Link>
                          )}
                          {item.modesPlayed.includes("junior") && (
                            <Link
                              href={`/admin/participants/${enc}/junior`}
                              className="px-2 py-0.5 bg-[#545E4E] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.16em]"
                            >
                              Junior ({item.juniorAttemptsCount})
                            </Link>
                          )}
                          {item.modesPlayed.length === 0 && (
                            <span className="text-[#8A8178]">Initialized</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {item.totalSessions} total ·{" "}
                        {item.completedExperiencesCount} completed
                      </td>

                      <td className="py-3.5 px-4 text-[#57524C]">
                        {formatDateTime(item.lastActivityAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/participants/${enc}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.18em] hover:bg-[#322D29]"
                        >
                          <span>Open Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#DDD4C5] bg-[#F3EDE2]/50 flex items-center justify-between text-xs">
            <span className="text-[#57524C]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-[#CFC5B4] bg-[#FAF7F2] rounded-sm disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-[#CFC5B4] bg-[#FAF7F2] rounded-sm disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

