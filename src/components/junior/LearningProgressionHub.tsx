"use client";

import React, { useState } from "react";
import {
  Flame,
  CheckCircle2,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { calculateStudentRank } from "@/lib/junior/academy-models";

export function LearningProgressionHub() {
  const [totalXP] = useState(480);
  const rank = calculateStudentRank(totalXP);

  const streakDays = [
    { day: "Mon", active: true },
    { day: "Tue", active: true },
    { day: "Wed", active: true },
    { day: "Thu", active: true },
    { day: "Fri", active: true },
    { day: "Sat", active: false },
    { day: "Sun", active: false },
  ];

  const dailyMissions = [
    {
      id: "m-1",
      title: "Ray Optics Reflection Verification",
      xp: 50,
      completed: true,
      category: "Simulation",
    },
    {
      id: "m-2",
      title: "Recall 3 Quadratic Equations Formulas",
      xp: 40,
      completed: true,
      category: "Formula Recall",
    },
    {
      id: "m-3",
      title: "Solve 5 Medium Practice Arena Questions",
      xp: 60,
      completed: false,
      category: "Practice",
    },
  ];

  const topicMastery = [
    { topic: "Light Optics & Lens Formula", masteryPct: 88, classLvl: 10 },
    { topic: "Quadratic Formula & Discriminant", masteryPct: 92, classLvl: 10 },
    { topic: "Ohm's Law & DC Circuits", masteryPct: 76, classLvl: 10 },
    { topic: "Gauss's Theorem & Flux", masteryPct: 64, classLvl: 12 },
    { topic: "Bayes' Theorem & Conditional Prob", masteryPct: 58, classLvl: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Scholar Identity & Level Banner */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-6 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
              Scholar Rank · Level {rank.level}
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#FAF7F2]">
              {rank.title}
            </h2>
            <p className="text-xs text-zinc-400">
              Total Academic Progress:{" "}
              <span className="text-amber-400 font-bold">{totalXP} XP</span>
            </p>
          </div>

          {/* 7-Day Streak Badge */}
          <div className="bg-[#100D0B] border border-[#2F2722] rounded-md px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-amber-400 leading-tight">
                5 Days
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">
                Active Study Streak
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>Progress to Next Rank</span>
            <span>{rank.progressPct}%</span>
          </div>
          <div className="w-full bg-[#100D0B] h-2.5 rounded-full overflow-hidden border border-[#2A221C]">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${rank.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Grid: Daily Missions & Streak Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Daily Missions */}
        <div className="md:col-span-7 bg-[#15110F] border border-[#2F2722] rounded-md p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#28211C] pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">Daily Missions</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Resets in 10h</span>
          </div>

          <div className="space-y-2.5">
            {dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className={`p-3.5 rounded border text-xs font-mono flex items-center justify-between transition-colors ${
                  mission.completed
                    ? "bg-[#111A14] border-emerald-500/40 text-emerald-300"
                    : "bg-[#191411] border-[#2C231D] text-zinc-300 hover:border-zinc-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  {mission.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-500 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-white block">{mission.title}</span>
                    <span className="text-[10px] text-zinc-400">{mission.category}</span>
                  </div>
                </div>
                <span className="font-bold text-amber-400 bg-[#100D0B] px-2 py-0.5 rounded border border-[#302620]">
                  +{mission.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Calendar Streak */}
        <div className="md:col-span-5 bg-[#15110F] border border-[#2F2722] rounded-md p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-[#28211C] pb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-[#FAF7F2]">Study Calendar</h3>
          </div>

          <div className="flex justify-between items-center pt-2">
            {streakDays.map((sd, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    sd.active
                      ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40"
                      : "bg-[#1C1613] text-zinc-500 border border-[#2F251E]"
                  }`}
                >
                  {sd.active ? "✓" : "—"}
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{sd.day}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-[#28211C]">
            Complete at least one practice cycle or simulation daily to keep your multiplier active.
          </p>
        </div>
      </div>

      {/* 3. Topic Mastery Matrix */}
      <div className="bg-[#15110F] border border-[#2F2722] rounded-md p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#28211C] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-[#FAF7F2]">Topic Mastery Matrix</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">Class 10 · 11 · 12 Skills</span>
        </div>

        <div className="space-y-3">
          {topicMastery.map((tm, idx) => (
            <div key={idx} className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>
                  <span className="text-amber-400 font-bold mr-2">[Class {tm.classLvl}]</span>
                  {tm.topic}
                </span>
                <span className="font-bold text-emerald-400">{tm.masteryPct}%</span>
              </div>
              <div className="w-full bg-[#100D0B] h-2 rounded-full overflow-hidden border border-[#28201A]">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${tm.masteryPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
