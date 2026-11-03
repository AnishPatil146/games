# THE UNWRITTEN

> *"An experiment in human curiosity."*

**THE UNWRITTEN** (`https://thegameunwritten.vercel.app/`) is a dual-mode interactive narrative and academic exploration platform built with Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, Zod, and Supabase PostgreSQL + Auth.

The platform houses two independent public experiences sharing unified session governance, database infrastructure, telemetry, and a private administrator control centre:

1. **Senior Mode (`/play`)** — An editorial interactive narrative across six core chapters (`The Last Train`, `The Locked Room`, `The Unknown Message`, `The Empty Canvas`, `The Final Ten Seconds`, `The Unknown World`), an optional **Seventh Door** reflective chamber (`/play/7`), a discoverable **Hidden Letter**, a visual **Choice Map**, and a personal monograph report (`/result/[sessionId]`).
2. **Junior Mode — Class 11 (`/junior`)** — An art-directed academic exploration engine aligned with **Maharashtra State Board (MSBSHSE / FYJC Class 11)** across **Science**, **Commerce**, and **Arts** (`14` subjects, `1,400` reviewed MCQs — `100` per subject at an exact `30 Easy / 40 Medium / 30 Hard` calibration), featuring server-side non-repeating `10`-question cycles, bespoke monochrome SVG diagrams, deterministic versioned scoring (`jr-v1.0.0`), stream-specific ability indicators, and descriptive game profiles.
3. **Private Administrator Control Centre (`THE UNWRITTEN / CONTROL`, `/admin`)** — Participant-centric operational hierarchy (`Directory -> Participant Profile -> Modes Played -> Mode-Specific Dashboard -> Individual Attempt Details`), academic stream/subject & question bank studio (with review-gated publishing and RFC-4180 CSV/JSON import/export), cross-mode analytics, and audit logs, restricted strictly to the authorized administrator via Supabase Auth + server-side allowlist + PostgreSQL Row-Level Security.

---

## Route Architecture

### Public Platform
| Route | Description |
|---|---|
| `/` | Editorial platform threshold introducing **THE UNWRITTEN**, **Senior Mode**, and **Junior Mode — Class 11** |
| `/play` | Senior Mode foyer: silhouette preference (`HIM`, `HER`, `Unspecified`), optional consented signature, anonymous mode, and run resumption |
| `/play/1` .. `/play/6` | Six core interactive narrative chapters with bespoke artwork, audio/signal puzzles, brass cipher (`0745`), vector canvas, and 10-second chronometer |
| `/play/7` | **Optional Chamber: The Seventh Door** — Post-journey reflective threshold & discoverable Hidden Letter |
| `/result/[sessionId]` | Token-protected Senior Mode personal monograph + interactive SVG Choice Map |
| `/junior` | Junior Mode Class 11 atelier: optional consented student signature, stream selector (`Science`, `Commerce`, `Arts`), subject catalogue, cycle progress, and Guided Study toggle |
| `/junior/attempt/[attemptId]` | Token-verified 10-question academic chamber with randomized stems/options, monochrome SVG diagrams, keyboard shortcuts (`1-4` / `A-D` / arrows), flag-for-review, and submit confirmation |
| `/junior/result/[attemptId]` | Deterministic Junior Mode dossier: academic marks (`/10`), chapter breakdown, stream ability indicators (`>= 2` mapped-question evidence floor), game profile, and 10-question explanation review |
| `/privacy` | Data governance disclosure & interactive Personal-Data Deletion Request form |

