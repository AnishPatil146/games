# THE UNWRITTEN — REDIS & DISTRIBUTED ROOM STATE ARCHITECTURE

**Document:** `docs/infrastructure/redis-and-room-state.md`  
**Purpose:** Architecture for L1/L2 multi-tier caching, distributed mutex locking, presence heartbeats, and database write shields.

---

## 1. Dual-Layer State Management Architecture

To balance ultra-low latency (<5 ms) with multi-instance consistency, THE UNWRITTEN utilizes a two-layer caching topology:

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: In-Memory L1 Cache (Local Node Process)            │
│  - Ultra-fast read access (< 1 ms)                          │
│  - Per-instance lock striping                               │
│  - Short-lived TTL (500 ms) with automatic invalidation     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Cache Miss / Write Barrier
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Tier 2: Distributed L2 Cache (Redis / Upstash REST)         │
│  - Cross-instance room synchronization                      │
│  - Global atomic distributed locks (SETNX)                  │
│  - Player presence and heartbeat registry                   │
│  - Token-bucket sliding rate limits                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Milestone Checkpoint
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Tier 3: Persistent Database (Supabase PostgreSQL)          │
│  - Completed monographs and level outcomes                  │
│  - Never touched for high-frequency move keystrokes         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Key Hierarchy & TTL Schema

All Redis keys in THE UNWRITTEN follow a deterministic namespacing convention:

| Key Pattern | Data Type | TTL | Purpose |
|---|---|---|---|
| `unwritten:room:{code}` | JSON String | 7,200s (2 hrs) | Full serialized room state snapshot (grid, cursors, players) |
| `unwritten:room:{code}:lock:cell:{r}:{c}` | String (Token) | 5s | Distributed mutex preventing simultaneous writes to the same cell |
| `unwritten:presence:{code}:{playerId}` | String (Timestamp) | 45s | Presence marker; expired keys signify disconnected operative |
| `unwritten:reconnect:{token}` | String (Payload) | 900s (15 min) | Fast lookup mapping reconnect token to `{code, playerId}` |
| `unwritten:ratelimit:{ip}:{scope}` | Integer (Counter) | 60s | Sliding window rate limiter counter |
| `unwritten:tx:{txId}` | String (Result) | 300s (5 min) | Idempotency deduplication cache for client transaction IDs |

---

## 3. Distributed Mutex & Concurrency Control

When two players attempt to update the same Sudoku cell at the exact same millisecond:

```typescript
// Acquire atomic lock using SETNX with TTL
const lockKey = `unwritten:room:${code}:lock:cell:${row}:${col}`;
const lockAcquired = await redis.set(lockKey, playerId, { nx: true, ex: 5 });

if (!lockAcquired) {
  return {
    success: false,
    error: "Cell is currently locked by a teammate. Please select another cell.",
    code: "CELL_LOCKED"
  };
}

try {
  // Execute move logic against authoritative grid
  const result = await applyAuthoritativeSudokuMove(room, playerId, row, col, value);
  return result;
} finally {
  // Safe atomic release: verify lock ownership before releasing
  await releaseLockSafe(redis, lockKey, playerId);
}
```

---

## 4. Upstash Redis Integration & Zero-Config Fallback

THE UNWRITTEN supports both native Redis instances and serverless Upstash Redis via REST API:
- **Environment Variables:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or standard `REDIS_URL`).
- **Resilient Fallback Mode:** When Redis environment variables are not supplied (e.g., local developer workstations or offline environments), the system transparently falls back to an enhanced in-memory L1 provider with EventEmitter coordination, ensuring uninterrupted developer workflow with zero code divergence.
