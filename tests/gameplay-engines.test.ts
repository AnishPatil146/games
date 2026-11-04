import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSudoku,
  solveSudoku,
  isSudokuComplete,
  findGridConflicts,
} from "../src/lib/gameplay/sudoku-engine";
import {
  ChessService,
  COUNT_VESPER_PUZZLES,
} from "../src/lib/gameplay/chess-service";

describe("THE UNWRITTEN — Gameplay Engines Test Suite", () => {
  test("1. Sudoku Engine: Generates valid puzzles with solvable solutions", () => {
    const puzzle = generateSudoku("easy");
    assert.ok(puzzle.id, "Puzzle must have a unique ID");
    assert.equal(puzzle.difficulty, "easy");
    assert.equal(puzzle.initialGrid.length, 9);
    assert.equal(puzzle.solution.length, 9);

    // Verify initial clues are subset of solution
    let cluesCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.initialGrid[r][c] !== 0) {
          cluesCount++;
          assert.equal(
            puzzle.initialGrid[r][c],
            puzzle.solution[r][c],
            `Clue at (${r},${c}) must match solution`
          );
        }
      }
    }
    assert.ok(cluesCount >= 30, `Easy puzzle should have >= 30 clues, got ${cluesCount}`);

    // Verify the solution is 100% valid
    const isComplete = isSudokuComplete(puzzle.solution);
    assert.ok(isComplete, "Generated solution must be a complete valid Sudoku board");
  });

  test("2. Sudoku Engine: Backtracking solver solves incomplete grids", () => {
    const puzzle = generateSudoku("medium");
    const solved = solveSudoku(puzzle.initialGrid);
    assert.ok(solved !== null, "Solver must return a valid solution");
    assert.ok(isSudokuComplete(solved), "Solved grid must be completely valid");
  });

  test("3. Sudoku Engine: Detects duplicate cell conflicts across rows, cols, and 3x3 boxes", () => {
    const puzzle = generateSudoku("easy");
    const testGrid = puzzle.solution.map((row) => [...row]);

    // Introduce duplicate in row 0
    testGrid[0][1] = testGrid[0][0];
    const conflicts = findGridConflicts(testGrid);
    assert.ok(conflicts.has("0,0"), "Must flag (0,0) as conflict");
    assert.ok(conflicts.has("0,1"), "Must flag (0,1) as conflict");
  });

  test("4. Chess Engine: Initializes standard game and parses legal moves", () => {
    const chess = new ChessService();
    assert.equal(chess.getTurn(), "w");
    assert.equal(chess.isCheck(), false);
    assert.equal(chess.isCheckmate(), false);

    // Test e4
    const e2Moves = chess.getLegalMovesForSquare("e2");
    assert.ok(e2Moves.includes("e4"), "Pawn at e2 can move to e4");

    const moveRes = chess.makeMove("e2", "e4");
    assert.ok(moveRes.success, "Move e2-e4 should succeed");
    assert.equal(chess.getTurn(), "b");
  });

  test("5. Chess Engine: Count Vesper's Gambit Mate-in-2 Puzzle Validation", () => {
    const vesperPuzzle = COUNT_VESPER_PUZZLES[0];
    assert.equal(vesperPuzzle.id, "vesper_immortal_mate");

    const chess = new ChessService(vesperPuzzle.initialFen);
    assert.equal(chess.getTurn(), "w", "White to move");

    // Move 1: White sacrifices Knight with Nf6+
    const m1 = chess.makeSanMove("Nf6+");
    assert.ok(m1, "Move 1 (Nf6+) must be legal");
    assert.ok(chess.isCheck(), "Black King must be in check after Nf6+");

    // Opponent forced reply: 1... gxf6
    const m2 = chess.makeSanMove("gxf6");
    assert.ok(m2, "Opponent move (gxf6) must be legal");

    // Move 2: White strikes with Bishop 2. Bxf7#
    const m3 = chess.makeSanMove("Bxf7#");
    assert.ok(m3, "Winning move (Bxf7#) must be legal");
    assert.ok(chess.isCheckmate(), "Must be checkmate after 2. Bxf7#!");
  });
});

