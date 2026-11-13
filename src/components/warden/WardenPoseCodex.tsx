"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  WARDEN_POSES_GALLERY,
  PoseDetail,
  CinematicMode,
} from "@/lib/cinematicTimelineEngine";
import { Play, Sparkles, Eye, Shield, Feather, Volume2 } from "lucide-react";

interface WardenPoseCodexProps {
  onSelectPose?: (pose: PoseDetail) => void;
  selectedPoseId?: string;
}

export function WardenPoseCodex({
  onSelectPose,
  selectedPoseId,
}: WardenPoseCodexProps) {
  const [filter, setFilter] = useState<"all" | CinematicMode>("all");
  const [inspectPose, setInspectPose] = useState<PoseDetail | null>(null);

  const filteredPoses = WARDEN_POSES_GALLERY.filter((p) => {
    if (filter === "all") return true;
    return p.mode === filter;
  });

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-mono uppercase tracking-[0.25em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Original Character Manifest · 6 Canon Stances</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-[#FAF7F2] mb-4">
          The Warden&apos;s Pose Codex
        </h2>
        <p className="font-serif text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Every stance captured from the ancient threshold of the Dungeon. Each pose represents a pivotal moment in the Warden&apos;s awakening, synchronized directly to the official vocal recordings.
        </p>

        {/* Filter Pills */}
        <div className="mt-8 inline-flex items-center p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#FAF7F2] text-black font-bold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All 6 Stances
          </button>
          <button
            onClick={() => setFilter("intro")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === "intro"
                ? "bg-red-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Intro Sequence (3)
          </button>
          <button
            onClick={() => setFilter("outro")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === "outro"
                ? "bg-red-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Outro Sequence (3)
          </button>
        </div>
      </div>

      {/* Grid of Poses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoses.map((pose, idx) => {
          const isSelected = selectedPoseId === pose.id;
          return (
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#141217]/90 to-[#0A090C] border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? "border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.35)] ring-1 ring-red-500/50"
                  : "border-white/10 hover:border-[#C8B28E]/50 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              }`}
            >
              {/* Image Frame Container */}
              <div className="relative w-full aspect-[4/5] bg-radial from-white/[0.04] to-black/80 overflow-hidden flex items-end justify-center p-4">
                {/* Environmental Backdrop hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-transparent to-black/40 pointer-events-none z-10" />

                {/* Character Silhouette */}
                <div className="relative w-full h-[95%] transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={pose.image}
                    alt={pose.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain object-bottom filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                  />
                </div>

                {/* Stance Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-[#C8B28E] backdrop-blur-sm">
                    {pose.name.split("·")[0].trim()}
                  </span>
                </div>

                {/* Mode Tag */}
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm ${
                      pose.mode === "intro"
                        ? "bg-red-950/80 border border-red-700/50 text-red-300"
                        : "bg-amber-950/80 border border-amber-700/50 text-amber-300"
                    }`}
                  >
                    {pose.mode} cue · @{pose.audioTime}s
                  </span>
                </div>

                {/* Quick Inspect Button */}
                <button
                  onClick={() => setInspectPose(pose)}
                  className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-black/70 border border-white/20 text-white/80 hover:text-white hover:bg-black transition-colors backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Inspect Full Stance"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C8B28E] mb-1">
                    {pose.role}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2] tracking-wide mb-2">
                    {pose.title}
                  </h3>
                  <p className="font-serif text-xs text-zinc-400 leading-relaxed mb-3">
                    {pose.description}
                  </p>

                  {/* Synchronized Quote */}
                  <blockquote className="border-l-2 border-red-700/60 pl-3 py-1 font-serif italic text-xs text-zinc-300 bg-red-950/20 rounded-r">
                    {pose.quote}
                  </blockquote>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectPose?.(pose)}
                  className={`w-full py-2.5 px-4 rounded-xl font-serif text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.7)] font-bold"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isSelected ? "Currently Active in Theater" : "Sync Stance to Theater"}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Inspect High-Res Modal */}
      <AnimatePresence>
        {inspectPose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectPose(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#0D0B10] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row cursor-default"
            >
              {/* Large Image View */}
              <div className="relative w-full md:w-1/2 aspect-[3/4] bg-radial from-zinc-800/20 to-black p-6 flex items-end justify-center">
                <Image
                  src={inspectPose.image}
                  alt={inspectPose.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain object-bottom filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                />
              </div>

              {/* Details Pane */}
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C8B28E]">
                      {inspectPose.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700/60 text-[10px] font-mono text-red-300 uppercase">
                      {inspectPose.mode}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F2] mb-3">
                    {inspectPose.title}
                  </h3>

                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4 pb-4 border-b border-white/10">
                    Role: {inspectPose.role}
                  </div>

                  <p className="font-serif text-sm text-zinc-300 leading-relaxed mb-6">
                    {inspectPose.description}
                  </p>

                  <div className="bg-black/60 rounded-xl p-4 border border-white/10 mb-6">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#C8B28E] mb-1 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Original Narration Voiceover</span>
                    </div>
                    <blockquote className="font-serif italic text-sm text-white leading-relaxed">
                      {inspectPose.quote}
                    </blockquote>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onSelectPose?.(inspectPose);
                      setInspectPose(null);
                    }}
                    className="flex-1 py-3 px-5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.6)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Experience in Theater</span>
                  </button>
                  <button
                    onClick={() => setInspectPose(null)}
                    className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

