"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Award,
  BookOpen,
  GraduationCap,
  Trophy,
  BarChart3,
  Compass,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AcademyTab } from "@/lib/junior/academy-models";

interface AcademyHeaderProps {
  activeTab: AcademyTab;
  onTabChange: (tab: AcademyTab) => void;
  studentName?: string;
  rankTitle: string;
  rankLevel: number;
  streakDays?: number;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

export function AcademyHeader({
  activeTab,
  onTabChange,
  studentName,
  rankTitle,
  rankLevel,
  streakDays = 3,
  isAudioMuted = false,
  onToggleAudio,
}: AcademyHeaderProps) {
  const tabs: { id: AcademyTab; label: string; icon: typeof BookOpen }[] = [
    { id: "home", label: "Academy Gate", icon: Compass },
    { id: "board_prep", label: "Board Prep", icon: BookOpen },
    { id: "competitive_exams", label: "Entrance Arena", icon: Trophy },
    { id: "practice_arena", label: "Practice Studio", icon: GraduationCap },
    { id: "mock_hall", label: "Mock Exam Hall", icon: FileText },
    { id: "revision_centre", label: "Revision & Formulas", icon: Award },
    { id: "achievements", label: "Honors & Badges", icon: Award },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#141210]/95 backdrop-blur-md border-b border-[#2C2620] text-[#FAF7F2]">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-[#24201A] text-xs">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            title="Return to Main Gate"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#545E4E]/50">
              <Image
                src="/brand/emblem-silence.png"
                alt="The Unwritten Emblem"
                fill
                className="object-cover"
              />
            </div>
            <div className="leading-tight">
              <span className="font-serif italic font-bold tracking-wider text-sm text-[#FAF7F2]">
                THE ACADEMY
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] text-[#8FA184] ml-2">
                Reasoning &amp; Entrance Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Student Status & Streak Chips */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-[11px]">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1F1B16] border border-[#3A332A] rounded-full text-amber-300">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streakDays} Day Streak</span>
          </div>

          {/* Level & Rank */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1F1B16] border border-[#3A332A] rounded-full text-[#DDD4C5]">
            <span className="text-[#8FA184] font-bold">Lvl {rankLevel}</span>
            <span>·</span>
            <span className="text-[#FAF7F2] truncate max-w-[140px]">
              {studentName || rankTitle}
            </span>
          </div>

          {/* Sound Mute Toggle */}
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              className="p-1.5 rounded-full bg-[#1F1B16] border border-[#3A332A] hover:bg-[#2A241E] text-[#DDD4C5] transition-colors cursor-pointer"
              title={isAudioMuted ? "Unmute Ambient Atmosphere" : "Mute Sound"}
            >
              {isAudioMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#8FA184]" />
              )}
            </button>
          )}

          {/* Return link */}
          <Link
            href="/"
            className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Public Gate
          </Link>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex items-center gap-1 py-1 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm whitespace-nowrap font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-[#25201A] text-[#FAF7F2] border-b-2 border-[#8FA184] font-bold shadow-sm"
                  : "text-[#A89F93] hover:text-[#FAF7F2] hover:bg-[#1A1612]"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-[#8FA184]" : "text-[#7A7165]"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
