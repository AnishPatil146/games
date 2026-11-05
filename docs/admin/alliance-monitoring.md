# THE UNWRITTEN — Alliance Monitoring & Command Centre Telemetry

**Document Version:** 1.0.0  
**Scope:** Admin Portal, Live Room Telemetry & Multiplayer Performance Metrics  

---

## 1. RECORDED MULTIPLAYER TELEMETRY

The Command Centre monitors live and historical Alliance rooms across the following metrics:

1. **Room State & Metadata:**
   - Room Code (e.g., `AL8492`)
   - Host ID & Participant Roster (2–4 operatives)
   - Selected Difficulty Tier (Easy / Medium / Hard)
   - Chamber Index (Level 1–8)
   - Created At, Started At, and Completed At timestamps.

2. **6×6 Sudoku Cooperative Metrics:**
   - **Board Fill Rate:** Current valid cells filled vs total (36).
   - **Active Conflicts:** Number of conflicting cells in the live grid.
   - **Shared Hints Consumed:** Hints requested ($0\dots 5$) and requesting operative.
   - **Move History:** Ordered ledger of cell writes, values, and correctness flags.
   - **Individual Contributions:** Total moves, valid placements, and correction edits per player.

3. **Performance & Reliability:**
   - Concurrency collision rejection counts.
   - Reconnection events and state recovery latency.
   - Completion rate by difficulty tier.
   - Average completion duration per chamber.

---

## 2. PRIVACY & SECURITY POLICIES

- Never expose player authentication tokens, IP addresses, or private session cookies in telemetry tables.
- Server-authoritative solution grids are redacted until round completion.
- Telemetry events pipeline into `src/lib/services/event-store.ts` with structured payloads.

