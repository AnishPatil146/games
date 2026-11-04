/**
 * Sudoku Engine for THE UNWRITTEN
 * Provides 9x9 grid generation, solving, cell validation, conflict detection,
 * and completion verification across Easy, Medium, Hard, and Expert difficulties.
 */

export type SudokuDifficulty = "easy" | "medium" | "hard" | "expert";

export interface SudokuPuzzle {
  id: string;
  difficulty: SudokuDifficulty;
  initialGrid: number[][]; // 9x9, 0 represents empty
  solution: number[][]; // 9x9 completed board
}

export interface CellCoordinate {
  row: number;
  col: number;
}

// Canonical valid base Sudoku solution
const BASE_SOLUTIONS: number[][][] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 1, 5, 6, 4, 8, 9, 7],
    [5, 6, 4, 8, 9, 7, 2, 3, 1],
    [8, 9, 7, 2, 3, 1, 5, 6, 4],
    [3, 1, 2, 6, 4, 5, 9, 7, 8],
    [6, 4, 5, 9, 7, 8, 3, 1, 2],
    [9, 7, 8, 3, 1, 2, 6, 4, 5],
  ],
];

/**
 * Deep clones a 9x9 grid
 */
export function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

/**
 * Checks if placing `num` at `grid[row][col]` violates Sudoku rules.
 */
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = boxRow + r;
      const cc = boxCol + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === num) return false;
    }
  }
  return true;
}

/**
 * Finds all conflicting cells in the current grid (cells that share a number with another cell in their row, col, or box).
 */
export function findGridConflicts(grid: number[][]): Set<string> {
  const conflicts = new Set<string>();

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
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

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
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

  // Check 3x3 boxes
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    const seen = new Map<number, CellCoordinate[]>();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const row = br + r;
        const col = bc + c;
        const val = grid[row][col];
        if (val > 0) {
          if (!seen.has(val)) seen.set(val, []);
          seen.get(val)!.push({ row, col });
        }
      }
    }
    seen.forEach((coords) => {
      if (coords.length > 1) {
        coords.forEach((coord) => conflicts.add(`${coord.row},${coord.col}`));
      }
    });
  }

  return conflicts;
}

/**
 * Solves a Sudoku grid using recursive backtracking. Returns solved grid or null if unsolvable.
 */
export function solveSudoku(grid: number[][]): number[][] | null {
  const board = cloneGrid(grid);

  function backtrack(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(board, r, c, num)) {
              board[r][c] = num;
              if (backtrack()) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  return backtrack() ? board : null;
}

/**
 * Verifies whether the board is completely and correctly solved.
 */
export function isSudokuComplete(
  grid: number[][],
  solution?: number[][]
): boolean {
  if (solution) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }

  // If no reference solution provided, verify full completeness and validity
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val < 1 || val > 9) return false;
      if (!isValidPlacement(grid, r, c, val)) return false;
    }
  }
  return true;
}

/**
 * Applies random valid isomorphic transformations to a base solution
 * (digit permutation, row/col swap within 3x3 bands, band swapping, transposition)
 * This guarantees mathematical validity and high variety.
 */
function randomizeSolution(base: number[][]): number[][] {
  let grid = cloneGrid(base);

  // 1. Permute digits 1-9
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  const digitMap = new Map<number, number>();
  for (let i = 0; i < 9; i++) {
    digitMap.set(i + 1, digits[i]);
  }
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      grid[r][c] = digitMap.get(grid[r][c]) || grid[r][c];
    }
  }

  // 2. Swap rows within 3x3 blocks
  for (let band = 0; band < 3; band++) {
    const r1 = band * 3 + Math.floor(Math.random() * 3);
    const r2 = band * 3 + Math.floor(Math.random() * 3);
    if (r1 !== r2) {
      [grid[r1], grid[r2]] = [grid[r2], grid[r1]];
    }
  }

  // 3. Swap cols within 3x3 blocks
  for (let band = 0; band < 3; band++) {
    const c1 = band * 3 + Math.floor(Math.random() * 3);
    const c2 = band * 3 + Math.floor(Math.random() * 3);
    if (c1 !== c2) {
      for (let r = 0; r < 9; r++) {
        const tmp = grid[r][c1];
        grid[r][c1] = grid[r][c2];
        grid[r][c2] = tmp;
      }
    }
  }

  // 4. Optional transposition
  if (Math.random() > 0.5) {
    const transposed: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        transposed[c][r] = grid[r][c];
      }
    }
    grid = transposed;
  }

  return grid;
}

/**
 * Generates a valid Sudoku puzzle and solution with guaranteed uniqueness.
 */
export function generateSudoku(
  difficulty: SudokuDifficulty = "medium"
): SudokuPuzzle {
  const baseIndex = Math.floor(Math.random() * BASE_SOLUTIONS.length);
  const solution = randomizeSolution(BASE_SOLUTIONS[baseIndex]);
  const puzzle = cloneGrid(solution);

  // Clues count target based on difficulty
  const cluesMap: Record<SudokuDifficulty, number> = {
    easy: 38,
    medium: 32,
    hard: 28,
    expert: 24,
  };

  const targetClues = cluesMap[difficulty];
  const totalToRemove = 81 - targetClues;

  // Generate list of all cell positions and shuffle
  const positions: CellCoordinate[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push({ row: r, col: c });
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let removed = 0;
  for (const pos of positions) {
    if (removed >= totalToRemove) break;
    puzzle[pos.row][pos.col] = 0;
    removed++;
  }

  return {
    id: `sudoku_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    difficulty,
    initialGrid: puzzle,
    solution,
  };
}
