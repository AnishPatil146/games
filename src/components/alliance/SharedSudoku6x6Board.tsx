"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Clock,
  Lightbulb,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Eraser,
  RefreshCw,
  LogOut,
} from "lucide-react";
import {
  MultiplayerRoom,
  SharedSudoku6x6State,
} from "@/lib/services/multiplayer-store";
import { findGridConflicts6x6 } from "@/lib/gameplay/sudoku-6x6-engine";

interface SharedSudoku6x6BoardProps {
  room: MultiplayerRoom;
  playerId: string;
  onRoomUpdate: (updatedRoom: MultiplayerRoom) => void;
  onExit: () => void;
  onAdvanceToNextLevel?: () => void;
}

const AVATAR_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  aarav: { bg: "bg-amber-950/80", border: "border-amber-500/70", text: "text-amber-300", glow: "rgba(245, 158, 11, 0.4)" },
  aanya: { bg: "bg-rose-950/80", border: "border-rose-500/70", text: "text-rose-300", glow: "rgba(244, 63, 94, 0.4)" },
  warden: { bg: "bg-slate-900/80", border: "border-slate-400/70", text: "text-slate-200", glow: "rgba(148, 163, 184, 0.4)" },
  mira: { bg: "bg-emerald-950/80", border: "border-emerald-500/70", text: "text-emerald-300", glow: "rgba(16, 185, 129, 0.4)" },
};

