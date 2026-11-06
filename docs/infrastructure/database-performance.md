# THE UNWRITTEN — DATABASE PERFORMANCE & PROTECTION SPECIFICATION

**Document:** `docs/infrastructure/database-performance.md`  
**Purpose:** Directives for Supabase PostgreSQL connection pooling, query timeouts, transaction boundaries, indexing strategies, and automated backup governance.

---

## 1. Connection Pool Topology (Supavisor)

Serverless functions instantiate multiple short-lived connections. Without pooling, sudden bursts of 1,000 players can quickly trigger PostgreSQL error `FATAL: remaining connection slots are reserved for non-replication superuser connections`.

### 1.1 Port Separation
- **Port 6543 (Supavisor Transaction Mode):** 
  - Used for all standard read/write queries from Next.js Route Handlers.
  - Releases the PostgreSQL backend connection immediately after each transaction completes.
  - Multiplexes up to 10,000 serverless clients across 20–50 physical PostgreSQL connections.
- **Port 5432 (Session Mode):**
  - Reserved strictly for migrations, schema introspection, and long-running database maintenance scripts.

---

## 2. Query Protection & Circuit Breakers

To guarantee that a slow database query never ties up serverless lambda memory or triggers timeout cascades:

```
[Incoming Database Request]
       │
       ▼
[Circuit Breaker State Check]
       │
       ├─► OPEN (High Failure Rate) ──► Serve Stale Cache or Fallback JSON
       │
       ▼ (CLOSED / HALF-OPEN)
[Execute with Hard Timeout (AbortSignal, 4,000 ms)]
       │
       ├─► Exceeds 4,000 ms ──► Cancel Query, Trip Breaker Threshold
       ├─► Succeeds ──► Reset Breaker Counter, Return Clean Record
```

### 2.1 Indexing Strategy for Hot Paths
1. `sessions.id` — Primary Key (UUID B-Tree).
2. `sessions.claim_key` — Unique Index for instant multi-device monograph transfer (`CREATE UNIQUE INDEX idx_sessions_claim_key ON sessions(claim_key);`).
3. `questions.subject_slug` & `questions.standard` — Composite B-Tree Index for Junior Mode retrieval.
4. `attempts.player_session_id` — Foreign key index with cascade for GDPR/privacy deletion.
5. `multiplayer_history.room_code` — Index for historical room resolution.

---

## 3. High-Frequency Write Shielding

A common failure mode in online puzzle games is writing every cell click or cursor move directly to the database.
- **Policy:** Cell clicks, cursor updates, and intermediate guesses are handled exclusively in **L1 Memory & L2 Redis**.
- **PostgreSQL Commit Boundary:**
  - Round completed (squad successfully solves Level 1–8).
  - Campaign milestone reached (Dilemma Matrix choice locked).
  - Explicit manual save or monograph completion.
  - All write operations are wrapped in transactions and include idempotency keys (`idempotency_key = "room_{code}_level_{lvl}_{txId}"`).

---

## 4. Automated Backup & Disaster Recovery Schedule

| Backup Tier | Mechanism | Frequency | Retention | RPO / RTO Target |
|---|---|---|---|---|
| **Point-in-Time Recovery (PITR)** | PostgreSQL WAL streaming | Continuous (per transaction) | 7 Days | RPO < 1 min, RTO < 15 min |
| **Full Daily Snapshot** | Managed Supabase Storage backup | Once every 24 hours (02:00 UTC) | 30 Days | RPO < 24 hrs, RTO < 30 min |
| **Critical Static Dump** | Encrypted JSON catalogue export | Committed to Git on release | Indefinite | RPO = 0 (Static question bank) |

