# THE UNWRITTEN — DISASTER RECOVERY & FAILURE RESILIENCE PLAYBOOK

**Document:** `docs/infrastructure/disaster-recovery.md`  
**Purpose:** Standard Operating Procedures (SOP) for infrastructure failures, failovers, provider outages, rollbacks, and data restoration.

---

## 1. Recovery Objectives Summary

| Incident Class | Maximum Tolerable Downtime (RTO) | Maximum Data Loss Window (RPO) | Primary Failover / Mitigation |
|---|---|---|---|
| **Serverless Lambda Cold-Start Spike** | 0 seconds (Degraded < 500 ms) | 0 seconds | L1 in-memory warm cache + Vercel concurrency autoscale |
| **Redis Outage / Unavailability** | 0 seconds | 0 seconds | Automatic failover to In-Memory L1 Fallback with Event Bus |
| **PostgreSQL Unavailability** | $< 15 \text{ minutes}$ | $< 60 \text{ seconds}$ | Supavisor pooler buffer + fallback to bundled catalogue files |
| **Network Split / Client Disconnect** | User grace: 15 minutes | 0 moves lost | Cryptographic Reconnection Token (`reconnectToken`) |
| **Bad Production Deployment** | $< 2 \text{ minutes}$ | 0 seconds | Instant Vercel CLI / Dashboard Rollback to previous deployment |
| **Database Corruption / Accidental Drop** | $< 30 \text{ minutes}$ | $< 5 \text{ minutes}$ | Supabase Point-in-Time Recovery (PITR) WAL replay |

---

## 2. Failure Mode Playbooks

### 2.1 Playbook A: Redis Service Degradation or Outage
- **Symptoms:** Connection timeouts or `ECONNREFUSED` logged against Redis URL.
- **Automated Response:** The state store wrapper (`src/lib/services/redis-state-store.ts`) catches Redis connection errors and immediately flips the internal circuit breaker to `LOCAL_MEMORY_FALLBACK`.
- **User Impact:** Zero dropped games for active players on the same instance. A banner in the Admin Infrastructure dashboard alerts the curator that distributed coordination is operating in fallback mode.
- **Recovery Procedure:** Once Redis connectivity is re-established, the cache re-synchronizes active rooms upon the next write barrier.

### 2.2 Playbook B: Database Unavailability or Pool Saturation
- **Symptoms:** Database latency rises $> 3,000\text{ ms}$ or returns HTTP 500.
- **Automated Response:**
  - Circuit breaker trips to `OPEN`.
  - Academic Reasoning question requests are served directly from bundled static JSON files (`src/data/curriculum/`).
  - Active multiplayer games continue uninterrupted in Redis/L1 memory. Outcome commits are queued in memory and replayed once the database resumes healthy operation.
- **Recovery Procedure:**
  1. Inspect Supabase dashboard connection metrics.
  2. Terminate idle session-mode connections on port 5432.
  3. Ensure all application traffic routes through Supavisor port 6543.

### 2.3 Playbook C: Sudden Traffic Spike (10,000+ Concurrent Players)
- **Symptoms:** Rapid spike in HTTP 429 rate limit triggers or CPU throttling.
- **Automated Response:**
  - Dynamic backpressure kicks in: non-critical polling intervals are throttled from 1,000 ms to 2,500 ms via server-sent `backpressure: true` response flags.
  - Room creation queues enter controlled pacing (max 100 new rooms/minute).
  - Existing active games are prioritized with dedicated compute resources.
- **Recovery Procedure:** Vercel automatically provisions additional serverless instances across edge nodes.

### 2.4 Playbook D: Instant Deployment Rollback
- If an erroneous commit is pushed to production:
  ```powershell
  # Instant production rollback to previous verified deployment
  npx vercel rollback --yes
  ```
  Vercel Anycast edge routes 100% of incoming traffic back to the prior stable deployment ID in under 15 seconds without rebuilding.