export function SharedSudoku6x6Board({
  room,
  playerId,
  onRoomUpdate,
  onExit,
  onAdvanceToNextLevel,
}: SharedSudoku6x6BoardProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeHintModal, setActiveHintModal] = useState<{
    hintIndex: number;
    explanation: string;
    row: number;
    col: number;
    value: number;
  } | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180);

  const sudokuState: SharedSudoku6x6State | undefined = room.sudokuState;

  // Countdown timer calculation
  useEffect(() => {
    if (!room.serverDeadlineTimestamp) return;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.round((room.serverDeadlineTimestamp! - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room.serverDeadlineTimestamp]);

  // Handle cell selection and broadcast cursor to peers
  const handleSelectCell = useCallback(
    async (row: number, col: number) => {
      setSelectedCell({ row, col });
      setErrorMessage(null);

      // Broadcast cursor presence in background
      try {
        await fetch(`/api/v1/multiplayer/rooms/${room.code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sudoku_cursor",
            playerId,
            row,
            col,
          }),
        });
      } catch {
        // Ignored
      }
    },
    [room.code, playerId]
  );

  // Execute number placement or removal
  const handleInputNumber = useCallback(
    async (val: number) => {
      if (!selectedCell || !sudokuState || isSubmittingMove) return;
      const { row, col } = selectedCell;

      // Given clues are immutable!
      if (sudokuState.initialGrid[row][col] !== 0) {
        setErrorMessage("Given clues are locked and cannot be changed.");
        return;
      }

      setIsSubmittingMove(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/v1/multiplayer/rooms/${room.code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sudoku_move",
            playerId,
            row,
            col,
            value: val,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.error || "Failed to submit move");
        } else if (data.room) {
          onRoomUpdate(data.room);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsSubmittingMove(false);
      }
    },
    [selectedCell, sudokuState, isSubmittingMove, room.code, playerId, onRoomUpdate]
  );

  // Request team hint
  const handleRequestHint = async () => {
    if (!sudokuState || sudokuState.hintsRemaining <= 0 || isRequestingHint) return;
    setIsRequestingHint(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/multiplayer/rooms/${room.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sudoku_hint",
          playerId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Hint request failed");
      } else {
        if (data.hint) {
          setActiveHintModal(data.hint);
          // Auto select hinted cell
          setSelectedCell({ row: data.hint.row, col: data.hint.col });
        }
        if (data.room) {
          onRoomUpdate(data.room);
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to fetch hint");
    } finally {
      setIsRequestingHint(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 1..6
      if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        handleInputNumber(parseInt(e.key, 10));
        return;
      }
      // Clear
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        handleInputNumber(0);
        return;
      }
      // Arrow navigation
      if (selectedCell) {
        let { row, col } = selectedCell;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          row = Math.max(0, row - 1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          row = Math.min(5, row + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          col = Math.max(0, col - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          col = Math.min(5, col + 1);
        }
        if (row !== selectedCell.row || col !== selectedCell.col) {
          handleSelectCell(row, col);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, handleInputNumber, handleSelectCell]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sudokuState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 font-mono text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-[#9E2A2B] mb-3" />
        <span>Initializing Shared 6x6 Sudoku Cryptographic Grid...</span>
      </div>
    );
  }

  // Conflict calculation
  const conflicts = findGridConflicts6x6(sudokuState.currentGrid);

  // Progress metrics
  let filledCells = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (sudokuState.currentGrid[r][c] !== 0) filledCells++;
    }
  }
  const progressPct = Math.round((filledCells / 36) * 100);

  // If completed, show victory results view!
  if (sudokuState.isComplete) {
    return (
      <div className="relative w-full max-w-4xl mx-auto p-4 sm:p-8 select-none">
        <div className="bg-[#12100E]/95 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(158,42,43,0.25)] text-center backdrop-blur-xl">
          {/* Brand Emblem */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full border-2 border-zinc-600 shadow-xl overflow-hidden">
              <Image
                src="/brand/logo-header.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#9E2A2B] font-bold">
            All Quadrants Synchronized · Chamber 01 Resolved
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#FAF7F2] mt-2 mb-3">
            Shared Decryption Complete
          </h1>
          <p className="font-serif text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8">
            The 6×6 subterranean cipher matrix has yielded. Your squad operated with synchronized logic, disengaging the primary vault locking pins under {sudokuState.durationSeconds || 120} seconds.
          </p>

          {/* Results Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Difficulty</span>
              <span className="text-base font-serif font-bold text-amber-300 uppercase">
                {sudokuState.difficulty}
              </span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Completion Time</span>
              <span className="text-base font-mono font-bold text-[#FAF7F2]">
                {Math.floor((sudokuState.durationSeconds || 0) / 60)}m {(sudokuState.durationSeconds || 0) % 60}s
              </span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Hints Consumed</span>
              <span className="text-base font-mono font-bold text-emerald-400">
                {5 - sudokuState.hintsRemaining} / 5
              </span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Moves</span>
              <span className="text-base font-mono font-bold text-zinc-200">
                {sudokuState.moveHistory.length}
              </span>
            </div>
          </div>

          {/* Team Contribution Summary Table */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 max-w-2xl mx-auto mb-8 text-left">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold mb-3">
              Operative Contribution Roster
            </h3>
            <div className="divide-y divide-white/10 text-xs">
              {Object.entries(sudokuState.contributions).map(([pid, c]) => {
                const color = AVATAR_COLORS[c.avatarId] || AVATAR_COLORS.aarav;
                return (
                  <div key={pid} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full ${color.bg} border ${color.border} flex items-center justify-center font-mono text-[10px] font-bold ${color.text}`}>
                        {c.playerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-zinc-200">{c.playerName}</span>
                      {pid === playerId && (
                        <span className="text-[10px] font-mono text-zinc-500">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{c.correctEntries} Correct</span>
                      <span className="text-zinc-400">{c.totalMoves} Moves</span>
                      <span className="text-zinc-500">{c.corrections} Corrections</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {onAdvanceToNextLevel && (
              <button
                onClick={onAdvanceToNextLevel}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#9E2A2B] hover:bg-[#B33031] text-[#FAF7F2] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <span>Advance to Chamber 02: Count Vesper&apos;s Gambit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
            >
              Return to War Room Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto p-3 sm:p-6 select-none flex flex-col items-center">
      {/* 1. TOP MASTHEAD & STATUS BAR */}
      <div className="w-full bg-[#141210]/95 border border-zinc-800/80 rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 mb-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full border border-zinc-600 overflow-hidden shadow-md flex-shrink-0">
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#FAF7F2]">
                THE UNWRITTEN
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                CHAMBER 01
              </span>
            </div>
            <span className="text-[10px] font-serif italic text-zinc-400">
              Cooperative 6×6 Sudoku Lock
            </span>
          </div>
        </div>

        {/* Room Code & Difficulty */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 text-xs font-mono uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
            title="Copy room code"
          >
            <span>{room.code}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
          </button>

          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${sudokuState.difficulty === "easy"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                : sudokuState.difficulty === "medium"
                  ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                  : "bg-rose-950/60 text-rose-300 border-rose-800/50"
              }`}
          >
            {sudokuState.difficulty}
          </span>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 30 ? "text-rose-500 animate-pulse" : "text-[#9E2A2B]"}`} />
            <span className={timeLeft < 30 ? "text-rose-400 font-bold" : ""}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={onExit}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Exit Chamber"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. OPERATIVE TEAM ROSTER STRIP */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {room.players.map((p) => {
          const color = AVATAR_COLORS[p.avatarId] || AVATAR_COLORS.aarav;
          const cursor = sudokuState.playerCursors[p.id];
          const isCurrent = p.id === playerId;

          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${isCurrent
                  ? "bg-[#181513] border-zinc-700 shadow-sm"
                  : "bg-[#12100E]/70 border-zinc-800/60"
                }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className={`w-7 h-7 rounded-full ${color.bg} border ${color.border} flex items-center justify-center font-mono text-xs font-bold ${color.text} flex-shrink-0`}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-200 truncate flex items-center gap-1">
                    <span>{p.name}</span>
                    {p.isHost && (
                      <span className="text-[9px] font-mono uppercase text-[#9E2A2B]">H</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 block truncate">
                    {cursor ? `Cell R${cursor.row + 1}C${cursor.col + 1}` : "Viewing"}
                  </span>
                </div>
              </div>

              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* 3. ERROR BANNER */}
      {errorMessage && (
        <div className="w-full mb-3 p-2.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-200 text-xs font-serif flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. MAIN INTERACTIVE WORKSPACE (6x6 Board + Side Panel) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 6x6 Sudoku Grid */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative p-3 sm:p-5 bg-[#141210]/95 border-2 border-zinc-700/80 rounded-3xl shadow-2xl backdrop-blur-xl">
            {/* The 6x6 Grid */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2">
              {Array.from({ length: 6 }).map((_, r) =>
                Array.from({ length: 6 }).map((_, c) => {
                  const key = `${r},${c}`;
                  const isClue = sudokuState.initialGrid[r][c] !== 0;
                  const currentVal = sudokuState.currentGrid[r][c];
                  const isConflict = conflicts.has(key);
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;

                  // Highlighting row, col, or 2x3 box of selected cell
                  const isRowPeer = selectedCell?.row === r;
                  const isColPeer = selectedCell?.col === c;
                  const isBoxPeer =
                    selectedCell &&
                    Math.floor(selectedCell.row / 2) === Math.floor(r / 2) &&
                    Math.floor(selectedCell.col / 3) === Math.floor(c / 3);
                  const isPeer = isRowPeer || isColPeer || isBoxPeer;

                  // Remote teammate targeting this cell
                  const remoteCursor = Object.values(sudokuState.playerCursors).find(
                    (cur) => cur.row === r && cur.col === c
                  );

                  // 2x3 Subgrid boundary borders
                  // Subgrids are 2 rows tall (border below row 1 and row 3)
                  // and 3 cols wide (border after col 2)
                  const borderBottom = r === 1 || r === 3 ? "border-b-2 sm:border-b-4 border-zinc-400/80" : "";
                  const borderRight = c === 2 ? "border-r-2 sm:border-r-4 border-zinc-400/80" : "";

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectCell(r, c)}
                      className={`relative w-11 h-11 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-serif text-lg sm:text-2xl font-bold transition-all cursor-pointer ${borderBottom} ${borderRight} ${isSelected
                          ? "bg-zinc-800 text-white ring-2 ring-[#9E2A2B] shadow-[0_0_15px_rgba(158,42,43,0.5)] z-20 scale-102"
                          : isConflict
                            ? "bg-rose-950/70 text-rose-300 border border-rose-500/80"
                            : isPeer
                              ? "bg-zinc-900/90 text-zinc-200 border border-white/10"
                              : "bg-black/60 text-zinc-300 border border-white/5 hover:bg-zinc-900/70"
                        } ${isClue ? "font-black text-zinc-100" : "text-emerald-400 font-medium"}`}
                    >
                      {currentVal > 0 ? currentVal : ""}

                      {/* Initial Given Clue Lock Dot */}
                      {isClue && (
                        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-500" />
                      )}

                      {/* Remote Teammate Cursor Marker */}
                      {remoteCursor && (
                        <div
                          className="absolute bottom-1 right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                          style={{
                            backgroundColor:
                              AVATAR_COLORS[remoteCursor.avatarId]?.glow || "rgba(244, 63, 94, 0.6)",
                          }}
                          title={`${remoteCursor.playerName} is focusing here`}
                        >
                          <span className="text-[8px] font-mono font-bold text-white uppercase">
                            {remoteCursor.playerName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Touch/Click Digit Entry Pad */}
            <div className="w-full mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => handleInputNumber(num)}
                  disabled={!selectedCell || (selectedCell && sudokuState.initialGrid[selectedCell.row][selectedCell.col] !== 0)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 disabled:opacity-30 border border-white/10 font-serif font-bold text-base sm:text-lg text-[#FAF7F2] transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  {num}
                </button>
              ))}

              {/* Erase button */}
              <button
                onClick={() => handleInputNumber(0)}
                disabled={!selectedCell || (selectedCell && sudokuState.initialGrid[selectedCell.row][selectedCell.col] !== 0)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 hover:bg-rose-950/60 active:scale-95 disabled:opacity-30 border border-white/10 text-zinc-400 hover:text-rose-300 transition-all shadow-md flex items-center justify-center cursor-pointer"
                title="Erase cell (0 / Backspace)"
              >
                <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Side Tactical Intelligence Panel */}
        <div className="lg:col-span-4 w-full flex flex-col gap-4">
          {/* Decryption Progress Card */}
          <div className="bg-[#141210]/95 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Squad Decryption</span>
              </span>
              <span className="text-[#FAF7F2] font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/5 mb-2">
              <div
                className="h-full bg-gradient-to-r from-zinc-500 via-[#9E2A2B] to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block text-right">
              {filledCells} of 36 Cells Filled ({conflicts.size} Conflicts Active)
            </span>
          </div>

          {/* Shared Tactical Hints Card (5 Team Hints) */}
          <div className="bg-[#141210]/95 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-sm font-bold text-[#FAF7F2]">
                  Shared Tactical Hints
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${i < sudokuState.hintsRemaining
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        : "bg-zinc-800 border border-zinc-700"
                      }`}
                  />
                ))}
              </div>
            </div>

            <p className="font-serif text-xs text-zinc-400 mb-4 leading-relaxed">
              5 tactical deductions shared by the entire squad. Consuming a hint reveals a verified logical constraint without spoiling the full board.
            </p>

            <button
              onClick={handleRequestHint}
              disabled={sudokuState.hintsRemaining <= 0 || isRequestingHint}
              className="w-full py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 disabled:opacity-40 text-amber-200 border border-amber-800/60 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isRequestingHint
                  ? "Computing Logic..."
                  : `Request Team Hint (${sudokuState.hintsRemaining} Left)`}
              </span>
            </button>
          </div>

          {/* Live Action Telemetry Feed */}
          <div className="bg-[#141210]/95 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
                Live Squad Feed
              </h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto text-xs font-mono pr-1">
              {sudokuState.moveHistory.length === 0 ? (
                <div className="py-4 text-center text-zinc-600 text-[11px]">
                  Awaiting squad moves...
                </div>
              ) : (
                sudokuState.moveHistory
                  .slice(-8)
                  .reverse()
                  .map((m, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-zinc-300 truncate max-w-[120px]">
                        {m.playerName}
                      </span>
                      <span className="text-zinc-500">
                        {m.value > 0 ? (
                          <span className="text-emerald-400 font-bold">
                            R{m.row + 1}C{m.col + 1} = {m.value}
                          </span>
                        ) : (
                          <span className="text-zinc-500">cleared R{m.row + 1}C{m.col + 1}</span>
                        )}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TACTICAL HINT DETAIL MODAL */}
      {activeHintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#181513] border border-amber-600/60 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-500/60 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold">
              Tactical Hint #{activeHintModal.hintIndex}
            </span>
            <h3 className="font-serif text-xl font-bold text-[#FAF7F2] mt-1 mb-3">
              Deduction at Row {activeHintModal.row + 1}, Col {activeHintModal.col + 1}
            </h3>
            <p className="font-serif text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
              {activeHintModal.explanation}
            </p>
            <button
              onClick={() => setActiveHintModal(null)}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Acknowledge &amp; Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
