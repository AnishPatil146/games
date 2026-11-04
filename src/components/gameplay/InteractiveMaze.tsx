"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Compass,
  Trophy,
  RotateCcw,
  Footprints,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

interface InteractiveMazeProps {
  onComplete: (stats: { steps: number; timeSeconds: number }) => void;
  onExit?: () => void;
}

// 0: empty path, 1: solid wall, 2: mirror trap (teleports back 2 steps), 3: exit door
const MAZE_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1], // 3 at (9, 9) is true exit
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export function InteractiveMaze({ onComplete, onExit }: InteractiveMazeProps) {
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 1, c: 1 });
  const [steps, setSteps] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>(
    "Navigate through the fractured glass corridors. Beware deceptive mirror traps."
  );

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setTimerSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (isCompleted) return;
      setPlayerPos((prev) => {
        const nr = prev.r + dr;
        const nc = prev.c + dc;

        // Boundary & wall check
        if (
          nr < 0 ||
          nr >= MAZE_GRID.length ||
          nc < 0 ||
          nc >= MAZE_GRID[0].length ||
          MAZE_GRID[nr][nc] === 1
        ) {
          return prev;
        }

        // Stepped onto mirror trap
        if (MAZE_GRID[nr][nc] === 2) {
          setFeedback("A shattered mirror glass reflection shifts! You are disoriented.");
          setSteps((s) => s + 3);
          return { r: 1, c: 1 }; // Sent back to start
        }

        // Stepped onto exit
        if (MAZE_GRID[nr][nc] === 3) {
          setIsCompleted(true);
          setSteps((s) => s + 1);
          setFeedback("True passage located! You shatter the illusion.");
          onComplete({ steps: steps + 1, timeSeconds: timerSeconds });
          return { r: nr, c: nc };
        }

        setSteps((s) => s + 1);
        return { r: nr, c: nc };
      });
    },
    [isCompleted, onComplete, steps, timerSeconds]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") movePlayer(-1, 0);
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") movePlayer(1, 0);
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") movePlayer(0, -1);
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") movePlayer(0, 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const handleReset = () => {
    setPlayerPos({ r: 1, c: 1 });
    setSteps(0);
    setIsCompleted(false);
    setFeedback("Position reset to the chamber threshold.");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4 md:p-6 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-100 font-sans">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <h2 className="text-xl md:text-2xl font-serif tracking-wider text-amber-100 font-bold">
              THE REFLECTION LABYRINTH
            </h2>
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{feedback}</p>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Footprints className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">STEPS:</span>
            <span className="text-amber-400 font-bold">{steps}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500">TIME:</span>
            <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Maze Board & D-Pad */}
      <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
        {/* Grid */}
        <div className="relative p-2 bg-zinc-900 border-2 border-zinc-700 rounded-xl shadow-2xl">
          <div className="grid grid-cols-11 grid-rows-11 gap-1 bg-zinc-950 p-2 rounded-lg">
            {MAZE_GRID.map((rowArr, r) =>
              rowArr.map((type, c) => {
                const isPlayer = playerPos.r === r && playerPos.c === c;
                const isExit = type === 3;
                const isMirrorTrap = type === 2;
                const isWall = type === 1;

                // Mirror reflection shadow
                const isReflection =
                  !isPlayer &&
                  playerPos.r === 10 - r &&
                  playerPos.c === 10 - c &&
                  !isWall;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-sm text-xs font-mono select-none transition-colors ${
                      isWall
                        ? "bg-zinc-800 border border-zinc-700 shadow-inner"
                        : isExit
                        ? "bg-emerald-950/80 border-2 border-emerald-500 animate-pulse text-emerald-400"
                        : isMirrorTrap
                        ? "bg-purple-950/40 border border-purple-800/40 text-purple-400"
                        : "bg-zinc-900/60"
                    }`}
                  >
                    {isPlayer ? (
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 border-2 border-white rounded-full shadow-lg shadow-amber-400/80 animate-ping-once" />
                    ) : isReflection ? (
                      <span className="w-3 h-3 bg-purple-500/50 rounded-full blur-[1px] animate-pulse" />
                    ) : isExit ? (
                      <Flame className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* D-Pad controls & reset */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-mono text-zinc-400">DIRECTIONAL OVERRIDE</div>
          <div className="grid grid-cols-3 gap-2 w-36">
            <div />
            <button
              type="button"
              onClick={() => movePlayer(-1, 0)}
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 cursor-pointer shadow-md"
              aria-label="Move Up"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div />

            <button
              type="button"
              onClick={() => movePlayer(0, -1)}
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 cursor-pointer shadow-md"
              aria-label="Move Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(1, 0)}
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 cursor-pointer shadow-md"
              aria-label="Move Down"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 1)}
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 cursor-pointer shadow-md"
              aria-label="Move Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Start</span>
          </button>
        </div>
      </div>

      {/* Victory modal */}
      {isCompleted && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
          <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
          <h3 className="text-2xl font-serif font-bold text-amber-200 mb-2">
            MAZE NAVIGATED
          </h3>
          <p className="text-zinc-300 text-sm max-w-md mb-6">
            The distorted reflections shatter into harmless dust. You cross the threshold into the facility&apos;s primary corridor.
          </p>
          <div className="flex items-center gap-6 text-sm font-mono text-zinc-400 mb-6 bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-800">
            <div>
              STEPS: <span className="text-amber-400 font-bold">{steps}</span>
            </div>
            <div>
              TIME: <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
            </div>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono rounded-lg transition-colors cursor-pointer"
            >
              PROCEED
            </button>
          )}
        </div>
      )}
    </div>
  );
}

