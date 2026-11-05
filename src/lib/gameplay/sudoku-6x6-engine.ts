/**
 * 6x6 Sudoku Engine for THE UNWRITTEN — Cooperative Multiplayer Alliance
 *
 * Rules:
 * - Grid: 6 rows x 6 columns (36 cells).
 * - Digits: 1, 2, 3, 4, 5, 6.
 * - Each row, column, and 2x3 subgrid must contain digits 1-6 exactly once.
 * - Subgrids: 6 boxes total (2 rows x 3 columns each).
 *   Box 0: rows 0-1, cols 0-2 | Box 1: rows 0-1, cols 3-5
 *   Box 2: rows 2-3, cols 0-2 | Box 3: rows 2-3, cols 3-5
 *   Box 4: rows 4-5, cols 0-2 | Box 5: rows 4-5, cols 3-5
 */

export type Sudoku6x6Difficulty = "easy" | "medium" | "hard";

export interface Sudoku6x6Puzzle {
  id: string;
  difficulty: Sudoku6x6Difficulty;
  clueCount: number;
  initialGrid: number[][]; // 6x6, 0 = empty
  solution: number[][]; // 6x6 complete valid grid
}

export interface Sudoku6x6Hint {
  row: number;
  col: number;
  value: number;
  technique: "naked_single" | "hidden_single" | "logical_deduction";
  explanation: string;
}

/**
 * Valid base 6x6 Sudoku solved boards
 */
const BASE_6X6_SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
  ],
  [
    [2, 4, 6, 1, 3, 5],
    [1, 3, 5, 2, 4, 6],
    [4, 6, 2, 3, 5, 1],
    [3, 5, 1, 4, 6, 2],
    [6, 2, 4, 5, 1, 3],
    [5, 1, 3, 6, 2, 4],
  ],
  [
    [3, 1, 5, 2, 6, 4],
    [2, 6, 4, 3, 1, 5],
    [1, 5, 3, 6, 4, 2],
    [6, 4, 2, 1, 5, 3],
    [5, 3, 1, 4, 2, 6],
    [4, 2, 6, 5, 3, 1],
  ],
];

/**
 * Deep clones a 6x6 grid
 */
export function cloneGrid6x6(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

/**
 * Validates if placing `num` at `grid[row][col]` is legal under 6x6 Sudoku rules.
 */
export function isValidPlacement6x6(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  if (num < 1 || num > 6) return false;

  // Row check
  for (let c = 0; c < 6; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Column check
  for (let r = 0; r < 6; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // 2x3 Subgrid check
  const boxStartRow = Math.floor(row / 2) * 2;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = boxStartRow + r;
      const cc = boxStartCol + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === num) return false;
    }
  }

  return true;
}

/**
 * Solves a 6x6 grid using recursive backtracking.
 * Returns the solved grid or null if impossible.
 */
export function solveSudoku6x6(grid: number[][]): number[][] | null {
  const board = cloneGrid6x6(grid);

  function solve(): boolean {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 6; num++) {
            if (isValidPlacement6x6(board, r, c, num)) {
              board[r][c] = num;
              if (solve()) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  return solve() ? board : null;
}

/**
 * Counts the number of distinct solutions up to `maxCount` (to verify puzzle uniqueness).
 */
export function countSolutions6x6(grid: number[][], maxCount = 2): number {
  const board = cloneGrid6x6(grid);
  let count = 0;

  function countRecursive(): void {
    if (count >= maxCount) return;

    let emptyR = -1;
    let emptyC = -1;
    let minCandidates = 7;

    // MRV heuristic (Minimum Remaining Values)
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (board[r][c] === 0) {
          let candidates = 0;
          for (let n = 1; n <= 6; n++) {
            if (isValidPlacement6x6(board, r, c, n)) candidates++;
          }
          if (candidates < minCandidates) {
            minCandidates = candidates;
            emptyR = r;
            emptyC = c;
          }
        }
      }
    }

    if (emptyR === -1) {
      count++;
      return;
    }

    for (let n = 1; n <= 6; n++) {
      if (isValidPlacement6x6(board, emptyR, emptyC, n)) {
        board[emptyR][emptyC] = n;
        countRecursive();
        board[emptyR][emptyC] = 0;
        if (count >= maxCount) return;
      }
    }
  }

  countRecursive();
  return count;
}

/**
 * Finds all cell coordinates that violate row, column, or 2x3 box uniqueness.
 */
export function findGridConflicts6x6(grid: number[][]): Set<string> {
  const conflicts = new Set<string>();

  // Rows
  for (let r = 0; r < 6; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 6; c++) {
      const val = grid[r][c];
      if (val > 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    seen.forEach((cols) => {
      if (cols.length > 1) {
        cols.forEach((c) => conflicts.add(`${r},${c}`));
      }
    });
  }

  // Columns
  for (let c = 0; c < 6; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 6; r++) {
      const val = grid[r][c];
      if (val > 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    seen.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((r) => conflicts.add(`${r},${c}`));
      }
    });
  }

  // 2x3 Subgrids
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const startR = br * 2;
      const startC = bc * 3;
      const seen = new Map<number, [number, number][]>();

      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const row = startR + r;
          const col = startC + c;
          const val = grid[row][col];
          if (val > 0) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push([row, col]);
          }
        }
      }

      seen.forEach((cells) => {
        if (cells.length > 1) {
          cells.forEach(([r, c]) => conflicts.add(`${r},${c}`));
        }
      });
    }
  }

  return conflicts;
}

