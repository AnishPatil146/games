"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChessService,
  COUNT_VESPER_PUZZLES,
  type TacticalPuzzle,
} from "@/lib/gameplay/chess-service";
import type { Square } from "chess.js";
import {
  Crown,
  Trophy,
  RotateCcw,
  Swords,
  Flame,
  ChevronRight,
  Lightbulb,
  LogOut,
} from "lucide-react";
import { ExitConfirmationModal } from "./ExitConfirmationModal";
import { ProgressiveHintsModal } from "./ProgressiveHintsModal";
import { FailureDebriefModal, FailureDebriefData } from "./FailureDebriefModal";

interface ChessBoardProps {
  puzzle?: TacticalPuzzle;
  onComplete?: (stats: { movesTaken: number; timeSeconds: number }) => void;
  onExit?: () => void;
  title?: string;
}

// Crisp SVG pieces for chess glyphs
const PIECE_SYMBOLS: Record<string, string> = {
  // White pieces
  w_k: "♔",
  w_q: "♕",
  w_r: "♖",
  w_b: "♗",
  w_n: "♘",
  w_p: "♙",
  // Black pieces
  b_k: "♚",
  b_q: "♛",
  b_r: "♜",
  b_b: "♝",
  b_n: "♞",
  b_p: "♟",
};

