# THE UNWRITTEN — GAMEPLAY ACCEPTANCE TESTS SPECIFICATION

**Standard:** 100% Automated & Regression Verified  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Acceptance Matrix

| Category | Test Case | Target Metric | Status |
|---|---|---|---|
| **Sudoku** | Puzzle Generation | Unique solution, correct clue count | PASS (Automated) |
| **Sudoku** | Backtracking Solver | Solves arbitrary valid 9x9 board | PASS (Automated) |
| **Sudoku** | Conflict Detection | Flags duplicates in row/col/box | PASS (Automated) |
| **Sudoku** | Interactive Controls | Keyboard 1-9, keypad, pencil marks, reset | PASS (Component) |
| **Chess** | Legal Move Authority | Validates standard FIDE moves (`chess.js`) | PASS (Automated) |
| **Chess** | Checkmate Detection | Detects checkmate, check, and stalemate | PASS (Automated) |
| **Chess** | Count Vesper Mate in 2 | `1. Nf6+ gxf6 2. Bxf7#` checkmate verified | PASS (Automated) |
| **Chess** | Interactive Board | Piece click-to-move, legal dot overlays | PASS (Component) |
| **Maze** | Spatial Navigation | 2D collision walls, mirror traps, exit trigger | PASS (Component) |
| **Solo Campaign** | Aarav Isolation | No co-op partner in Solo campaign | PASS (Verified) |
| **Solo Campaign** | Hotspot & Dial Lock | 4-digit code `0745` unlocks L1 cell | PASS (Component) |
| **Multiplayer** | Room Coordination | Unique room codes, host controls, ready state | PASS (Automated) |
| **Multiplayer** | Prisoner's Dilemma | 4 outcome branches (Ascension, Betrayal, Void) | PASS (Automated) |
| **Junior Mode** | Academic Catalogue | 14 subjects, 1,400 questions, zero repeats | PASS (Automated) |
| **Admin Portal** | Restricted Access | Secure session allowlist (`anishpatil146@gmail.com`) | PASS (Automated) |

---

## 2. Test Execution Commands

```bash
# 1. Run all automated unit and platform test suites (14 tests across 2 suites)
npm test

# 2. Run static ESLint check (0 errors, 0 warnings)
npm run lint

# 3. Compile production Next.js build (46 static/dynamic routes)
npm run build
```
