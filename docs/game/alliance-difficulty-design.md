# THE UNWRITTEN — Alliance 6×6 Sudoku Difficulty Design

**Document Version:** 1.0.0  
**Status:** Canonical Difficulty Specification  

---

## 1. DIFFICULTY TIERS

| Tier | Clue Range | Deduction Mechanics Required | Target Time | Primary Audience |
| :--- | :--- | :--- | :--- | :--- |
| **EASY** | 18–20 clues | Direct naked singles; immediately evident row/column exclusions | 60–90 seconds | Tactical training, casual pairs |
| **MEDIUM** | 14–16 clues | Cross-box elimination; combining row, col, and $2 \times 3$ box deductions | 90–150 seconds | Standard co-op squads |
| **HARD** | 10–12 clues | Advanced constraint chaining; candidate elimination without guessing | 150–240 seconds | Veteran puzzle solvers |

---

## 2. GENERATION & UNIQUENESS GUARANTEE

The 6×6 Sudoku generator (`src/lib/gameplay/sudoku-6x6-engine.ts`) guarantees:
1. **Valid Seed Generation:** Uses randomized isomorphic transformations (symbol permutations, band-row swaps, and column swaps) applied to pre-verified canonical Latin matrices.
2. **Backtracking Removal with Uniqueness Check:** For each cell candidate to be removed:
   ```ts
   puzzle[r][c] = 0;
   if (countSolutions6x6(puzzle, 2) === 1) {
     // Removal verified: puzzle still has exactly ONE unique solution
     currentClues--;
   } else {
     // Revert removal: multiple solutions detected
     puzzle[r][c] = backup;
   }
   ```
3. **No Guessing / Bifurcation:** Even at the Hard difficulty tier, the puzzle is guaranteed to be deterministically solvable through logic.

---

## 3. LOBBY SELECTION WORKFLOW

1. The host selects the difficulty in the War Room lobby before initiating deployment.
2. The selection is synchronized to all connected peers via real-time polling.
3. Once the campaign is initiated (`status = "in_progress"`), the difficulty locks and cannot be modified until the chamber concludes.

