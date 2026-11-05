"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Shield, Home } from "lucide-react";

export default function AllianceLobbyPage() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [initialDifficulty, setInitialDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsCreating(true);

    try {
      const res = await fetch("/api/v1/multiplayer/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: hostName.trim() || "Operative Alpha",
          difficulty: initialDifficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create alliance room");
      }

      sessionStorage.setItem(`alliance_${data.room.code}_player`, data.hostId);
      router.push(`/alliance/${data.room.code}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating room");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setErrorMsg("Please enter an alliance room code.");
      return;
    }
    setErrorMsg(null);
    setIsJoining(true);

    const code = joinCode.trim().toUpperCase();
    try {
      const res = await fetch(`/api/v1/multiplayer/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          playerName: joinName.trim() || "Operative",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to join alliance room");
      }

      sessionStorage.setItem(`alliance_${code}_player`, data.playerId);
      router.push(`/alliance/${code}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error joining room");
      setIsJoining(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#12100E] text-[#FAF7F2] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden select-none">
      {/* Background Illustrated Scene */}
      <div className="absolute inset-0">
        <Image
          src="/art/backgrounds/alliance_lobby.jpg"
          alt="Alliance War Room"
          fill
          priority
          className="object-cover object-center brightness-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/70 to-[#12100E]/40" />
      </div>

      {/* Top Header */}
      <header className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center max-w-5xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/10 transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9E6B68]">
            Multiplayer Mode
          </span>
          <div className="font-serif font-bold text-xs text-[#DDD4C5]">
            2–4 Operatives
          </div>
        </div>
      </header>

      {/* Main War Room Card */}
      <div className="relative z-10 w-full max-w-4xl bg-[#1C1917]/90 backdrop-blur-xl border border-[#453D35] rounded-3xl p-6 md:p-10 shadow-2xl mt-12 mb-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="relative w-16 h-16 rounded-full border border-zinc-600 overflow-hidden shadow-lg">
              <Image
                src="/brand/logo-header.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A2420] border border-[#545E4E]/40 text-[#52B788] text-xs font-mono font-bold uppercase tracking-widest mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Cooperative Illustrated Campaign</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#FAF7F2]">
            THE LAST ALLIANCE
          </h1>
          <p className="font-serif text-sm md:text-base text-[#A8A199] max-w-xl mx-auto mt-2 leading-relaxed">
            Eight synchronized trials where individual failure resets the entire team.
            Conclude at the skyscraper bridge with the ultimate Prisoner&apos;s Dilemma.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs font-serif text-center">
            {errorMsg}
          </div>
        )}

        {/* Dual Actions: Create or Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Alliance Room */}
          <form
            onSubmit={handleCreateRoom}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#FAF7F2] mb-1">
                <Shield className="w-4 h-4 text-[#52B788]" />
                <span>Found a New Alliance</span>
              </div>
              <p className="text-xs font-serif text-[#8A8178] mb-4">
                You will host the session and receive an alliance room code to share with your team.
              </p>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A199] mb-1.5">
                Your Operative Call-sign
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav, Commander"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-[#453D35] text-[#FAF7F2] font-sans text-sm focus:outline-none focus:border-[#52B788] mb-4"
              />

              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A199] mb-1.5">
                Starting Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setInitialDifficulty(d)}
                    className={`py-1.5 rounded-lg border font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                      initialDifficulty === d
                        ? "bg-[#9E2A2B] border-[#9E2A2B] text-white shadow"
                        : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 rounded-xl bg-[#545E4E] hover:bg-[#636E5C] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isCreating ? "Establishing..." : "Create Alliance Room →"}
            </button>
          </form>

          {/* Join Alliance Room */}
          <form
            onSubmit={handleJoinRoom}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#FAF7F2] mb-1">
                <Users className="w-4 h-4 text-[#9E6B68]" />
                <span>Join Existing Alliance</span>
              </div>
              <p className="text-xs font-serif text-[#8A8178] mb-4">
                Enter the 6-character room code provided by your alliance host.
              </p>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A199] mb-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AL4921"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-[#453D35] text-[#FAF7F2] font-mono uppercase text-sm tracking-widest focus:outline-none focus:border-[#9E6B68]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A199] mb-1.5">
                    Your Call-sign
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aanya, Scout"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-[#453D35] text-[#FAF7F2] font-sans text-sm focus:outline-none focus:border-[#9E6B68]"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3 rounded-xl bg-[#2A2420] hover:bg-[#3B322C] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 border border-white/15 transition-all shadow-md disabled:opacity-50"
            >
              {isJoining ? "Entering..." : "Join Alliance Chamber →"}
            </button>
          </form>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="p-3 bg-black/30 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono uppercase text-[#8A8178]">L1: Sudoku</span>
            <span className="text-xs font-serif font-bold text-[#DDD4C5]">The First Lock</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono uppercase text-[#8A8178]">L2: Chess</span>
            <span className="text-xs font-serif font-bold text-[#DDD4C5]">Count Vesper</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono uppercase text-[#8A8178]">L4: Deduction</span>
            <span className="text-xs font-serif font-bold text-[#DDD4C5]">The Imposter</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono uppercase text-[#8A8178]">L8: Climax</span>
            <span className="text-xs font-serif font-bold text-[#DDD4C5]">The Final Betrayal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
