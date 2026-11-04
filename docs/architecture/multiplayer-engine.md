# THE UNWRITTEN — MULTIPLAYER WAR ROOM ARCHITECTURE

**Standard:** Server-Authoritative Progression, Synchronized Deadlines & Prisoner's Dilemma Matrix  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Core Architecture

The multiplayer campaign, **THE LAST ALLIANCE**, connects 2 to 4 players per room via an authoritative room coordinator:

- **Room Code:** 6-character cryptographic code (e.g., `A9Z4B1`).
- **Endpoint:** `/api/v1/multiplayer/rooms/[code]`.
- **Submission Endpoint:** `/api/v1/multiplayer/rooms/[code]/submit`.
- **Synchronization Model:** Short-polling (1.6s interval) with optimistic local render and server reconciliation.

```
Operative A (Player 1)           Operative B (Player 2)
      |                                |
  [Solves Sudoku]               [Solves Chess]
      |                                |
      v                                v
POST /api/v1/.../submit          POST /api/v1/.../submit
      \                                /
       +--------------+---------------+
                      |
                      v
          [MultiplayerRoomCoordinator]
          - Validates individual puzzles
          - Updates player `currentLevelSolved = true`
          - Checks room completion condition:
            ALL required players solved && now <= roundDeadline
                      |
            +---------+---------+
            |                   |
            v                   v
      [All Solved]         [Player Failed / Timeout]
      - Advances Level     - Resets Chamber
      - Broadcasts State   - Forces Team Retry
```

---

## 2. Shared Deadlines and Team Retries

- **Authoritative Timestamp:** The server records `roundStartTimestamp` and `roundDeadline`. Client-side countdown timers are strictly cosmetic displays.
- **Strict All-or-Nothing Rule:** If Player 1 finishes in 30 seconds but Player 2 fails or times out, the chamber is locked. The server triggers a team retry, returning all players to the start of the current chamber.
- **Race Condition Protection:** Mutex locks and atomic transactions prevent double-scoring and multiple level-advance triggers.

---

## 3. The Prisoner's Dilemma Matrix (Level 8: Final Betrayal)

In Level 8, all operatives face the simultaneous Cooperate/Betray matrix:

| Player 1 | Player 2 | Outcome | Narrative Result |
|---|---|---|---|
| Cooperate | Cooperate | Win-Win (+500 / +500) | **The Shared Ascension** — The briefcase is opened together. |
| Cooperate | Betray | Loser-Winner (0 / +1000) | **The Solitary Betrayal** — Traitor flees with the briefcase. |
| Betray | Cooperate | Winner-Loser (+1000 / 0) | **The Solitary Betrayal** — Traitor flees with the briefcase. |
| Betray | Betray | Lose-Lose (0 / 0) | **The Void of Greed** — Case triggers self-destruct; drops into the abyss. |

Decisions are submitted to private server vaults and remain encrypted until all room members have locked in their votes.

