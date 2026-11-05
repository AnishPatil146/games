# THE UNWRITTEN — Alliance Cooperative 6×6 Sudoku Specification

**Document Version:** 1.0.0  
**System Target:** Synchronous 2–4 Player Cooperative Gameplay  
**Architecture:** Server-Authoritative Shared Board State with Real-Time Polling & Optimistic Updates

---

## 1. COOPERATIVE DESIGN PRINCIPLES

Alliance Multiplayer rejects isolated competitive play. Operatives solve **one unified, synchronized puzzle together**:
- **Single Shared Board:** Every connected player views and operates upon the same 6×6 board.
- **Cooperative Synergy:** Player A placing a correct digit at $R_1C_3$ immediately updates Player B, C, and D's boards.
- **Presence Cursors:** Each operative's active cell focus is visually indicated with their avatar's distinctive tactical color.
- **Server Authority:** All moves are verified against the server-side solution before locking into the permanent board state. Answer keys are strictly redacted from client payloads until completion.

---

## 2. 6×6 SUDOKU GEOMETRY & RULES

1. **Grid Matrix:** 6 rows $\times$ 6 columns = 36 total cells.
2. **Allowed Digits:** $\{1, 2, 3, 4, 5, 6\}$.
3. **Row Constraint:** Each row must contain digits $1$ through $6$ exactly once.
4. **Column Constraint:** Each column must contain digits $1$ through $6$ exactly once.
5. **Subgrid (Box) Constraint:** The grid is partitioned into 6 distinct $2 \times 3$ subgrids ($2\text{ rows} \times 3\text{ columns}$):
   - Box 0: Rows 0–1, Cols 0–2
   - Box 1: Rows 0–1, Cols 3–5
   - Box 2: Rows 2–3, Cols 0–2
   - Box 3: Rows 2–3, Cols 3–5
   - Box 4: Rows 4–5, Cols 0–2
   - Box 5: Rows 4–5, Cols 3–5
6. **Immutable Clues:** Cells generated as starting clues cannot be modified, deleted, or overwritten by any player.

---

## 3. SHARED HINT ECONOMY

- **Quota:** Exactly 5 tactical hints per round shared by the entire squad.
- **Pedagogical Guidance:** When requested, the engine computes:
  1. *Naked Single Search:* Explains why a specific cell has only one possible candidate due to intersecting constraints.
  2. *Hidden Single / Elimination:* Pinpoints the target cell and reasoning.
- **Audit Logging:** Every hint consumed logs the requesting player's ID and timestamp to the room telemetry.

---

## 4. CONCURRENCY & CONFLICT RESOLUTION

1. **Optimistic Placement:** When a player clicks/types a number, their local UI reflects the change immediately.
2. **Server Acknowledgment:** The client dispatches `POST /api/v1/multiplayer/rooms/{code}` with action `sudoku_move`.
3. **Rejection Rollback:** If the cell is an immutable clue or conflicting concurrent write, the server responds with `{ success: false, error }`, and the client automatically rolls back to the authoritative state with a clear feedback banner.