### Private Control Centre (`THE UNWRITTEN / CONTROL`)
| Route | Description |
|---|---|
| `/admin/login` | Supabase Auth email + password gate (no public signup) |
| `/admin/dashboard` | Unified platform KPIs across Senior & Junior modes, recent runs, and storage health (`/admin` redirects here) |
| `/admin/participants` | **Participant Directory** — Searchable, filterable (`all` / `senior` / `junior` / `both`), sortable directory of participants |
| `/admin/participants/[playerId]` | **Participant Profile** — Identity summary, Modes Played cards, cross-mode timeline, and direct mode drill-down |
| `/admin/participants/[playerId]/junior` | **Participant Junior Dashboard** — Cumulative Class 11 marks, subject cycle exhaustion bars, aggregated stream ability indicators, and attempt history |
| `/admin/participants/[playerId]/junior/attempts/[attemptId]` | **Junior Attempt Inspector** — Exact 10-question snapshot (`questionVersion`, shuffled option order, selected vs. correct key, time spent, flags, explanations) |
| `/admin/participants/[playerId]/senior` | **Participant Senior Dashboard** — Multi-session switcher, chapter progress, clues, puzzles, Seventh Door / Hidden Letter trace, preferences, and monograph |
| `/admin/senior` | Senior Mode operational overview & direct session links |
| `/admin/junior` | Junior Mode Class 11 operational overview, stream distribution, and question bank summary |
| `/admin/subjects` | Academic board/year/stream/subject & elective configuration manager |
| `/admin/questions` | Question Bank Studio (`1,400` MCQs): filter, create/edit with live preview, review-gated publish/unpublish, and CSV/JSON import & export |
| `/admin/attempts` | Cross-stream Junior attempt log with status/stream/subject filters |
| `/admin/sessions` & `/admin/sessions/[id]` | Senior session registry & chronological `gameplay_events` inspector |
| `/admin/analytics` | Unified Senior + Junior empirical analytics (chapter drop-off, subject accuracy, hardest questions, ability bands) |
| `/admin/settings` | Administrator session controls, RLS/environment diagnostics, deletion requests queue, and administrative audit log |

### Versioned REST API (`/api/v1/*`)
- **Public**: `/api/v1/public/modes`, `/api/v1/public/academic/streams`, `/api/v1/public/academic/subjects`, `/api/v1/sessions`, `/api/v1/sessions/[id]`, `/api/v1/junior/attempts`, `/api/v1/junior/attempts/[id]`, `/api/v1/junior/attempts/[id]/submit`, `/api/v1/junior/results/[id]`, `/api/v1/junior/history/reset`
- **Admin (`verifyAdminAccess()`)**: `/api/v1/admin/dashboard`, `/api/v1/admin/participants`, `/api/v1/admin/participants/[id]`, `/api/v1/admin/attempts`, `/api/v1/admin/analytics`, `/api/v1/admin/subjects`, `/api/v1/admin/questions`, `/api/v1/admin/questions/[id]`, `/api/v1/admin/questions/[id]/publish`

---

## Database & Security Setup (Supabase)

### 1. Apply SQL Schema & Migrations
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor** -> **New query**.
2. Execute [`supabase/schema.sql`](./supabase/schema.sql) (or apply migrations in `supabase/migrations/20261103000001_master_schema_and_rls.sql` followed by `supabase/migrations/20261103000002_platform_senior_junior_control.sql`).
3. This idempotently provisions all Senior & Junior tables (`players`, `game_sessions`, `gameplay_events`, `player_preferences`, `deletion_requests`, `academic_boards`, `academic_years`, `streams`, `subjects`, `chapters`, `question_bank`, `question_options`, `question_tags`, `participant_subject_cycles`, `participant_question_history`, `junior_attempts`, `junior_attempt_items`, `junior_results`, `ability_profiles`, `admin_audit_logs`), foreign-key indexes, token-verified RPCs, and strict PostgreSQL Row-Level Security restricting direct table reads/writes to `service_role` or the allowlisted curator JWT (`anishpatil146@gmail.com`).

### 2. Provision the Single Administrator Account
1. In **Supabase Dashboard -> Authentication -> Users**, create/confirm the single administrator user `anishpatil146@gmail.com` with a strong password.
2. No public signup route exists; any non-allowlisted account receives `403 Forbidden`.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development (never commit `.env.local`):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key

# Server-only privileged key for admin & platform persistence (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Comma-separated list of authorized administrator emails
ADMIN_EMAILS=anishpatil146@gmail.com
```

---

## Local Development & Verification

```bash
npm run dev
```

Automated verification & production build:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

---

## Academic & Interpretive Disclaimers

- **Curriculum Alignment**: Junior Mode Class 11 content is aligned with the Maharashtra State Board (MSBSHSE / FYJC Class 11) syllabus structure for educational practice and is not affiliated with or endorsed by MSBSHSE or Balbharati.
- **Descriptive Indicators Only**: Neither Senior Mode monographs nor Junior Mode ability indicators / game profiles measure IQ, clinical personality, mental health, or definitive career suitability, and response speed is never equated with intelligence.
