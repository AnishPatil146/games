-- =============================================================================
-- THE UNWRITTEN — MIGRATION 02: DUAL-MODE PLATFORM, JUNIOR ENGINE & CONTROL CENTRE
-- Reconciles existing Senior tables and adds all 18+ platform entities, FKs,
-- indexes, RLS policies (anishpatil146@gmail.com), and transactional RPCs.
-- =============================================================================

-- 1. Extend existing `players` and `game_sessions` idempotently
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'senior' CHECK (mode IN ('senior', 'junior'));
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS stream_slug TEXT;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS subject_slug TEXT;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS seventh_door_unlocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS hidden_letter_unlocked BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(username);
CREATE INDEX IF NOT EXISTS idx_players_last_active_at ON public.players(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON public.game_sessions(mode);

-- 2. Senior Catalogue & Discovery Entities (`senior_chapters`, `senior_choices`, `senior_clues`)
CREATE TABLE IF NOT EXISTS public.senior_chapters (
    chapter_number INT PRIMARY KEY CHECK (chapter_number BETWEEN 1 AND 7),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT false,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.senior_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL REFERENCES public.senior_chapters(chapter_number),
    choice_key TEXT NOT NULL,
    choice_label TEXT NOT NULL,
    duration_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.senior_clues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL REFERENCES public.senior_chapters(chapter_number),
    clue_key TEXT NOT NULL,
    is_hidden_letter BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, clue_key)
);

INSERT INTO public.senior_chapters (chapter_number, slug, title, is_optional, description)
VALUES
    (1, 'the-last-train', 'The Last Train', false, 'Midnight urgency and social regard on Platform 4.'),
    (2, 'the-locked-room', 'The Locked Room', false, 'Environmental clue scrutiny and brass tumbler deduction.'),
    (3, 'the-unknown-message', 'The Unknown Message', false, 'Ambiguous signal verification and sovereign restraint.'),
    (4, 'the-empty-canvas', 'The Empty Canvas', false, 'Sculptural form, ground tone, and spatial balance.'),
    (5, 'the-final-ten-seconds', 'The Final Ten Seconds', false, 'Timed relational logic under countdown pressure.'),
    (6, 'the-unknown-world', 'The Unknown World', false, 'Horizon sanctuary, relic claim, and opening act.'),
    (7, 'the-seventh-door', 'The Seventh Door', true, 'Secret archival threshold unlocked through deep observation.')
ON CONFLICT (chapter_number) DO NOTHING;

