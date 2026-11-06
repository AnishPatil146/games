"use client";

import { Award, CheckCircle2, Lock } from "lucide-react";
import { ACADEMY_BADGES, calculateStudentRank } from "@/lib/junior/academy-models";

interface AchievementsPanelProps {
  totalAttemptsCompleted?: number;
  bestScoreOutOf10?: number | null;
  studentName?: string;
}

export function AchievementsPanel({
  totalAttemptsCompleted = 1,
  bestScoreOutOf10 = 8,
  studentName = "The Scholar",
}: AchievementsPanelProps) {
  const estimatedXP = (totalAttemptsCompleted * 45) + ((bestScoreOutOf10 || 0) * 15);
  const rank = calculateStudentRank(estimatedXP);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Masthead & Scholar Rank Card */}
      <div className="bg-[#181512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] relative overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-8 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4A47C] font-bold">
              Scholastic Rank · {studentName}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#FAF7F2]">
              Academic Honors &amp; Distinction
            </h2>
            <p className="text-sm text-[#A89F93] leading-relaxed max-w-xl">
              Earn mastery distinctions through consistent practice cycles, flawless examination scores, and deep domain dedication.
            </p>
          </div>

          <div className="md:col-span-4 p-5 bg-[#12100E] border border-[#3A332A] rounded-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A8178] uppercase">Current Title</span>
              <span className="text-emerald-400 font-bold">Level {rank.level}</span>
            </div>
            <p className="font-serif text-xl font-bold text-[#FAF7F2]">{rank.title}</p>
            
            {/* XP Progress Bar */}
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-[#A89F93]">
                <span>{estimatedXP} XP</span>
                <span>{rank.nextThreshold} XP Goal</span>
              </div>
              <div className="w-full h-2 bg-[#25201A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8FA184] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, rank.progressPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Badges Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-[#1C1917]">
            Earned Insignias &amp; Badges
          </h3>
          <span className="text-xs font-mono text-[#545E4E] font-bold">
            {ACADEMY_BADGES.filter((b) => b.unlocked).length} / {ACADEMY_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACADEMY_BADGES.map((badge) => {
            const isUnlocked = badge.unlocked || estimatedXP >= badge.requiredPoints;
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-sm border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-[#FAF7F2] border-[#8FA184] text-[#1C1917] shadow-sm"
                    : "bg-[#F3EDE2]/60 border-[#DDD4C5] text-[#8A8178] opacity-75"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isUnlocked
                          ? "bg-[#545E4E] text-[#FAF7F2]"
                          : "bg-[#DDD4C5] text-[#8A8178]"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8A8178]">
                        <Lock className="w-3 h-3" /> {badge.requiredPoints} XP
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif text-base font-bold text-[#1C1917] leading-snug">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-[#57524C] mt-1 leading-relaxed">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DDD4C5] text-[10px] font-mono uppercase tracking-wider text-[#8A8178]">
                  Category: {badge.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
