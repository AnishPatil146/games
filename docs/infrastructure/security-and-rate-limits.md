# THE UNWRITTEN — API SECURITY, RATE LIMITS & ABUSE PROTECTION

**Document:** `docs/infrastructure/security-and-rate-limits.md`  
**Purpose:** Specification of multi-layer rate limiting, origin verification, input sanitization, and administrative boundary defenses.

---

## 1. Multi-Tier Rate Limiting Architecture

THE UNWRITTEN enforces rate limiting at three distinct levels:

```
[Incoming Request]
       │
       ▼
[Tier 1: Global Edge Rate Limiter (Per IP Address)]
       ├─► Exceeds 120 req / 60s ──► 429 Too Many Requests
       │
       ▼
[Tier 2: Authenticated / Session Rate Limiter (Per Player Token)]
       ├─► Exceeds 60 req / 60s ──► 429 Too Many Requests
       │
       ▼
[Tier 3: In-Room Action Rate Limiter (Per Room Code & Cell)]
       ├─► Exceeds 10 moves / 5s ──► 429 Rate Limit on Cell Action
       │
       ▼
[Authoritative Execution Pipeline]
```

### 1.1 Action Limit Policies

| Endpoint Category | Window | Max Requests | Exceeded Penalty | Target Abuse Vector |
|---|---|---|---|---|
| **Curator Login** (`/api/admin/login`) | 60s | 5 attempts | 60s lock + retry-after | Credential brute-force |
| **Admin Recovery** (`/api/admin/recover`) | 60s | 3 attempts | 120s lock | Secret guessing attacks |
| **Room Creation** (`/api/v1/multiplayer/rooms`) | 60s | 6 rooms | 60s cooldown | Room exhaustion attacks |
| **Sudoku Move** (`/api/v1/multiplayer/rooms/[code]`) | 5s | 15 moves | 5s action freeze | Rapid brute-force solvers |
| **Hint Request** (`/api/v1/multiplayer/rooms/[code]`) | 10s | 1 hint | Enforced cooldown | Hint pool draining |
| **Public Question API** (`/api/v1/public/*`) | 60s | 180 requests | 30s pause | Scrapers & denial of service |

---

## 2. Request Sanitization & Size Constraints

1. **Payload Size Guard:** All incoming POST/PUT bodies are capped at **64 KB** for game actions and **128 KB** for dossier profiles. Any payload exceeding these limits is immediately rejected with `413 Payload Too Large` before JSON parsing begins.
2. **Schema Validation:** Strict runtime validation using Zod for all request schemas. Unknown or extra keys are automatically stripped.
3. **Room Code Sanitization:** Strict regex sanitization: `^AL[1-9][0-9]{3}$`. Lowercase characters are automatically normalized to uppercase.
4. **Origin & WebSocket Headers:** Validates `Origin` and `Host` against allowed domain allowlist (`thegameunwritten.vercel.app`, `localhost:3000`). Disallows untrusted cross-origin POST requests.

---

## 3. Data Confidentiality & Zero Cross-Player Leakage

1. **Solution Redaction:** The Sudoku solution grid is stored exclusively server-side. The `solution` array is removed from all client JSON responses until the room status reaches `level_completed`.
2. **Private Dossier Isolation:** A player can only inspect their own personal dossier or completed monograph unless holding the verified 8-character claim key.
3. **Secret Isolation:** Zero secrets are embedded into client JavaScript bundles. Secrets (`ADMIN_RECOVERY_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`) are accessible exclusively to server-side Node.js environments.

