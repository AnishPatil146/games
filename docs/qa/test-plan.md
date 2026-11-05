# Quality Assurance & Test Verification Plan

## 1. Test Automation Architecture
The repository maintains automated test suites in `tests/`:
- `tests/platform.test.ts`: Session lifecycle, anonymous onboarding, profile updates, event telemetry.
- `tests/gameplay-engines.test.ts`:
  - 9x9 Sudoku generation, conflict detection, unique solution solver.
  - 8x8 Chessboard move legality, FEN parsing, Count Vesper mate-in-2 puzzle.
  - Spatial Labyrinth grid collision, mirror traps, exit boundary.
  - 4-digit Keypad code validation and Three-Doors truth table.
- `tests/math-renderer.test.ts`: LaTeX tokenization, Greek symbols, superscripts, radicals, fractions.

## 2. Manual & Regression Test Matrix
| Subsystem | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Solo Campaign** | Level 1: Keypad (`0745`) | Unlocks on correct code; fails and debriefs on wrong code | PASS |
| **Solo Campaign** | Level 2: Three Doors (`WHITE`) | Eliminates paradox, unlocks chamber | PASS |
| **Solo Campaign** | Level 5: Mirror Maze | Spatial 2D navigation to (9,9) avoiding traps | PASS |
| **Solo Campaign** | Character Isolation | Aarav alone; no unexpected partners | PASS |
| **Alliance** | Room Creation | Instant 6-char room code generated | PASS |
| **Alliance** | Chamber 1: Sudoku | 9x9 board with conflict detection & 90s timer | PASS |
| **Alliance** | Chamber 2: Chess | Mate-in-2 (`Nf6+`, `Bxf7#`) against Count Vesper | PASS |
| **Junior Mode** | Class 11 vs 12 | Independent toggling; zero curriculum crosstalk | PASS |
| **Junior Mode** | Math Notation | All formulas render with fraction bars and elevated indices | PASS |
| **Junior Mode** | Non-Repeating Qs | 10 unique questions per attempt across 100-question cycle | PASS |