-- 3. Academic Hierarchy (`academic_boards`, `academic_years`, `academic_streams`, `academic_subjects`, `academic_chapters`)
CREATE TABLE IF NOT EXISTS public.academic_boards (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
    id TEXT PRIMARY KEY,
    board_code TEXT NOT NULL REFERENCES public.academic_boards(code) ON DELETE CASCADE,
    label TEXT NOT NULL,
    standard TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_streams (
    slug TEXT PRIMARY KEY CHECK (slug IN ('science', 'commerce', 'arts')),
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_subjects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    stream_slug TEXT NOT NULL REFERENCES public.academic_streams(slug) ON DELETE RESTRICT,
    board_code TEXT NOT NULL REFERENCES public.academic_boards(code) ON DELETE RESTRICT,
    academic_year TEXT NOT NULL,
    standard TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_elective BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_slug TEXT NOT NULL REFERENCES public.academic_subjects(slug) ON DELETE CASCADE,
    chapter_number INT NOT NULL CHECK (chapter_number >= 1),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (subject_slug, chapter_number)
);

-- 4. Question Bank & Attempt Engine Entities
CREATE TABLE IF NOT EXISTS public.question_bank (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL DEFAULT 'MSBSHSE',
    academic_year TEXT NOT NULL DEFAULT '2025-26',
    standard TEXT NOT NULL DEFAULT 'Class 11 (FYJC)',
    stream TEXT NOT NULL REFERENCES public.academic_streams(slug),
    subject_slug TEXT NOT NULL REFERENCES public.academic_subjects(slug),
    subject_name TEXT NOT NULL,
    chapter_number INT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    question_text TEXT NOT NULL,
    diagram_type TEXT,
    options JSONB NOT NULL,
    correct_key TEXT NOT NULL CHECK (correct_key IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    syllabus_reference TEXT NOT NULL,
    ability_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
    reviewed BOOLEAN NOT NULL DEFAULT false,
    version INT NOT NULL DEFAULT 1,
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_question_bank_subject_status
    ON public.question_bank(subject_slug, publication_status, difficulty);

CREATE TABLE IF NOT EXISTS public.question_attempt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_key TEXT NOT NULL,
    subject_slug TEXT NOT NULL REFERENCES public.academic_subjects(slug) ON DELETE CASCADE,
    cycle_number INT NOT NULL DEFAULT 1,
    completed_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_reset_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (participant_key, subject_slug)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id TEXT NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    board TEXT NOT NULL DEFAULT 'MSBSHSE',
    academic_year TEXT NOT NULL DEFAULT '2025-26',
    standard TEXT NOT NULL DEFAULT 'Class 11 (FYJC)',
    stream TEXT NOT NULL REFERENCES public.academic_streams(slug),
    subject_slug TEXT NOT NULL REFERENCES public.academic_subjects(slug),
    subject_name TEXT NOT NULL,
    difficulty_preference TEXT NOT NULL DEFAULT 'Mixed',
    instant_feedback_enabled BOOLEAN NOT NULL DEFAULT false,
    attempt_number INT NOT NULL DEFAULT 1,
    cycle_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reservation_expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    score_out_of_10 INT CHECK (score_out_of_10 IS NULL OR (score_out_of_10 BETWEEN 0 AND 10)),
    correct_count INT,
    incorrect_count INT,
    accuracy_pct INT,
    scoring_algorithm_version TEXT NOT NULL DEFAULT 'jr-v1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_participant ON public.quiz_attempts(participant_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject_status ON public.quiz_attempts(subject_slug, status);

CREATE TABLE IF NOT EXISTS public.quiz_attempt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    slot_number INT NOT NULL CHECK (slot_number BETWEEN 1 AND 10),
    question_id TEXT NOT NULL,
    question_version INT NOT NULL DEFAULT 1,
    chapter_number INT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_text TEXT NOT NULL,
    diagram_type TEXT,
    presented_options JSONB NOT NULL,
    canonical_correct_key TEXT NOT NULL CHECK (canonical_correct_key IN ('A', 'B', 'C', 'D')),
    correct_display_key TEXT NOT NULL CHECK (correct_display_key IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    syllabus_reference TEXT NOT NULL,
    ability_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE (attempt_id, slot_number),
    UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    selected_display_key TEXT CHECK (selected_display_key IS NULL OR selected_display_key IN ('A', 'B', 'C', 'D')),
    canonical_selected_key TEXT CHECK (canonical_selected_key IS NULL OR canonical_selected_key IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL DEFAULT false,
    response_time_ms INT,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, question_id)
);

-- 5. Ability Results, Profile Results, Campaign Attribution & Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.ability_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL,
    stream TEXT NOT NULL,
    indicator_key TEXT NOT NULL,
    indicator_label TEXT NOT NULL,
    supported BOOLEAN NOT NULL DEFAULT false,
    qualitative_band TEXT NOT NULL,
    score_pct INT,
    mapped_questions_count INT NOT NULL DEFAULT 0,
    correct_mapped_count INT NOT NULL DEFAULT 0,
    supporting_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    supporting_evidence_summary TEXT NOT NULL DEFAULT '',
    confidence TEXT NOT NULL,
    scoring_algorithm_version TEXT NOT NULL DEFAULT 'jr-v1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, indicator_key)
);

CREATE TABLE IF NOT EXISTS public.personality_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('senior', 'junior')),
    profile_title TEXT NOT NULL,
    profile_subtitle TEXT NOT NULL,
    narrative TEXT NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'Moderate',
    scoring_algorithm_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'direct',
    medium TEXT NOT NULL DEFAULT 'none',
    campaign TEXT NOT NULL DEFAULT 'none',
    landing_path TEXT NOT NULL DEFAULT '/',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- 6. Strict Row Level Security on all new tables
ALTER TABLE public.senior_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read ONLY on non-sensitive academic/senior catalogues (NEVER question_bank answer keys or participant tables!)
DROP POLICY IF EXISTS "public_read_senior_chapters" ON public.senior_chapters;
CREATE POLICY "public_read_senior_chapters" ON public.senior_chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_boards" ON public.academic_boards;
CREATE POLICY "public_read_boards" ON public.academic_boards FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_years" ON public.academic_years;
CREATE POLICY "public_read_years" ON public.academic_years FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_streams" ON public.academic_streams;
CREATE POLICY "public_read_streams" ON public.academic_streams FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_subjects" ON public.academic_subjects;
CREATE POLICY "public_read_subjects" ON public.academic_subjects FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_academic_chapters" ON public.academic_chapters;
CREATE POLICY "public_read_academic_chapters" ON public.academic_chapters FOR SELECT USING (true);

-- Admin & Service Role full policies on all sensitive tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'senior_chapters', 'senior_choices', 'senior_clues',
        'academic_boards', 'academic_years', 'academic_streams', 'academic_subjects', 'academic_chapters',
        'question_bank', 'question_attempt_history', 'quiz_attempts', 'quiz_attempt_questions',
        'quiz_responses', 'ability_results', 'personality_results', 'campaign_attribution', 'admin_audit_logs'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "admin_all_%s" ON public.%I;', tbl, tbl);
        EXECUTE format(
            'CREATE POLICY "admin_all_%s" ON public.%I FOR ALL USING (auth.role() = ''service_role'' OR lower(coalesce(auth.jwt() ->> ''email'', '''')) = ''anishpatil146@gmail.com'') WITH CHECK (auth.role() = ''service_role'' OR lower(coalesce(auth.jwt() ->> ''email'', '''')) = ''anishpatil146@gmail.com'');',
            tbl, tbl
        );
    END LOOP;
END $$;

