# THE UNWRITTEN

> *"Every choice leaves a trace."*

**THE UNWRITTEN** (`https://thegameunwritten.vercel.app/`) is an editorial interactive narrative experience and behavioral exploration game built with Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, Zod, and Supabase PostgreSQL + Auth.

The application consists of two strictly separated interfaces sharing a single hardened backend:

1. **Public Narrative Experience** — Full-bleed architectural hero composition, optional silhouette & consented signature, six interactive chapters with bespoke scene artwork and puzzle mechanics, deterministic personal monograph report, and transparent data-deletion governance.
2. **Private Administrator Control Centre (`THE UNWRITTEN / CONTROL`)** — Separate authentication gate, layout, and analytical workspace restricted exclusively to the authorized curator via Supabase Auth + server-side allowlist + PostgreSQL Row-Level Security.

---

## Route Architecture

### Public Experience
| Route | Description |
|---|---|
| `/` | Full-screen cinematic threshold, subtle parallax monograph plate, and chapter folio index |
| `/play` | Silhouette preference (`HIM`, `HER`, or `Unspecified`), optional consented player signature, anonymous mode, and resume-run banner |
| `/play/1` | **Chapter 01: The Last Train** — Urgency, observation, and social regard on Platform 4 |
| `/play/2` | **Chapter 02: The Locked Room** — Interactive rotunda clues & four-wheel brass cipher (`0745`) |
| `/play/3` | **Chapter 03: The Unknown Message** — Signal trace, perimeter sweep, and carrier response |
| `/play/4` | **Chapter 04: The Empty Canvas** — Sculptural vector composition, ground tone, and spatial balance |
| `/play/5` | **Chapter 05: The Final Ten Seconds** — Live ten-second chronometer & relational pressure relay |
| `/play/6` | **Chapter 06: The Unknown World** — Four fictional horizons, relic selection, and first-hour act |
| `/result/[sessionId]` | Token-protected personal monograph separating factual telemetry, explicit preferences, and tentative in-story tendencies |
| `/privacy` | Data governance disclosure & interactive Personal-Data Deletion Request form |

### Private Control Centre (`THE UNWRITTEN / CONTROL`)
| Route | Description |
|---|---|
| `/admin/login` | Supabase Auth email + password gate (no public signup) |
| `/admin/dashboard` | Real persisted KPIs, chapter progression/drop-off summary, and storage diagnostics (`/admin` redirects here) |
| `/admin/players` | Searchable, filterable, sortable, paginated directory of consented players |
| `/admin/players/[id]` | Complete player profile, multi-session switcher, chapter progress, clues, puzzles, preferences, and report |
| `/admin/sessions` | Searchable, filterable, paginated table of all registered and anonymous game sessions |
| `/admin/sessions/[id]` | Chronological `gameplay_events` timeline & JSON payload inspector |
| `/admin/analytics` | Empirical chapter engagement/drop-off charts, chapter durations, choice shares, puzzle accuracy, and UTM attribution |
| `/admin/settings` | Curator session controls, RLS/environment health diagnostics, and deletion requests queue |

*(Legacy `/curator/*` URLs automatically redirect to `/admin/*` via `src/proxy.ts`.)*

---

## Database & Security Setup (Supabase)

### 1. Apply the SQL Schema & Row-Level Security
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor** -> **New query**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) (also mirrored in `supabase/migrations/20261103000001_master_schema_and_rls.sql`) and click **Run**.
3. This idempotently provisions:
   - Tables: `players`, `game_sessions`, `gameplay_events`, `player_preferences`, and `deletion_requests`
   - Indexes on foreign keys, timestamps, statuses, event types, and campaign sources
   - Strict RLS blocking anonymous direct `SELECT` enumeration while granting full analytical access to `service_role` or the authenticated curator JWT (`anishpatil146@gmail.com`)
   - Token-verified `SECURITY DEFINER` RPCs (`rpc_upsert_session`, `rpc_submit_profile`, `rpc_record_event`, `rpc_record_preference`, `rpc_get_session_dossier`, `rpc_submit_deletion_request`)

### 2. Provision the Single Administrator Account in Supabase Auth
Passwords are never hardcoded in source code or environment files. Create or manage the curator password directly in Supabase Auth:
1. In your Supabase Dashboard, open **Authentication** -> **Users**.
2. Click **Add user** -> **Create new user**.
3. Enter Email: `anishpatil146@gmail.com`, choose a strong password, enable **Auto Confirm User**, and click **Create user**.
4. In **Authentication** -> **Providers** -> **Email**, ensure **Enable Email provider** is enabled (you may disable public signups if desired; the app exposes no signup UI and rejects all non-allowlisted emails with `403`).

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development (never commit `.env.local`):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key

# Optional recommended server-only key for privileged admin queries (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Comma-separated list of authorized administrator emails
ADMIN_EMAILS=anishpatil146@gmail.com
```

Configure the same variables in **Vercel -> Project Settings -> Environment Variables** before deploying to production.

---

## Local Development & Verification

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
