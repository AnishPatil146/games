# THE UNWRITTEN — SUDOKU ENGINE ARCHITECTURE

**Standard:** Mathematical Validity, Unique Solutions, Real-Time Conflict Highlighting & Pencil Notes  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Mathematical Guarantee

The Sudoku Engine (`src/lib/gameplay/sudoku-engine.ts`) guarantees that every generated puzzle:
1. Has **exactly one unique solution**.
2. Is solvable using logical deduction.
3. Adheres strictly to the 9x9 Latin square constraints across all 9 rows, 9 columns, and 9 non-overlapping 3x3 blocks.

### Generation & Transformation Pipeline
- **Base Canonical Grids:** Seeded with valid Latin squares.
- **Randomized Isomorphic Transformations:**
  - Random digit permutations (1-9).
  - Row permutations within 3x3 horizontal bands.
  - Column permutations within 3x3 vertical bands.
  - Horizontal/vertical band permutations.
  - Matrix transposition.
- **Controlled Clue Removal:**
  - Easy: ~38 clues remaining.
  - Medium: ~32 clues remaining.
  - Hard: ~28 clues remaining.
  - Expert: ~24 clues remaining.

---

## 2. Interactive Features (`src/components/gameplay/SudokuBoard.tsx`)

- **Visual Highlighting:** Selected cell, active row, active column, active 3x3 block, and matching numbers across the board.
- **Real-Time Conflict Detection:** Cells violating row/col/box rules are highlighted in crimson glow.
- **Pencil Notes (Draft Mode):** Toggle notes mode with `N` key or button; renders 3x3 mini-grid of candidate numbers inside the cell.
- **Dual Input Support:**
  - Physical keyboard: `1-9` for numbers/notes, `Backspace`/`Delete` to clear, arrow keys for navigation.
  - On-screen keypad: Touch-friendly 1-9 buttons, Erase, Notes toggle, Reset, Clue Hint.
- **Authoritative Verification:** "Disengage Lock (Verify)" button runs full board validation against the reference solution and rules before emitting the `onComplete` callback.
