# THE UNWRITTEN — REAL-TIME GAME SERVICE & MULTIPLAYER ISOLATION

**Document:** `docs/infrastructure/realtime-game-service.md`  
**Purpose:** Specification for Room Isolation, Server-Authoritative 6×6 Sudoku Validation, Concurrency Control, and Resilient Reconnection Protocol.

---

## 1. Multiplayer Room Isolation Model

In THE UNWRITTEN, every Alliance Co-op War Room operates as an autonomous, sandboxed game container.

### 1.1 Structural Invariants
1. **Capacity Limit:** Strictly maximum 4 operatives per room (`host`, up to 3 squad members).
2. **Deterministic Code Allocation:** Private 6-character room codes matching `^AL[1-9][0-9]{3}$` (e.g., `AL1042`, `AL7821`).
3. **State Versioning:** Every state mutation increments a monotonic integer `stateVersion`. Clients pass `expectedVersion` when submitting moves. If a concurrent update occurred, the server responds with a version conflict code `409 CONFLICT` along with the latest state snapshot, triggering an automatic client reconciliation without UI flicker.
4. **Failure Sandbox:** If an unhandled exception or malformed payload occurs within room `AL1042`, its blast radius is restricted strictly to that room's context. Global server state, other rooms, and persistent database tables remain untouched.

---

## 2. Server-Authoritative 6×6 Sudoku Validation

To ensure competitive fairness and eliminate client tampering:

```
[Client Action: (r, c, v)] 
       │
       ▼
[Check Request Size & Room Token]
       │
       ▼
[Acquire Cell Lock: lock:room:{code}:cell:{r}:{c}]
       │
       ├─► Failed (Locked by teammate) ──► Return 423 Locked ("Cell occupied by teammate")
       │
       ▼
[Verify Cell Immutability: is initial clue?]
       │
       ├─► Yes ──► Reject ("Given clue cannot be overwritten")
       │
       ▼
[Check Optimistic State Version: stateVersion matches?]
       │
       ├─► Mismatch ──► Return 409 Conflict with fresh board
       │
       ▼
[Execute Move & Validate Rule Consistency (Row, Col, 2x3 Box)]
       │
       ├─► Conflict detected ──► Increment team conflict counter, record error
       ├─► Valid entry ──► Mark cell, update player contribution stats
       │
       ▼
[Check Completion Condition: all 36 cells filled without conflicts?]
       │
       ├─► If Complete ──► Reveal solution, mark room level_completed, persist to DB
       │
       ▼
[Increment stateVersion, Release Lock & Broadcast Update]
```

### 2.1 Atomic Move Rules
- **Initial Clues Are Immutable:** Clues provided by the puzzle generator cannot be modified or cleared by any player.
- **Idempotency Guarantee:** Every move submission includes a client-generated UUID `txId`. If a mobile network retry delivers the exact same `txId`, the server immediately returns the previously calculated result without penalizing the team with double move counts or duplicate conflict penalties.
- **Shared Hint Governance:** Maximum 5 hints per room per round. When requested:
  - System identifies the cell with minimum remaining candidates.
  - Explains the pedagogical deduction rule (e.g. *Naked Single* in $2 \times 3$ box or *Hidden Single* in Row).
  - Deducts 1 hint from `hintsRemaining`.
  - Imposes a 10-second squad hint cooldown to encourage collaborative reasoning.

---

## 3. Reliable Reconnect & Recovery Protocol

Network interruptions, mobile tower handoffs, and accidental browser refreshes must never destroy squad progress.

### 3.1 Cryptographic Reconnection Tokens
When a player creates or joins an Alliance room:
1. The server issues a secure, high-entropy `reconnectToken`:
   $$\text{token} = \text{HMAC-SHA256}(\text{roomCode} \mathbin{\Vert} \text{playerId} \mathbin{\Vert} \text{issuedAt}, \text{SECRET})$$
2. The token is stored in the player's session storage and returned in the join response.
3. The token has a **15-minute grace period** (`TTL = 900s`).

### 3.2 Recovery Flow
When an operative's client reloads or reconnects:
1. Client sends `POST /api/v1/multiplayer/rooms/{code}/reconnect` with `{ playerId, reconnectToken }`.
2. Server verifies:
   - Does room `{code}` exist and is it active?
   - Does `playerId` belong to room `{code}`'s roster?
   - Is `reconnectToken` authentic and not expired?
3. Upon validation:
   - Player's status is toggled from `disconnected` back to `active`.
   - The full, authoritative room snapshot (including board state, remaining hints, timer deadline, and teammates' current cursors) is dispatched to the reconnected player.
   - A `PLAYER_RECONNECTED` notification is broadcast to other squad members.

### 3.3 Heartbeats & Ghost Disconnection Handling
- Every connected client sends a lightweight heartbeat (`ping`) every **15 seconds**.
- If no heartbeat is received from an operative for **45 seconds**, the player is flagged as `inactive`, freeing their cell cursor.
- If the host disconnects, host authority is temporarily held in escrow for 90 seconds. If the host fails to return within 90 seconds, host privileges automatically transfer to the next senior operative in the squad.
