# THE UNWRITTEN — GAMEPLAY IMPLEMENTATION PLAN

**Date:** 2026-11-04  
**Project:** THE UNWRITTEN  
**Principle:** NO GAMEPLAY = NO LEVEL COMPLETION. Every level requires genuine, verifiable interaction.

---

## Phase 1: Core Puzzle Engines & Data Structures

### 1.1 Sudoku Engine (`src/lib/gameplay/sudoku-engine.ts`)
- **Data Model:**
  - 9x9 grid representation (`number[][]` or `number[]` of length 81).
  - Cell metadata: `value` (0-9), `initial` (boolean), `notes` (`Set<number>`), `conflicts` (boolean).
- **Core Functions:**
  - `generateSudoku(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): { puzzle: number[][], solution: number[][] }`
  - `solveSudoku(grid: number[][]): number[][] | null` using backtracking algorithm.
  - `hasUniqueSolution(grid: number[][]): boolean`
  - `validateCell(grid: number[][], r: number, c: number): boolean`
  - `findConflicts(grid: number[][]): { row: number, col: number }[]`
  - `isBoardCompleteAndValid(grid: number[][], solution?: number[][]): boolean`

### 1.2 Interactive Sudoku Component (`src/components/gameplay/SudokuBoard.tsx`)
- **UI & UX:**
  - Responsive 9x9 grid with high-contrast borders separating 3x3 boxes.
  - Cell highlighting: active cell, same-row, same-col, same-3x3 block, and matching numbers.
  - Conflict markers (red highlight when duplicates exist in row/column/box).
  - Draft / Pencil Marks mode for candidate note taking.
  - Ergonomic on-screen keypad (1-9, Clear, Note Toggle) + full physical keyboard support (`1-9`, `Backspace`, `Delete`, arrow navigation).
  - "Verify Solution" button that triggers server-side or engine verification.
  - Difficulty selector: Easy, Medium, Hard, Expert with Reset and Hint functionality.

### 1.3 Chess Service & Engine (`src/lib/gameplay/chess-service.ts`)
- **Integration:**
  - Wrap `chess.js` (v1.x) with strict typing.
  - Support FEN initialization, legal move validation, SAN generation, check/checkmate/stalemate detection.
  - Optional integration with `https://chess-api.com/v1` for AI opponent responses and tactical evaluation, falling back gracefully to local chess engine logic.
- **Tactical Puzzle Mode:**
  - Count Vesper's puzzle: White to move, forced checkmate sequence.
  - Step-by-step move verification: player must find the exact tactical moves. Wrong move gives instant blunder feedback with retry option.

### 1.4 Interactive Chessboard Component (`src/components/gameplay/ChessBoard.tsx`)
- **UI & UX:**
  - Dark gothic / cinematic illustrated 8x8 board.
  - Crisp SVG piece glyphs for King, Queen, Rook, Bishop, Knight, Pawn (White and Black).
  - Interactive click-to-select and click-to-move with green legal destination dots.
  - Capture highlights (red), check indicators (amber glow on King).
  - Move history notation panel (e.g. `1. Qh5#`).
  - Victory banner upon checkmate unlocking the level completion callback.

---

## Phase 2: Solo Campaign Interactive Mechanics

### 2.1 Level 1: Investigation & Dial Lock Keypad
- **Hotspots:**
  - Desk: Player clicks to read torn diary page ("Remember the time: 07:45"). Note added to inventory.
  - Clock: Crooked wall clock stopped at 7:45.
  - Heavy Iron Door: Inspecting door opens the 4-digit brass dial lock modal.
- **Dial Lock Component (`src/components/gameplay/DialLockModal.tsx`):**
  - 4 rotating brass cylinders (0-9) or digital tumbler dials.
  - Audio feedback / click haptics.
  - Lock opens only when `0745` is submitted.

### 2.2 Level 2: Three Doors Deduction
- **Logic Mechanics:**
  - Door 1: "A tiger starved for 3 years" -> dead beast, safe to pass!
  - Door 2: "High-voltage electric chair" -> fatal trap.
  - Door 3: "Pool of neurotoxic acid" -> fatal trap.
- **Interactive Component (`src/components/gameplay/ThreeDoorsInspection.tsx`):**
  - Direct clickable doors in the scene with inspection magnifying lens.
  - Player inspects clues on door plaques before committing to their choice.
  - Choosing Door 1 unlocks the pathway; choosing Door 2 or 3 triggers a failure sequence with retry.

### 2.3 Level 3: Forgotten Room Memory Anomaly Finder
- **Observation Mechanics:**
  - Phase 1: 15-second observation of the room layout (or skip when ready).
  - Phase 2: 3 subtle anomalies/shifted objects appear in the room.
  - Player must click all 3 anomaly coordinates to verify memory integrity.

### 2.4 Level 4: Interrogation Contradiction Cross-Examination
- **Mechanics:**
  - Warden gives 3 statements.
  - Player selects the exact statement that contradicts evidence gathered in prior levels.

### 2.5 Level 5: Navigable Mirror Maze (`src/components/gameplay/InteractiveMaze.tsx`)
- **Mechanics:**
  - 2D grid spatial maze with walls, mirror reflections, and real fog-of-war.
  - Player controls Aarav via arrow keys, WASD, or on-screen directional d-pad.
  - Real step counter; finding the true exit door completes the challenge.

### 2.6 Level 6, 7, 8: Ethical Triage, 15s Priority Matrix & Final Truth Synthesis
- **L6:** Energy allocation circuit balancing life-support vs. memory servers.
- **L7:** 15-second real-time triage dispatch matrix requiring rapid logical sorting.
- **L8:** Detective evidence synthesis pinboard connecting collected clues to expose the simulation, with 4 distinct branching endings.

---

## Phase 3: Multiplayer Alliance Integration

- **L1 (First Lock):** Real Sudoku boards assigned to room members.
- **L2 (Count Vesper):** Real tactical chess challenge.
- **L3-L8:** Real synchronized multiplayer mini-games and Prisoner's Dilemma matrix.
- Server-authoritative validation via `/api/v1/multiplayer/rooms/[code]/submit`.

---

## Phase 4: Testing, Verification & Production Deployment

- Automated unit tests for Sudoku and Chess engines.
- Platform integrity test (`npm test`).
- Build verification (`npm run build`).
- Production verification on `https://thegameunwritten.vercel.app/`.
