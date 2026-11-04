"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  generateSudoku,
  isSudokuComplete,
  findGridConflicts,
  cloneGrid,
  type SudokuDifficulty,
  type SudokuPuzzle,
} from "@/lib/gameplay/sudoku-engine";
import {
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  Edit3,
  Trash2,
  Trophy,
  Play,
  Flame,
  ShieldAlert,
} from "lucide-react";

interface SudokuBoardProps {
  difficulty?: SudokuDifficulty;
  customPuzzle?: SudokuPuzzle;
  onComplete?: (stats: { timeSeconds: number; hintsUsed: number }) => void;
  onExit?: () => void;
  title?: string;
  subtitle?: string;
}

export function SudokuBoard({
  difficulty = "medium",
  customPuzzle,
  onComplete,
  onExit,
  title = "THE ARCHIVE CIPHER",
  subtitle = "Decode the 9x9 mechanical matrix to disable the containment lock.",
}: SudokuBoardProps) {
  const [puzzle] = useState<SudokuPuzzle>(() => {
    return customPuzzle || generateSudoku(difficulty);
  });

  const [currentGrid, setCurrentGrid] = useState<number[][]>(() =>
    cloneGrid(puzzle.initialGrid)
  );

  // Notes: map of "r,c" => Set of numbers 1-9
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [noteMode, setNoteMode] = useState<boolean>(false);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 0,
  });

  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    status: "idle" | "error" | "incomplete" | "success";
    message: string;
  }>({ status: "idle", message: "" });

  // Timer tick
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Compute conflicts
  const conflicts = useMemo(() => findGridConflicts(currentGrid), [currentGrid]);

  // Handle cell number input
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isCompleted) return;
      const { row, col } = selectedCell;

      // Don't allow modifying initial puzzle clues
      if (puzzle.initialGrid[row][col] !== 0) return;

      const cellKey = `${row},${col}`;

      if (noteMode) {
        // Toggle note
        setNotes((prev) => {
          const currentNotes = prev[cellKey] || [];
          const exists = currentNotes.includes(num);
          const updated = exists
            ? currentNotes.filter((n) => n !== num)
            : [...currentNotes, num].sort();
          return { ...prev, [cellKey]: updated };
        });
      } else {
        // Direct value input
        setCurrentGrid((prev) => {
          const next = cloneGrid(prev);
          next[row][col] = next[row][col] === num ? 0 : num;
          return next;
        });

        // Clear notes for this cell upon writing a value
        setNotes((prev) => {
          const copy = { ...prev };
          delete copy[cellKey];
          return copy;
        });

        setVerificationFeedback({ status: "idle", message: "" });
      }
    },
    [selectedCell, isCompleted, puzzle.initialGrid, noteMode]
  );

  // Clear current cell
  const handleClearCell = useCallback(() => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    if (puzzle.initialGrid[row][col] !== 0) return;

    setCurrentGrid((prev) => {
      const next = cloneGrid(prev);
      next[row][col] = 0;
      return next;
    });

    const cellKey = `${row},${col}`;
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[cellKey];
      return copy;
    });
  }, [selectedCell, isCompleted, puzzle.initialGrid]);

  // Reset board
  const handleReset = useCallback(() => {
    setCurrentGrid(cloneGrid(puzzle.initialGrid));
    setNotes({});
    setVerificationFeedback({ status: "idle", message: "" });
  }, [puzzle.initialGrid]);

  // Hint: reveals one empty or incorrect cell
  const handleHint = useCallback(() => {
    if (isCompleted) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.initialGrid[r][c] === 0 && currentGrid[r][c] !== puzzle.solution[r][c]) {
          setCurrentGrid((prev) => {
            const next = cloneGrid(prev);
            next[r][c] = puzzle.solution[r][c];
            return next;
          });
          setSelectedCell({ row: r, col: c });
          setHintsUsed((h) => h + 1);
          return;
        }
      }
    }
  }, [isCompleted, puzzle, currentGrid]);

  // Verify solution
  const handleVerify = useCallback(() => {
    // Check if any empty cells
    let hasEmpty = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          hasEmpty = true;
          break;
        }
      }
      if (hasEmpty) break;
    }

    if (hasEmpty) {
      setVerificationFeedback({
        status: "incomplete",
        message: "The matrix has empty cells. Every cell must be deciphered.",
      });
      return;
    }

    if (conflicts.size > 0) {
      setVerificationFeedback({
        status: "error",
        message: "Duplicate symbols detected! Check the highlighted crimson conflicts.",
      });
      return;
    }

    const valid = isSudokuComplete(currentGrid, puzzle.solution);
    if (valid) {
      setIsCompleted(true);
      setVerificationFeedback({
        status: "success",
        message: "Matrix deciphered successfully! Vault lock disengaged.",
      });
      if (onComplete) {
        onComplete({ timeSeconds: timerSeconds, hintsUsed });
      }
    } else {
      setVerificationFeedback({
        status: "error",
        message: "Incorrect configuration. Review your row, column, and box constraints.",
      });
    }
  }, [currentGrid, puzzle.solution, conflicts, onComplete, timerSeconds, hintsUsed]);

  // Keyboard navigation & entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.key >= "1" && e.key <= "9") {
        handleInputNumber(parseInt(e.key, 10));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleClearCell();
        return;
      }

      if (e.key.toLowerCase() === "n") {
        setNoteMode((prev) => !prev);
        return;
      }

      if (selectedCell) {
        let { row, col } = selectedCell;
        if (e.key === "ArrowUp") row = Math.max(0, row - 1);
        else if (e.key === "ArrowDown") row = Math.min(8, row + 1);
        else if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
        else if (e.key === "ArrowRight") col = Math.min(8, col + 1);
        setSelectedCell({ row, col });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, handleInputNumber, handleClearCell, isCompleted]);

  const selectedValue =
    selectedCell ? currentGrid[selectedCell.row][selectedCell.col] : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 md:p-6 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-100 font-sans">
      {/* Header bar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-serif tracking-wider text-amber-100 font-bold">
              {title}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono uppercase bg-amber-950/60 border border-amber-800/60 text-amber-400 rounded-md">
              {puzzle.difficulty}
            </span>
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500">TIME:</span>
            <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
          </div>
          {hintsUsed > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Hints: {hintsUsed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid & Controls container */}
      <div className="flex flex-col lg:flex-row items-center gap-6 w-full justify-center">
        {/* 9x9 Sudoku Grid */}
        <div className="relative p-2 bg-zinc-900/90 border-2 border-zinc-700 rounded-xl shadow-2xl">
          <div className="grid grid-cols-9 gap-[1px] bg-zinc-800 border border-zinc-700">
            {currentGrid.map((rowArr, r) =>
              rowArr.map((val, c) => {
                const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                const isSameRowOrCol =
                  selectedCell &&
                  (selectedCell.row === r ||
                    selectedCell.col === c ||
                    (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                      Math.floor(selectedCell.col / 3) === Math.floor(c / 3)));
                const isSameNumber = selectedValue > 0 && val === selectedValue;
                const isInitial = puzzle.initialGrid[r][c] !== 0;
                const isConflict = conflicts.has(`${r},${c}`);
                const cellNotes = notes[`${r},${c}`] || [];

                // 3x3 block borders
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-zinc-600" : "";
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-zinc-600" : "";

                let cellBg = "bg-zinc-950";
                if (isConflict) cellBg = "bg-red-950/80 text-red-200";
                else if (isSelected) cellBg = "bg-amber-600/30 text-amber-200 ring-2 ring-amber-400";
                else if (isSameNumber) cellBg = "bg-amber-900/40 text-amber-200";
                else if (isSameRowOrCol) cellBg = "bg-zinc-900";

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => setSelectedCell({ row: r, col: c })}
                    className={`relative w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center select-none cursor-pointer transition-colors ${cellBg} ${borderBottom} ${borderRight}`}
                  >
                    {val > 0 ? (
                      <span
                        className={`text-base sm:text-lg md:text-xl font-mono font-bold ${
                          isInitial
                            ? "text-zinc-100"
                            : isConflict
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {val}
                      </span>
                    ) : (
                      // Render 3x3 notes mini-grid
                      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 text-[8px] sm:text-[9px] text-zinc-400 font-mono leading-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <div
                            key={n}
                            className="flex items-center justify-center"
                          >
                            {cellNotes.includes(n) ? n : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Action Panel & Keypad */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          {/* Feedback banner */}
          {verificationFeedback.status !== "idle" && (
            <div
              className={`w-full p-3 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 ${
                verificationFeedback.status === "success"
                  ? "bg-emerald-950/80 border border-emerald-700 text-emerald-300"
                  : verificationFeedback.status === "error"
                  ? "bg-red-950/80 border border-red-700 text-red-300"
                  : "bg-amber-950/80 border border-amber-700 text-amber-300"
              }`}
            >
              {verificationFeedback.status === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <span>{verificationFeedback.message}</span>
            </div>
          )}

          {/* Mode Toggles */}
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => setNoteMode((prev) => !prev)}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                noteMode
                  ? "bg-amber-600 text-black border-amber-400 shadow-md shadow-amber-600/30 font-bold"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>PENCIL NOTES {noteMode ? "(ON)" : "(OFF)"}</span>
            </button>

            <button
              type="button"
              onClick={handleClearCell}
              className="py-2 px-3 rounded-lg border bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1"
              title="Erase cell"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ERASE</span>
            </button>
          </div>

          {/* On-screen 1-9 Number Pad */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleInputNumber(num)}
                className="h-11 bg-zinc-900/90 border border-zinc-700 hover:border-amber-500 hover:bg-zinc-800 active:scale-95 text-lg font-mono font-bold text-amber-300 rounded-lg shadow-sm transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Utility buttons */}
          <div className="flex items-center justify-between w-full gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleHint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Clue Hint</span>
            </button>
          </div>

          {/* Verification CTA */}
          <button
            type="button"
            onClick={handleVerify}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold font-mono tracking-wider text-sm rounded-xl shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <span>DISENGAGE LOCK (VERIFY)</span>
          </button>
        </div>
      </div>

      {/* Completion Overlay Banner */}
      {isCompleted && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
          <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 mb-2">
            CHIPHER CRACKED
          </h3>
          <p className="text-zinc-300 text-sm max-w-md mb-6">
            The mechanical pins align with a resounding click. The heavy iron door swings inward into the abyss.
          </p>
          <div className="flex items-center gap-6 text-sm font-mono text-zinc-400 mb-6 bg-zinc-900/90 px-6 py-2 rounded-xl border border-zinc-800">
            <div>
              TIME: <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
            </div>
            <div>
              HINTS: <span className="text-amber-400 font-bold">{hintsUsed}</span>
            </div>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>PROCEED TO NEXT CHAMBER</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
