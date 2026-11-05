# THE UNWRITTEN — Gameplay Specification

## 1. Non-Negotiable Core Principle
**NO GAMEPLAY = NO LEVEL COMPLETION.**
Levels in THE UNWRITTEN cannot be advanced simply by clicking "Continue", viewing dialogue, or waiting out an animation. Every chamber requires interactive input validation against a server-authoritative rule engine.

## 2. Universal Failure & Retry Protocol
- **Single Final Submission**: Each puzzle round allows exactly one authoritative final submission attempt.
- **Failure Debrief Modal**:
  - Displays submitted answer vs required correct answer.
  - Explains the exact failure rationale and deductive proof.
  - Re-routes player back to the starting chamber upon failure.
- **5 Progressive Hints**: Available via the top HUD in every chamber. Progressive tiers range from contextual observation (Hint 1) to explicit logic breakdown (Hint 5).
- **Exit Confirmation Modal**: Available in every room via the top HUD, allowing clean return to the starting screen.

## 3. Dedicated Gameplay Engines
1. **Sudoku Engine (`src/lib/gameplay/sudoku-engine.ts`)**:
   - Algorithmic 9x9 grid generator ensuring unique solution.
   - Conflict detector highlighting rows, columns, and 3x3 blocks in crimson glow.
   - Interactive digit pad (1-9) + eraser + pencil notes.
2. **Chess Engine (`src/lib/gameplay/chess-service.ts`)**:
   - `chess.js` engine wrapper for legal move generation and FEN parsing.
   - Count Vesper Mate-in-2 challenge: White to move and mate in 2 (`1. Nf6+! gxf6  2. Bxf7#`).
   - Interactive 8x8 SVG chessboard with green legal move dots and opponent delay.
3. **Interactive Spatial Labyrinth (`src/components/gameplay/InteractiveMaze.tsx`)**:
   - 2D grid spatial navigation with arrow keys and touch controls.
   - Dynamic collision detection, mirror reflection trap tiles, and exit threshold trigger.
4. **Cipher & Keypad Engines**:
   - 4-digit brass keypad cipher (`0745`).
   - Three-Doors logical elimination matrix (Truth, Lie, Indeterminate paradox).
   - Emergency dispatch time-limited power router.

