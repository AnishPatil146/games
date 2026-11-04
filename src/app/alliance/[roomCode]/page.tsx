"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Play,
  Copy,
  Check,
} from "lucide-react";
import { MultiplayerRoom } from "@/lib/services/multiplayer-store";
import { ALLIANCE_CAMPAIGN_SCENES } from "@/lib/campaign/alliance-campaign-data";
import { StoryboardStage } from "@/components/storyboard/StoryboardStage";

interface PageProps {
  params: Promise<{ roomCode: string }>;
}

export default function AllianceRoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const roomCode = resolvedParams.roomCode.toUpperCase();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`alliance_${roomCode}_player`);
    }
    return null;
  });
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Sync saved playerId for this room if changed
  useEffect(() => {
    const saved = sessionStorage.getItem(`alliance_${roomCode}_player`);
    if (saved && saved !== playerId) {
      const timer = setTimeout(() => setPlayerId(saved), 0);
      return () => clearTimeout(timer);
    }
  }, [roomCode, playerId]);

  // Polling loop to sync room state in real-time
  useEffect(() => {
    let isMounted = true;
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/v1/multiplayer/rooms/${roomCode}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/alliance");
          }
          return;
        }
        const data = await res.json();
        if (isMounted && data.success && data.room) {
          setRoom(data.room);
        }
      } catch {
        // Network jitter
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1600);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = async () => {
    if (!playerId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/v1/multiplayer/rooms/${roomCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_ready", playerId }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!playerId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/multiplayer/rooms/${roomCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", hostId: playerId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to start campaign");
      } else if (data.room) {
        setRoom(data.room);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLevelSolveSubmit = async (decisions?: Record<string, unknown>) => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/v1/multiplayer/rooms/${roomCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          payload: {
            betrayalDecision:
              decisions?.alliance_l8 === "DECISION_BETRAY"
                ? "BETRAY"
                : decisions?.alliance_l8 === "DECISION_COOPERATE"
                  ? "COOPERATE"
                  : undefined,
            ...decisions,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } catch {
      // Handled via polling
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[#12100E] text-[#FAF7F2] flex items-center justify-center font-serif text-sm">
        Establishing tactical uplink to Alliance {roomCode}...
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;

  // ---------------------------------------------------------------------------
  // 1. LOBBY STAGE
  // ---------------------------------------------------------------------------
  if (room.status === "lobby") {
    return (
      <div className="relative min-h-screen bg-[#12100E] text-[#FAF7F2] flex flex-col items-center justify-center p-4 md:p-8 select-none">
        <div className="absolute inset-0">
          <Image
            src="/art/backgrounds/alliance_lobby.jpg"
            alt="War Room"
            fill
            className="object-cover object-center brightness-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/75 to-[#12100E]/50" />
        </div>

        <div className="relative z-10 w-full max-w-2xl bg-[#1C1917]/95 border border-[#453D35] rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#9E6B68]">
                Alliance Briefing
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-mono text-xs uppercase tracking-widest border border-white/10"
              >
                <span>Code: {roomCode}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>
            </div>
            <Link
              href="/alliance"
              className="text-xs font-mono uppercase text-[#A8A199] hover:text-white"
            >
              Exit
            </Link>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#FAF7F2] mb-2">
            Operative Deployment Roster
          </h1>
          <p className="font-serif text-xs md:text-sm text-[#A8A199] mb-6">
            Share room code <strong className="text-white">{roomCode}</strong> with your squad. All operatives must mark Ready before deployment.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs font-serif">
              {errorMsg}
            </div>
          )}

          {/* Roster List */}
          <div className="space-y-3 mb-8">
            {room.players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2A2420] border border-[#545E4E] flex items-center justify-center font-mono text-xs font-bold text-[#52B788]">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-sans font-semibold text-sm text-[#FAF7F2] flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isHost && (
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-[#545E4E] text-[#FAF7F2] px-2 py-0.5 rounded">
                          Host
                        </span>
                      )}
                      {p.id === playerId && (
                        <span className="text-[10px] font-mono text-[#8A8178]">
                          (You)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-serif text-[#8A8178] capitalize">
                      Callsign avatar: {p.avatarId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isReady ? (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#8A8178] bg-black/40 px-3 py-1 rounded-full">
                      Waiting...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleToggleReady}
              disabled={isActionLoading}
              className={`flex-1 py-3 rounded-xl font-mono text-xs uppercase tracking-widest font-bold border transition-all ${currentPlayer?.isReady
                  ? "bg-emerald-900/60 border-emerald-600 text-emerald-200 hover:bg-emerald-800/60"
                  : "bg-[#2A2420] border-white/10 text-white hover:bg-[#3B322C]"
                }`}
            >
              {currentPlayer?.isReady ? "Ready ✓" : "Mark as Ready"}
            </button>

            {isHost && (
              <button
                onClick={handleStartCampaign}
                disabled={isActionLoading || room.players.length === 0}
                className="flex-1 py-3 rounded-xl bg-[#545E4E] hover:bg-[#636E5C] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Deploy to Chamber 01 →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. GAME OVER / BETRAYAL RESOLUTION
  // ---------------------------------------------------------------------------
  if (room.status === "game_over") {
    const betrayals = room.players.filter((p) => p.betrayalDecision === "BETRAY");
    const cooperators = room.players.filter((p) => p.betrayalDecision === "COOPERATE");

    let verdictTitle = "The Shared Ascension";
    let verdictDesc =
      "Every operative honored the alliance pact. The declassified archive was transcribed in mutual trust.";
    if (betrayals.length > 0 && cooperators.length > 0) {
      verdictTitle = "The Solitary Betrayal";
      verdictDesc = `${betrayals.map((b) => b.name).join(", ")} seized the briefcase alone. The cooperative operatives were left in the cold rain.`;
    } else if (betrayals.length > 0 && cooperators.length === 0) {
      verdictTitle = "The Void of Greed";
      verdictDesc =
        "All operatives attempted betrayal simultaneously. The briefcase severed from the pedestal and plunged into the abyss.";
    }

    return (
      <div className="min-h-screen bg-[#12100E] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-xl bg-[#1C1917] p-8 md:p-12 rounded-3xl border border-[#453D35] shadow-2xl">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#9E6B68]">
            The Last Alliance • Final Verdict
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mt-3 mb-4 text-[#FAF7F2]">
            {verdictTitle}
          </h1>
          <p className="font-serif text-base text-[#DDD4C5] leading-relaxed mb-8">
            {verdictDesc}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-black/40 rounded-xl border border-white/10 text-left"
              >
                <div className="font-sans font-bold text-xs text-white">
                  {p.name}
                </div>
                <div
                  className={`text-[11px] font-mono mt-1 ${p.betrayalDecision === "BETRAY"
                      ? "text-red-400"
                      : "text-emerald-400"
                    }`}
                >
                  Decision: {p.betrayalDecision || "COOPERATE"}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/alliance"
            className="inline-block px-8 py-3 rounded-full bg-[#FAF7F2] text-[#1C1917] font-sans font-bold text-sm hover:bg-[#E7E0D3] transition-all"
          >
            Return to War Room
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. IN-PROGRESS STORYBOARD CHAMBER
  // ---------------------------------------------------------------------------
  const currentSceneId = `alliance_l${room.currentLevel}`;
  const currentScene =
    ALLIANCE_CAMPAIGN_SCENES[currentSceneId] ||
    ALLIANCE_CAMPAIGN_SCENES.alliance_l1;

  return (
    <div className="relative w-full h-screen">
      {/* Team Progress HUD Floating Pill */}
      <div className="absolute top-16 left-6 z-30 bg-[#1C1917]/90 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:block">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8178] mb-2 flex items-center justify-between">
          <span>Alliance Squad ({room.players.length})</span>
          <span>Chamber {room.currentLevel}/8</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {room.players.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs font-sans">
              <span
                className={`w-2 h-2 rounded-full ${p.currentLevelSolved ? "bg-emerald-400" : "bg-amber-400"
                  }`}
              />
              <span className="text-[#DDD4C5] font-medium">{p.name}</span>
              <span className="text-[10px] font-mono text-[#8A8178] ml-auto">
                {p.currentLevelSolved ? "Solved ✓" : "Solving..."}
              </span>
            </div>
          ))}
        </div>
      </div>

      <StoryboardStage
        scene={currentScene}
        onSceneComplete={handleLevelSolveSubmit}
        onReturnToHub={() => router.push("/alliance")}
        modeTitle={`THE LAST ALLIANCE • [${roomCode}]`}
      />
    </div>
  );
}
