# THE UNWRITTEN — INFRASTRUCTURE COMMAND CENTRE & LIVE OPERATIONS SPECIFICATION

**Document:** `docs/admin/infrastructure-command-centre.md`  
**Location in App:** `https://thegameunwritten.vercel.app/admin/dashboard` & `/admin/settings`  
**Purpose:** Specification for real-time live ops, infrastructure telemetry, health monitoring, and incident response tooling in the Curator Control Centre.

---

## 1. Operational Telemetry Dashboard Structure

The Infrastructure & Operations panel exposes genuine operational telemetry gathered from Node.js process internals, Supabase database ping checks, Redis state health, and active game room counts:

```
┌───────────────────────────────────────────────────────────────────────────┐
│  THE UNWRITTEN / CONTROL / LIVE OPERATIONS & INFRASTRUCTURE               │
├─────────────────┬─────────────────┬───────────────────┬───────────────────┤
│ SYSTEM HEALTH   │ ACTIVE ROOMS    │ DB PING LATENCY   │ PROCESS MEMORY    │
│  ● OPERATIONAL  │   14 Rooms      │   24 ms           │   128 MB RSS      │
│  Degraded: 0    │   42 Players    │   Target: <100ms  │   Heap: 64 MB     │
├─────────────────┴─────────────────┴───────────────────┴───────────────────┤
│ LIVE TELEMETRY TILES:                                                     │
│ - Redis State Engine: HEALTHY (L1 Memory + L2 Distributed Store Connected)│
│ - API p95 Latency: 112 ms | p99 Latency: 198 ms                           │
│ - HTTP Error Rate: 0.00% (Last 15 minutes)                                │
│ - Concurrency Load: 12% of baseline threshold                             │
│ - Reconnect Recovery Success Rate: 100%                                   │
│ - Database Connection Mode: Supavisor Transaction Pool (Port 6543)        │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monitored Telemetry Metrics

| Metric | Source | Warning Threshold | Critical Action |
|---|---|---|---|
| **System Health Status** | Aggregated Circuit Breaker | `DEGRADED` | Investigate failing subsystem in incident log |
| **Active Alliance Rooms** | `getRoomCount()` from State Store | $> 500 \text{ rooms}$ | Notify curator of high traffic surge |
| **Concurrent Players** | Active player roster count | $> 1,500 \text{ players}$ | Auto-enable backpressure pacing |
| **Database Ping Latency** | Direct timestamp roundtrip | $> 250 \text{ ms}$ | Check Supabase connection pool slots |
| **Node.js RSS Memory** | `process.memoryUsage().rss` | $> 512 \text{ MB}$ | Garbage collection review & state purge |
| **Node.js Heap Used** | `process.memoryUsage().heapUsed` | $> 384 \text{ MB}$ | Evict stale in-memory room caches |
| **Rate Limit Drops** | Sliding window reject counter | $> 50 \text{ drops/min}$ | Potential DDoS or scraper attack in progress |
| **Uptime (Seconds)** | `process.uptime()` | $< 60 \text{ s}$ (Recent reboot)| Flag recent cold-start or redeployment |

---

## 3. Incident Timeline & Safe Control Actions

1. **Incident Logging:** Any network timeout, database circuit-breaker trip, or recovery failure is appended to the typed incident queue with timestamp, severity (`INFO`, `WARNING`, `CRITICAL`), and error code.
2. **Circuit Breaker Controls:**
   - **Normal Mode:** Full interactive database writes and real-time state synchronization.
   - **Degraded Mode:** Freezes non-critical logging; prioritizes active 6×6 Sudoku moves; serves academic questions from memory.
   - **Emergency Read-Only:** Disables room creation during severe upstream outages while preserving existing player monographs.
3. **Security Invariant:** Zero credentials, passwords, session secrets, or personal identifiable student data are ever displayed in telemetry feeds or incident summaries.
