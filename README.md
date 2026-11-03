# THE UNWRITTEN — Premium Interactive Narrative Game

> *"Every choice leaves a trace. Every story reveals something."*

An elegant, mobile-first interactive narrative fiction experience designed for visitors arriving from Instagram Story links. Players journey through six distinct narrative chapters, make decisions, investigate mysteries, solve puzzles, explore fictional environments, and receive a deterministic, shareable personal gameplay dossier.

---

## Architecture & Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS v4 with bespoke Apple/editorial design tokens
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth + Server-side Allowlist for Admin access
- **State & Motion:** Framer Motion for subtle transitions, native Canvas Confetti
- **Validation:** Zod schemas for all client and server payloads
- **Icons:** Lucide React

---

## Key Routes

| Route | Purpose |
|---|---|
| `/` | Landing page with editorial tagline, core pillars, and entrance CTA |
| `/play` | Character presentation preference & voluntary player profile |
| `/play/1` | **Chapter 01: The Last Train** (Social responsibility & urgency) |
| `/play/2` | **Chapter 02: The Locked Room** (Environmental clue deduction & cipher) |
| `/play/3` | **Chapter 03: The Unknown Message** (Curiosity & uncertainty response) |
| `/play/4` | **Chapter 04: The Empty Canvas** (Creative composition & aesthetic preference) |
| `/play/5` | **Chapter 05: The Final Ten Seconds** (Timed logic challenge & composure) |
| `/play/6` | **Chapter 06: The Unknown World** (Immersive sanctuary exploration) |
| `/result/[sessionId]` | Deterministic Personal Dossier & Screenshot-ready share card |
| `/privacy` | Methodological and ethical disclosure (zero covert tracking) |
| `/curator/login` | Secure administrator / curator access portal |
| `/curator` | Live database telemetry, KPIs, chapter drop-off funnel, puzzle stats |
| `/curator/players` | Complete player directory (registered & anonymous sessions) |
| `/curator/players/[id]` | Deep chronological event timeline, choices, & puzzle precision |

---

## Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your credentials:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key

# Server-Only Supabase Service Role Key (Keep secret)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Administrator Email Allowlist (comma-separated)
ADMIN_EMAILS=admin@theunwritten.game,owner@theunwritten.game
```

---

## Supabase Database Installation

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **New query**.
3. Open `supabase/schema.sql` from this repository.
4. Paste and execute the SQL query.
5. The script creates:
   - `players` (Voluntary profile records)
   - `game_sessions` (Session tokens, UTM tracking, chapter tracking)
   - `gameplay_events` (Chronological event stream)
   - `player_preferences` (Aesthetic and environment choices)
   - Performance indexes and Row Level Security policies

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To test Instagram attribution parameters:
```
http://localhost:3000/?utm_source=instagram&utm_medium=story&utm_campaign=the_unwritten
```

---

## Administrator / Curator Access

1. Ensure your email is listed in `ADMIN_EMAILS` inside `.env.local`.
2. Visit `/curator/login` (discreet private address, not linked publicly in the footer).
3. Enter your authorized email address.
4. You will be authenticated and redirected to `/curator`.
5. Review live telemetry, session completion funnels, and player dossiers.

---

## Vercel Deployment

Deploy with the Vercel CLI or Git integration:

1. Push your repository to GitHub or GitLab.
2. Import the project into Vercel.
3. In **Settings -> Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS`
4. Deploy.

---

## Privacy & Ethical Standards

- **No Covert Fingerprinting:** No canvas hashing, battery tracking, or third-party marketing tags.
- **Voluntary Profiles:** Players can play 100% anonymously.
- **Non-Clinical Disclaimer:** Archetypes are transparent, deterministic game signals, not psychological diagnoses.