export function ChessBoard({
  puzzle = COUNT_VESPER_PUZZLES[0],
  onComplete,
  onExit,
  title,
}: ChessBoardProps) {
  const [chessService] = useState<ChessService>(
    () => new ChessService(puzzle.initialFen)
  );

  const [fen, setFen] = useState<string>(chessService.getFen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<{
    from?: Square;
    to?: Square;
  }>({});
  const [puzzleStepIndex, setPuzzleStepIndex] = useState<number>(0);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    status: "idle" | "error" | "success" | "thinking";
    message: string;
  }>({
    status: "idle",
    message: puzzle.description,
  });
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isHintsModalOpen, setIsHintsModalOpen] = useState<boolean>(false);
  const [unlockedHintsCount, setUnlockedHintsCount] = useState<number>(0);
  const [failureDebrief, setFailureDebrief] = useState<FailureDebriefData | null>(null);

  // Timer
  useEffect(() => {
    if (isCheckmate || failureDebrief) return;
    const interval = setInterval(() => setTimerSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCheckmate, failureDebrief]);

  const boardMatrix = useMemo(() => {
    if (!fen) return [];
    return chessService.getBoard();
  }, [chessService, fen]);

  // Reset to initial puzzle position
  const handleReset = useCallback(() => {
    if (failureDebrief) return;
    chessService.reset(puzzle.initialFen);
    setFen(chessService.getFen());
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMoveSquares({});
    setPuzzleStepIndex(0);
    setIsCheckmate(false);
    setFeedback({
      status: "idle",
      message: puzzle.description,
    });
  }, [chessService, puzzle, failureDebrief]);

  // Select square and compute legal moves
  const handleSquareClick = useCallback(
    (sq: Square) => {
      if (isCheckmate || feedback.status === "thinking" || failureDebrief) return;

      const currentTurn = chessService.getTurn();
      if (currentTurn !== puzzle.playerColor) return;

      // If clicking already selected square, deselect
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      // If a piece is already selected and we click a legal target: MAKE MOVE
      if (selectedSquare && legalTargets.includes(sq)) {
        const from = selectedSquare;
        const to = sq;

        const moveResult = chessService.makeMove(from, to);
        if (moveResult.success) {
          setFen(chessService.getFen());
          setLastMoveSquares({ from, to });
          setSelectedSquare(null);
          setLegalTargets([]);

          const expectedPlayerMove = puzzle.solutionMoves[puzzleStepIndex];
          const playedSan = moveResult.san;

          // Check if player's move matches expected tactical puzzle move
          if (playedSan === expectedPlayerMove) {
            const nextStep = puzzleStepIndex + 1;
            setPuzzleStepIndex(nextStep);

            // Did this move deliver checkmate?
            if (nextStep >= puzzle.solutionMoves.length || chessService.isCheckmate()) {
              setIsCheckmate(true);
              setFeedback({
                status: "success",
                message: "CHECKMATE! Count Vesper is dethroned.",
              });
              if (onComplete) {
                onComplete({
                  movesTaken: Math.ceil(nextStep / 2),
                  timeSeconds: timerSeconds,
                });
              }
              return;
            }

            // Otherwise, opponent forced response in puzzle sequence
            const opponentExpectedMove = puzzle.solutionMoves[nextStep];
            if (opponentExpectedMove) {
              setFeedback({
                status: "thinking",
                message: `${puzzle.opponent} is reeling from your attack...`,
              });

              setTimeout(() => {
                chessService.makeSanMove(opponentExpectedMove);
                setFen(chessService.getFen());
                setPuzzleStepIndex(nextStep + 1);
                setFeedback({
                  status: "idle",
                  message: `${puzzle.opponent} played ${opponentExpectedMove}. Deliver the final blow!`,
                });
              }, 700);
            }
          } else {
            // Player played an incorrect move (blunder on final submission)
            setFailureDebrief({
              roundTitle: title || puzzle.title,
              submittedAnswer: `Move: ${playedSan || from + "-" + to}`,
              correctAnswer: "1. Nf6+! (forcing 1... gxf6) then 2. Bxf7#",
              failureExplanation: `Playing ${playedSan} allowed Count Vesper's King to escape or gave him tempo to mobilize his Queen on d1. Tactical advantage lost.`,
              correctSolutionExplanation: puzzle.explanation,
            });
          }
        }
        return;
      }

      // Check if clicking on own piece
      const moves = chessService.getLegalMovesForSquare(sq);
      if (moves.length > 0) {
        setSelectedSquare(sq);
        setLegalTargets(moves);
      } else {
        setSelectedSquare(null);
        setLegalTargets([]);
      }
    },
    [
      chessService,
      selectedSquare,
      legalTargets,
      puzzle,
      puzzleStepIndex,
      isCheckmate,
      feedback.status,
      failureDebrief,
      timerSeconds,
      onComplete,
      title,
    ]
  );

  const isCheck = chessService.isCheck();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 md:p-6 bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-xl text-zinc-100 font-sans select-none">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-serif tracking-wider text-amber-100 font-bold">
              {title || puzzle.title}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono uppercase bg-red-950/70 border border-red-800/60 text-red-400 rounded-md">
              VS. {puzzle.opponent}
            </span>
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{puzzle.description}</p>
        </div>

        <div className="flex items-center gap-3 text-sm font-mono">
          {/* 5-Hints Button */}
          <button
            type="button"
            onClick={() => setIsHintsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-600/70 text-amber-300 rounded-lg hover:bg-amber-900/80 transition-colors cursor-pointer text-xs"
            title="Open 5 Progressive Hints"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>HINTS: {5 - unlockedHintsCount} / 5</span>
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <span className="text-zinc-500">TIME:</span>
            <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
          </div>

          {/* Check indicator */}
          {isCheck && !isCheckmate && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-red-950/80 border border-red-700 text-red-400 text-xs font-bold rounded-lg animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>CHECK!</span>
            </div>
          )}

          {/* Exit Button */}
          {onExit && (
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-red-950/60 border border-red-800/70 text-red-300 rounded-lg hover:bg-red-900/80 transition-colors cursor-pointer text-xs"
              title="Exit Investigation"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Board & Status Panel */}
      <div className="flex flex-col lg:flex-row items-center gap-6 w-full justify-center">
        {/* 8x8 Chessboard */}
        <div className="relative p-2 bg-zinc-900/90 border-4 border-amber-950/80 rounded-xl shadow-2xl">
          <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px] border border-amber-900/50">
            {boardMatrix.map((rowArr, rIdx) =>
              rowArr.map((cell, cIdx) => {
                const sq = cell.square;
                const isLight = (rIdx + cIdx) % 2 === 0;
                const isSelected = selectedSquare === sq;
                const isLegalTarget = legalTargets.includes(sq);
                const isLastMove = lastMoveSquares.from === sq || lastMoveSquares.to === sq;
                const piece = cell.piece;
                const pieceKey = piece ? `${piece.color}_${piece.type}` : null;
                const pieceGlyph = pieceKey ? PIECE_SYMBOLS[pieceKey] : null;

                let squareBg = isLight ? "bg-[#d1b894]" : "bg-[#6c4e31]";
                if (isSelected) {
                  squareBg = "bg-amber-400 ring-4 ring-amber-300 ring-inset";
                } else if (isLastMove) {
                  squareBg = isLight ? "bg-[#e2d58b]" : "bg-[#9c8942]";
                }

                return (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => handleSquareClick(sq)}
                    className={`relative w-full h-full flex items-center justify-center select-none transition-colors cursor-pointer ${squareBg}`}
                  >
                    {/* Rank & File coordinate labels */}
                    {cIdx === 0 && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-mono font-bold opacity-60 text-black">
                        {8 - rIdx}
                      </span>
                    )}
                    {rIdx === 7 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold opacity-60 text-black">
                        {String.fromCharCode(97 + cIdx)}
                      </span>
                    )}

                    {/* Legal move dot indicator */}
                    {isLegalTarget && (
                      <span
                        className={`absolute z-10 rounded-full ${
                          piece
                            ? "w-8 h-8 border-4 border-red-500/80 bg-red-500/20"
                            : "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500/90 shadow-md shadow-emerald-500/50 animate-pulse"
                        }`}
                      />
                    )}

                    {/* Chess Piece Glyph */}
                    {pieceGlyph && (
                      <span
                        className={`text-2xl sm:text-4xl md:text-5xl font-serif select-none z-10 transition-transform ${
                          piece?.color === "w"
                            ? "text-zinc-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]"
                            : "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
                        } ${isSelected ? "scale-110" : "hover:scale-105"}`}
                      >
                        {pieceGlyph}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Narrative & Move Controls */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          {/* Dynamic feedback banner */}
          <div
            className={`w-full p-4 rounded-xl text-xs md:text-sm font-medium border ${
              feedback.status === "success"
                ? "bg-emerald-950/80 border-emerald-700 text-emerald-200"
                : feedback.status === "error"
                ? "bg-red-950/90 border-red-700 text-red-300"
                : feedback.status === "thinking"
                ? "bg-amber-950/80 border-amber-700 text-amber-200 animate-pulse"
                : "bg-zinc-900 border-zinc-800 text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold uppercase tracking-wider text-xs">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>{puzzle.opponent}&apos;s Domain</span>
            </div>
            <p>{feedback.message}</p>
          </div>

          {/* Move History / Objective info */}
          <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Tactical Objective
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
              <div className="flex items-center justify-between">
                <span>Player Role:</span>
                <span className="text-amber-400 font-bold">White (Sacrifice Attack)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Required Condition:</span>
                <span className="text-red-400 font-bold">Deliver Checkmate</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Move Progress:</span>
                <span className="text-emerald-400 font-bold">
                  {Math.floor(puzzleStepIndex / 2)} /{" "}
                  {Math.ceil(puzzle.solutionMoves.length / 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Position</span>
            </button>

            <span className="text-[11px] text-zinc-500 font-mono">
              1 Final Attempt
            </span>
          </div>
        </div>
      </div>

      {/* Checkmate Victory Overlay */}
      {isCheckmate && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
          <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 mb-2">
            COUNT VESPER DEFEATED
          </h3>
          <p className="text-zinc-300 text-sm max-w-md mb-6 leading-relaxed">
            Count Vesper clutches his chest as the light-squared bishop strikes with lethal precision.
            &quot;Impossible... you saw through my vanity. The sacrificial knight blinded me.&quot;
          </p>
          <div className="flex items-center gap-6 text-sm font-mono text-zinc-400 mb-6 bg-zinc-900/90 px-6 py-2.5 rounded-xl border border-zinc-800">
            <div>
              TIME: <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
            </div>
            <div>
              HINTS USED: <span className="text-amber-400 font-bold">{unlockedHintsCount} / 5</span>
            </div>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>ADVANCE INTO THE SANCTUM</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      )}

      {/* Failure Debrief Modal (One Final Submission Policy) */}
      {failureDebrief && (
        <FailureDebriefModal
          data={failureDebrief}
          onReturnToStart={() => {
            setFailureDebrief(null);
            if (onExit) onExit();
          }}
          startingScreenName="War Room Lobby"
        />
      )}

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onCancel={() => setIsExitModalOpen(false)}
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          if (onExit) onExit();
        }}
        startingScreenName="War Room Lobby"
      />

      {/* Progressive 5-Hints Modal */}
      <ProgressiveHintsModal
        isOpen={isHintsModalOpen}
        onClose={() => setIsHintsModalOpen(false)}
        roundId="solo_l2"
        unlockedHintsCount={unlockedHintsCount}
        onUnlockNextHint={() =>
          setUnlockedHintsCount((prev) => Math.min(5, prev + 1))
        }
      />
    </div>
  );
}
