"use client";

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface ParticipantBreadcrumbsProps {
  participant: {
    participantId: string;
    fullName: string;
    username: string;
    isAnonymous: boolean;
  };
  activeTab: "overview" | "junior" | "senior";
  extraCrumbs?: BreadcrumbCrumb[];
}

export function ParticipantBreadcrumbs({
  participant,
  activeTab,
  extraCrumbs = [],
}: ParticipantBreadcrumbsProps) {
  const encodedId = encodeURIComponent(participant.participantId);

  return (
    <div className="space-y-4">
      {/* Breadcrumb Trail */}
      <nav
        aria-label="Participant hierarchy breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-[#57524C]"
      >
        <Link
          href="/admin/participants"
          className="hover:text-[#1C1917] underline-offset-4 hover:underline font-medium"
        >
          Participants
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#8A8178]" />
        <Link
          href={`/admin/participants/${encodedId}`}
          className={`hover:text-[#1C1917] underline-offset-4 hover:underline ${
            activeTab === "overview" && extraCrumbs.length === 0
              ? "text-[#1C1917] font-semibold"
              : ""
          }`}
        >
          {participant.fullName} (@{participant.username})
        </Link>
        {extraCrumbs.map((crumb, idx) => (
          <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-[#8A8178]" />
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-[#1C1917] underline-offset-4 hover:underline"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#1C1917] font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Persistent Participant Identity Context Bar */}
      <div className="bg-[#141210] text-[#FAF7F2] border border-[#2B2723] rounded-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#24201C] border border-[#3E3730] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#C8B28E]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-xl text-[#FAF7F2]">
                {participant.fullName}
              </span>
              <span className="font-mono text-xs text-[#C8B28E]">
                @{participant.username}
              </span>
              <span
                className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] rounded-sm border ${
                  participant.isAnonymous
                    ? "border-[#57524C] text-[#A89F93]"
                    : "border-[#545E4E] text-[#A6B89C]"
                }`}
              >
                {participant.isAnonymous ? "Anonymous Session" : "Registered Profile"}
              </span>
            </div>
            <span className="block font-mono text-[10px] text-[#8A8178] mt-0.5">
              ID: {participant.participantId}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
          <Link
            href={`/admin/participants/${encodedId}`}
            className={`px-3 py-1.5 rounded-sm border transition-colors ${
              activeTab === "overview"
                ? "bg-[#FAF7F2] text-[#141210] border-[#FAF7F2] font-semibold"
                : "border-[#3E3730] text-[#D6CEC0] hover:bg-[#1F1C19]"
            }`}
          >
            Central Profile
          </Link>
          <Link
            href={`/admin/participants/${encodedId}/junior`}
            className={`px-3 py-1.5 rounded-sm border transition-colors ${
              activeTab === "junior"
                ? "bg-[#FAF7F2] text-[#141210] border-[#FAF7F2] font-semibold"
                : "border-[#3E3730] text-[#D6CEC0] hover:bg-[#1F1C19]"
            }`}
          >
            Junior Mode
          </Link>
          <Link
            href={`/admin/participants/${encodedId}/senior`}
            className={`px-3 py-1.5 rounded-sm border transition-colors ${
              activeTab === "senior"
                ? "bg-[#FAF7F2] text-[#141210] border-[#FAF7F2] font-semibold"
                : "border-[#3E3730] text-[#D6CEC0] hover:bg-[#1F1C19]"
            }`}
          >
            Senior Mode
          </Link>
        </div>
      </div>
    </div>
  );
}