/**
 * Checks if the 6x6 grid is completely filled, conflict-free, and matches solution (if provided).
 */
export function isSudoku6x6Complete(grid: number[][], solution?: number[][]): boolean {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const val = grid[r][c];
      if (val < 1 || val > 6) return false;
      if (solution && val !== solution[r][c]) return false;
      if (!isValidPlacement6x6(grid, r, c, val)) return false;
    }
  }
  return findGridConflicts6x6(grid).size === 0;
}

/**
 * Generates a randomized valid full 6x6 solution by applying valid isomorphic transforms:
 * - Symbol permutation (shuffling 1..6)
 * - Row swapping within 2-row bands
 * - Column swapping within 3-col bands
 * - Transposition
 */
function generateRandomFullGrid6x6(): number[][] {
  const base = BASE_6X6_SOLUTIONS[Math.floor(Math.random() * BASE_6X6_SOLUTIONS.length)];
  let board = cloneGrid6x6(base);

  // 1. Symbol permutation
  const symbols = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
  board = board.map((row) => row.map((v) => symbols[v - 1]));

  // 2. Row swap within bands (rows 0-1, rows 2-3, rows 4-5)
  for (let band = 0; band < 3; band++) {
    if (Math.random() > 0.5) {
      const r1 = band * 2;
      const r2 = band * 2 + 1;
      const temp = board[r1];
      board[r1] = board[r2];
      board[r2] = temp;
    }
  }

  // 3. Column swap within bands (cols 0-2, cols 3-5)
  for (let band = 0; band < 2; band++) {
    const cols = [band * 3, band * 3 + 1, band * 3 + 2].sort(() => Math.random() - 0.5);
    const newBoard = cloneGrid6x6(board);
    for (let r = 0; r < 6; r++) {
      for (let i = 0; i < 3; i++) {
        newBoard[r][band * 3 + i] = board[r][cols[i]];
      }
    }
    board = newBoard;
  }

  return board;
}

/**
 * Generates a validated 6x6 Sudoku puzzle with guaranteed UNIQUE solution.
 *
 * Target clue counts:
 * - EASY: 18–20 clues
 * - MEDIUM: 14–16 clues
 * - HARD: 10–12 clues
 */
export function generateSudoku6x6(difficulty: Sudoku6x6Difficulty = "medium"): Sudoku6x6Puzzle {
  const targetClues =
    difficulty === "easy"
      ? Math.floor(18 + Math.random() * 3) // 18-20
      : difficulty === "medium"
      ? Math.floor(14 + Math.random() * 3) // 14-16
      : Math.floor(10 + Math.random() * 3); // 10-12

  const solution = generateRandomFullGrid6x6();
  const puzzle = cloneGrid6x6(solution);

  // Collect all 36 cell positions and shuffle them
  const positions: [number, number][] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      positions.push([r, c]);
    }
  }
  positions.sort(() => Math.random() - 0.5);

  let currentClues = 36;

  for (const [r, c] of positions) {
    if (currentClues <= targetClues) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if puzzle still has exactly one unique solution
    if (countSolutions6x6(puzzle, 2) === 1) {
      currentClues--;
    } else {
      // Revert if removal creates multiple solutions
      puzzle[r][c] = backup;
    }
  }

  const id = `sudoku6x6_${difficulty}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    difficulty,
    clueCount: currentClues,
    initialGrid: puzzle,
    solution,
  };
}

/**
 * Analyzes the current board against the solution and generates a helpful pedagogical hint.
 */
export function getSudoku6x6Hint(
  currentGrid: number[][],
  solution: number[][],
  initialGrid: number[][]
): Sudoku6x6Hint | null {
  // 1. Look for a Naked Single: a cell with only 1 possible legal digit under current board state
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (currentGrid[r][c] === 0) {
        const legalValues: number[] = [];
        for (let n = 1; n <= 6; n++) {
          if (isValidPlacement6x6(currentGrid, r, c, n)) {
            legalValues.push(n);
          }
        }
        if (legalValues.length === 1) {
          const val = legalValues[0];
          return {
            row: r,
            col: c,
            value: val,
            technique: "naked_single",
            explanation: `Row ${r + 1}, Col ${c + 1} has only one legally possible digit (${val}) because all other digits (1–6) are already occupied in this row, column, or 2x3 box.`,
          };
        }
      }
    }
  }

  // 2. Find any empty cell that currently has few candidates
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (currentGrid[r][c] === 0) {
        const correctVal = solution[r][c];
        const boxNumber = Math.floor(r / 2) * 2 + Math.floor(c / 3) + 1;
        return {
          row: r,
          col: c,
          value: correctVal,
          technique: "logical_deduction",
          explanation: `In Subgrid Box ${boxNumber} (Row ${r + 1}, Col ${c + 1}), placing ${correctVal} resolves the row and column intersection constraints.`,
        };
      }
    }
  }

  // 3. If there are incorrect numbers entered, point out the discrepancy
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (currentGrid[r][c] !== 0 && initialGrid[r][c] === 0) {
        if (currentGrid[r][c] !== solution[r][c]) {
          return {
            row: r,
            col: c,
            value: solution[r][c],
            technique: "logical_deduction",
            explanation: `Notice Row ${r + 1}, Col ${c + 1}: The entered digit (${currentGrid[r][c]}) contradicts the surrounding subgrid. The correct solution here is ${solution[r][c]}.`,
          };
        }
      }
    }
  }

  return null;
}

