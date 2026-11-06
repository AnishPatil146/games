# THE UNWRITTEN — CURRENT INFRASTRUCTURE & ARCHITECTURAL AUDIT

**Audit Date:** 2026-11-06  
**System:** THE UNWRITTEN (https://thegameunwritten.vercel.app/)  
**Environment:** Next.js 16.4.4 (Turbopack) on Vercel Serverless + Supabase PostgreSQL  
**Audit Purpose:** Comprehensive assessment of current hosting, compute, database, real-time networking, state management, security boundaries, and scalability bottlenecks prior to high-traffic scale-out.

---

## 1. Executive Summary

THE UNWRITTEN is currently deployed on a modern hybrid stack consisting of:
- **Frontend & API Tier:** Next.js 16 (App Router) hosted on **Vercel Serverless** (region `iad1` — Washington D.C., USA).
- **Edge Layer:** Vercel Global Edge Network with Anycast DNS and edge caching for static assets.
- **Primary Database:** **Supabase PostgreSQL** (`scihvelzfnkevkbvdgkm.supabase.co`) with Supabase Auth.
- **Direct Database Access:** `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` configured in production environment.
- **Real-Time Multiplayer:** Server-authoritative Alliance 6×6 Sudoku engine currently orchestrated via Next.js Route Handlers (`/api/v1/multiplayer/rooms/*`) with in-memory state storage.
- **Security & Allowlist:** PBKDF2-SHA512 single-operator credentials, Vercel-managed `ADMIN_RECOVERY_KEY`, Supabase Auth service role client, and rate-limiting wrappers.

While highly productive for development and initial release, this architecture possesses distinct constraints when subjected to sustained multi-thousand player concurrency and high-frequency real-time moves.

---

## 2. Infrastructure Inventory & Component Analysis

### 2.1 Hosting & Compute
- **Provider:** Vercel (Hobby plan linked to `the_game_unwritten`).
- **Runtime:** Node.js 22.18.0 Serverless Lambdas.
- **Build Machine:** 2 vCPU, 8 GB RAM (Washington D.C. `iad1`).
- **Function Execution Model:** Ephemeral stateless lambdas. 
  - *Constraint:* Lambda invocations do not maintain persistent in-memory state across multiple concurrently provisioned instances or regions.
  - *Risk:* Multiple browser sessions connecting to different lambdas will read divergent `activeRooms` Maps if stored purely in local memory.
- **Filesystem:** Read-only root filesystem with a small writable ephemeral `/tmp` partition (512 MB).

### 2.2 Database & Storage (Supabase PostgreSQL)
- **Supabase Host:** `https://scihvelzfnkevkbvdgkm.supabase.co`
- **PostgreSQL Version:** 15.x / 16.x managed PostgreSQL.
- **Connection Modes:**
  - *Direct Connection:* Port 5432 (`POSTGRES_URL_NON_POOLING`), limited to maximum PostgreSQL connections (~60-100 on standard tiers).
  - *Pooled Connection:* Port 6543 (`POSTGRES_PRISMA_URL` via Supavisor connection pooler), allows multiplexing thousands of concurrent client connections in transaction mode.
- **Schema & Tables:**
  - `sessions`: Persistent player dossiers, campaign checkpoints, and psycho-narrative metrics.
  - `questions`: MSBSHSE Class 11 & 12 curriculum question banks (1,400+ curated items).
  - `attempts`: Junior Mode question history, cycle offsets, and answer selections.
  - `admin_audit_logs`: Gated administrative actions and recovery events.
- **Database Connection Risk:** Direct database connections from serverless lambdas can quickly exhaust max connections during sudden traffic surges if unpooled. Supavisor transaction pooler must always be used for API routes.

### 2.3 Real-Time & Multiplayer Architecture
- **Current Alliance Protocol:** HTTP polling / REST endpoints:
  - `GET /api/v1/multiplayer/rooms/[code]` (poll room state and server deadline).
  - `POST /api/v1/multiplayer/rooms/[code]` (`sudoku_move`, `sudoku_cursor`, `toggle_ready`, `start`).
  - `POST /api/v1/multiplayer/rooms` (create room).
- **Strengths:** 
  - Extremely reliable traversal across corporate proxies, school firewalls, and mobile carrier NATs where long-lived WebSockets are often terminated.
  - Zero persistent socket connection leakage on lambda spin-down.
- **Weaknesses:**
  - Polling at 1,000ms from 4 players in 500 active rooms generates 2,000 requests per second to serverless functions.
  - Requires distributed state storage (Redis/Upstash) to guarantee all players in a room see the exact same game state across distributed serverless instances.

### 2.4 State & Cache Management (Redis Availability)
- **Current State:** In-memory `activeRooms` Map in `src/lib/services/multiplayer-store.ts`.
- **Target Scalability Requirement:** Distributed L2 cache using Upstash Redis (HTTP/REST) or managed Redis cluster.
- **Concurrency Danger:** When two players submit moves to the same cell simultaneously:
  - If handled without atomic distributed locks or optimistic sequence checking (`stateVersion`), race conditions can cause state overwrites or duplicate hint deductions.

### 2.5 Asset Delivery & CDN
- **Static Assets:** `public/art/`, `public/brand/`, fonts, and audio are distributed through Vercel's global CDN with immutable cache headers (`max-age=31536000, immutable`).
- **Dynamic Assets:** API responses are configured with `Cache-Control: no-store, must-revalidate` to prevent stale game state.

### 2.6 Security & Authentication
- **Admin Tier:** PBKDF2-SHA512 password hashing (100,000 iterations), HMAC-SHA256 signed session cookie (`the_unwritten_admin_session`), Vercel environment secret `ADMIN_RECOVERY_KEY`, allowlisted email `anishpatil146@gmail.com`.
- **Public Player Tier:** Session-bound cryptographic tokens (`the_unwritten_token`), deterministic 8-character claim keys for multi-device monograph transfer.
- **Rate Limiting:** In-memory sliding window rate-limiter in `src/lib/rate-limit.ts`. Needs distributed Redis backing for multi-instance enforcement.

---

## 3. High-Traffic Bottlenecks & Failure Modes

| Component | Current State | Bottleneck under 10,000 Concurrent Users | Remediation Plan |
|---|---|---|---|
| **Multiplayer State** | Ephemeral process memory `Map` | Instance divergence across lambdas; state loss on cold restarts | Redis-backed distributed store + atomic locks (`SETNX`) + state versioning |
| **Move Validation** | Non-atomic cell assignment | Simultaneous conflicting moves by teammates cause race conditions | Versioned transaction queue (`seqNumber`, `txId`) with optimistic locking |
| **Database Pool** | Direct / hybrid calls | Exhaustion of Supabase max connections during traffic spikes | Strict Supavisor transaction pool (port 6543) + query timeouts + write batching |
| **Reconnection** | Basic room search | Players losing session cookie get locked out of active room | Cryptographic Reconnection Token (`reconnectToken`) with 15-min grace period |
| **Traffic Surges** | Fixed rate limits | 429 errors cascade to dropped games | Backpressure circuit breaker, graceful degradation, and request queueing |
| **Live Ops Visibility** | Standard server logs | No real-time visibility into active rooms, memory, or DB latency | Admin Infrastructure Command Centre with live telemetry & health checks |

---

## 4. Architectural Readiness Verdict

The codebase possesses clean modular abstractions (`sudoku-6x6-engine.ts`, `multiplayer-store.ts`, `platform-store.ts`, `admin-auth-service.ts`) and a verified automated test suite (27 passing tests).

To achieve seamless horizontal scale-out under high traffic without changing the core game mechanics:
1. Wrap multiplayer state in a **Distributed State Store** with Redis compatibility and memory L1 cache.
2. Introduce **optimistic concurrency control (`stateVersion`)** and **idempotent transaction IDs (`txId`)** on moves.
3. Provide **reconnect recovery tokens** so network hiccups or browser refreshes never forfeit game progress.
4. Establish a **Database Performance Layer** with query timeouts, write batching, and circuit breakers.
5. Deploy the **Infrastructure Command Centre** into the Admin Portal for real-time live ops.
