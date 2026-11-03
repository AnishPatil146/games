"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, GraduationCap } from "lucide-react";
import { ParticipantBreadcrumbs } from "@/components/admin/ParticipantBreadcrumbs";
import { formatDateTime } from "@/components/admin/formatters";

interface CentralProfileData {
  participant: {
    participantId: string;
    isAnonymous: boolean;
    username: string;
    fullName: string;
    instagramHandle: string | null;
    registeredAt: string;
    lastActivityAt: string;
    accountStatus: string;
  };
  summaryMetrics: {
    totalSessions: number;
    totalModesPlayed: number;
    seniorSessions: number;
    juniorAttempts: number;
    totalCompletedExperiences: number;
  };
  seniorSummary: {
    played: boolean;
    sessionCount: number;
    completedCount: number;
    completionStatus: string;
    latestArchetype: string | null;
    lastPlayedAt: string | null;
  };
  juniorSummary: {
    played: boolean;
    streams: string[];
    primaryStream: string | null;
    subjectsAttempted: string[];
    totalAttempts: number;
    completedAttempts: number;
    lastPlayedAt: string | null;
  };
}

export default function ParticipantCentralProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const [data, setData] = useState<CentralProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/v1/admin/participants/${encodeURIComponent(
            playerId
          )}?view=profile`
        );
        if (res.ok) {
          const json = (await res.json()) as CentralProfileData;
          if (active) setData(json);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Central Participant Profile...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="font-serif text-2xl text-[#1C1917]">
          Participant record not found.
        </p>
        <Link
          href="/admin/participants"
          className="text-xs uppercase tracking-[0.18em] underline"
        >
          Return to Participant Directory
        </Link>
      </div>
    );
  }

  const enc = encodeURIComponent(data.participant.participantId);

  return (
    <div className="space-y-8">
      <ParticipantBreadcrumbs
        participant={data.participant}
        activeTab="overview"
      />

      {/* Summary KPI Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
            Modes Played
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.summaryMetrics.totalModesPlayed} / 2
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
            Total Runs &amp; Attempts
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.summaryMetrics.totalSessions}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
            Completed Runs
          </span>
          <span className="font-serif text-3xl text-[#1C1917] mt-1 block">
            {data.summaryMetrics.totalCompletedExperiences}
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
            Last Active
          </span>
          <span className="font-mono text-xs text-[#1C1917] mt-2 block">
            {formatDateTime(data.participant.lastActivityAt)}
          </span>
        </div>
      </section>

      {/* MODES PLAYED — MODE-SPECIFIC DASHBOARD CARDS */}
      <section className="space-y-4">
        <div className="border-b border-[#DDD4C5] pb-2">
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Modes Played &amp; Performance Dashboards
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JUNIOR MODE CARD */}
          <div className="p-6 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#545E4E] font-semibold">
                  <GraduationCap className="w-4 h-4" />
                  Junior Mode — Class 11
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] rounded-sm ${
                    data.juniorSummary.played
                      ? "bg-[#545E4E] text-[#FAF7F2]"
                      : "bg-[#E7E0D3] text-[#8A8178]"
                  }`}
                >
                  {data.juniorSummary.played ? "Played" : "Not Yet Played"}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E5DEC9]">
                <div>
                  <dt className="text-[#8A8178]">Streams Explored</dt>
                  <dd className="font-medium text-[#1C1917] capitalize mt-0.5">
                    {data.juniorSummary.streams.length > 0
                      ? data.juniorSummary.streams.join(", ")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8A8178]">Attempts (Completed)</dt>
                  <dd className="font-mono text-[#1C1917] mt-0.5">
                    {data.juniorSummary.totalAttempts} (
                    {data.juniorSummary.completedAttempts})
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#8A8178]">Subjects Attempted</dt>
                  <dd className="text-[#1C1917] mt-0.5">
                    {data.juniorSummary.subjectsAttempted.length > 0
                      ? data.juniorSummary.subjectsAttempted.join(" · ")
                      : "No subjects attempted yet"}
                  </dd>
                </div>
              </dl>
            </div>

            <Link
              href={`/admin/participants/${enc}/junior`}
              className="inline-flex items-center justify-between px-4 py-3 bg-[#141210] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.18em] hover:bg-[#2B2622]"
            >
              <span>Open Junior Mode Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* SENIOR MODE CARD */}
          <div className="p-6 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#1C1917] font-semibold">
                  <Compass className="w-4 h-4" />
                  Senior Mode — Narrative
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] rounded-sm ${
                    data.seniorSummary.played
                      ? "bg-[#141210] text-[#FAF7F2]"
                      : "bg-[#E7E0D3] text-[#8A8178]"
                  }`}
                >
                  {data.seniorSummary.completionStatus}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E5DEC9]">
                <div>
                  <dt className="text-[#8A8178]">Narrative Sessions</dt>
                  <dd className="font-mono text-[#1C1917] mt-0.5">
                    {data.seniorSummary.sessionCount} (
                    {data.seniorSummary.completedCount} completed)
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8A8178]">Latest Archetype</dt>
                  <dd className="font-serif text-sm text-[#1C1917] mt-0.5">
                    {data.seniorSummary.latestArchetype || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#8A8178]">Last Narrative Activity</dt>
                  <dd className="text-[#1C1917] mt-0.5">
                    {formatDateTime(data.seniorSummary.lastPlayedAt)}
                  </dd>
                </div>
              </dl>
            </div>

            <Link
              href={`/admin/participants/${enc}/senior`}
              className="inline-flex items-center justify-between px-4 py-3 bg-[#141210] text-[#FAF7F2] rounded-sm text-xs uppercase tracking-[0.18em] hover:bg-[#2B2622]"
            >
              <span>Open Senior Mode Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

