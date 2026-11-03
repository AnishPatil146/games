"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Search, ArrowRight, UserCheck, Shield, Eye } from "lucide-react";
import { GameSession } from "@/lib/types";
import { AdminNav } from "@/components/AdminNav";

export default function AdminPlayersDirectoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/players")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to load players");
        return res.json();
      })
      .then((data) => {
        setSessions(data.players || []);
        setAdminEmail(data.adminEmail || "");
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Player directory fetch error:", err);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filteredSessions = sessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = s.player?.display_name?.toLowerCase() || "anonymous";
    const ig = s.player?.instagram_username?.toLowerCase() || "";
    const archetype = s.result_archetype?.toLowerCase() || "";
    const token = s.session_token.toLowerCase();
    return (
      name.includes(term) ||
      ig.includes(term) ||
      archetype.includes(term) ||
      token.includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <AdminNav adminEmail={adminEmail} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D8] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
              Player Directory
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Voluntary profiles and gameplay sessions recorded in the archives.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-[#78716C]">
              Total Records: {sessions.length}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, Instagram, archetype, or token..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917] placeholder:text-[#A8A29E]"
          />
        </div>

        {/* Players Table / List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#78716C]">
              Querying Player Archives...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center border border-[#E0D7CB] rounded bg-[#F4EFE7] space-y-2">
            <Users className="w-8 h-8 text-[#8C827A] mx-auto" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1917]">
              No Player Records Found
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              {searchTerm
                ? "No travelers match your search query."
                : "No gameplay sessions have been recorded in the database yet."}
            </p>
          </div>
        ) : (
          <div className="border border-[#E0D7CB] rounded overflow-hidden bg-[#FAF8F5]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFE7] text-[#57534E] uppercase tracking-wider border-b border-[#E0D7CB]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Traveler</th>
                    <th className="py-3 px-4 font-semibold">Instagram Handle</th>
                    <th className="py-3 px-4 font-semibold">Presentation</th>
                    <th className="py-3 px-4 font-semibold">Chapter</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Result Archetype</th>
                    <th className="py-3 px-4 font-semibold">Started</th>
                    <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D7CB]">
                  {filteredSessions.map((s) => {
                    const isRegistered = Boolean(s.player_id && s.player);
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-[#F4EFE7]/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                          <div className="flex items-center space-x-2">
                            {isRegistered ? (
                              <UserCheck className="w-3.5 h-3.5 text-[#5B6356]" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-[#8C827A]" />
                            )}
                            <span>
                              {s.player?.display_name || "Anonymous Traveler"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E]">
                          {s.player?.instagram_username ? (
                            <span className="font-mono text-[#5B6356]">
                              @{s.player.instagram_username}
                            </span>
                          ) : (
                            <span className="text-[#A8A29E] italic">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-[#78716C]">
                          {s.character_presentation || "UNSPECIFIED"}
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E]">
                          Chapter 0{s.current_chapter} / 06
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                              s.status === "completed"
                                ? "bg-[#EDF0EB] text-[#5B6356]"
                                : "bg-[#F2ECE2] text-[#8C827A]"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-serif text-[#1C1917]">
                          {s.result_archetype || (
                            <span className="text-[#A8A29E] italic text-xs">
                              In Progress
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#78716C] text-[11px]">
                          {new Date(s.started_at).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/players/${s.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-[#D6D3D1] hover:border-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] transition-all text-[11px] uppercase tracking-wider text-[#57534E]"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
