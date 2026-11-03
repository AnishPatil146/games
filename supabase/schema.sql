-- =============================================================================
-- THE UNWRITTEN — Master Normalized PostgreSQL Schema, Migrations & Strict RLS
-- Safe & Idempotent: Preserves existing tables and records if already deployed.
-- Execute in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PLAYERS TABLE (Voluntary profile records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 80),
    instagram_username TEXT NULL CHECK (instagram_username IS NULL OR char_length(instagram_username) <= 60),
    profile_consent BOOLEAN NOT NULL DEFAULT false,
    character_presentation TEXT NOT NULL DEFAULT 'UNSPECIFIED'
        CHECK (upper(character_presentation) IN ('HIM', 'HER', 'UNSPECIFIED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. GAME SESSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NULL REFERENCES public.players(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE CHECK (char_length(session_token) >= 16),
    character_presentation TEXT NOT NULL DEFAULT 'UNSPECIFIED',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    current_chapter INTEGER NOT NULL DEFAULT 1 CHECK (current_chapter BETWEEN 1 AND 6),
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    result_archetype TEXT NULL,
    campaign_source TEXT NULL,
    campaign_medium TEXT NULL,
    campaign_name TEXT NULL,
    utm_source TEXT NULL,
    utm_medium TEXT NULL,
    utm_campaign TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Non-destructive column additions if upgrading an existing deployment
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS character_presentation TEXT NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS campaign_source TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS campaign_medium TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS campaign_name TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS utm_source TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS utm_medium TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS utm_campaign TEXT NULL;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill campaign_* from utm_* if upgrading from earlier schema
UPDATE public.game_sessions
SET
    campaign_source = COALESCE(campaign_source, utm_source),
    campaign_medium = COALESCE(campaign_medium, utm_medium),
    campaign_name   = COALESCE(campaign_name, utm_campaign)
WHERE campaign_source IS NULL AND (utm_source IS NOT NULL OR utm_campaign IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 3. GAMEPLAY EVENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gameplay_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    chapter INTEGER NOT NULL CHECK (chapter BETWEEN 0 AND 7),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'landing_view',
            'mode_selected',
            'game_started',
            'profile_submitted',
            'chapter_started',
            'choice_selected',
            'clue_inspected',
            'puzzle_attempted',
            'hint_used',
            'chapter_completed',
            'seventh_door_unlocked',
            'seventh_door_completed',
            'hidden_letter_unlocked',
            'hidden_letter_read',
            'junior_attempt_started',
            'junior_attempt_completed',
            'game_completed'
        )
    ),
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. PLAYER PREFERENCES TABLE (Explicit selections separated from inferences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    preference_category TEXT NOT NULL CHECK (char_length(preference_category) BETWEEN 1 AND 80),
    selected_value TEXT NOT NULL CHECK (char_length(selected_value) BETWEEN 1 AND 200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. DELETION REQUESTS TABLE (Privacy & Data Governance)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL CHECK (char_length(trim(identifier)) BETWEEN 2 AND 160),
    reason TEXT NULL CHECK (reason IS NULL OR char_length(reason) <= 500),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 6. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_game_sessions_token ON public.game_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON public.game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON public.game_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_campaign_source ON public.game_sessions(campaign_source);
CREATE INDEX IF NOT EXISTS idx_gameplay_events_session_id ON public.gameplay_events(session_id);
CREATE INDEX IF NOT EXISTS idx_gameplay_events_chapter ON public.gameplay_events(chapter);
CREATE INDEX IF NOT EXISTS idx_gameplay_events_type ON public.gameplay_events(event_type);
CREATE INDEX IF NOT EXISTS idx_gameplay_events_created_at ON public.gameplay_events(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_player_preferences_session_id ON public.player_preferences(session_id);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON public.players(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_created_at ON public.deletion_requests(created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. STRICT ROW LEVEL SECURITY (RLS)
-- Public `anon` users CANNOT read tables directly.
-- Direct table access is restricted to `service_role` or the single verified
-- Supabase Auth administrator (`anishpatil146@gmail.com`).
-- -----------------------------------------------------------------------------
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameplay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Remove any legacy permissive policies if upgrading
DROP POLICY IF EXISTS "Public insert players" ON public.players;
DROP POLICY IF EXISTS "Public insert sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Public read own session" ON public.game_sessions;
DROP POLICY IF EXISTS "Public update own session" ON public.game_sessions;
DROP POLICY IF EXISTS "Public insert gameplay events" ON public.gameplay_events;
DROP POLICY IF EXISTS "Public read own gameplay events" ON public.gameplay_events;
DROP POLICY IF EXISTS "Public insert preferences" ON public.player_preferences;
DROP POLICY IF EXISTS "Public read preferences" ON public.player_preferences;

DROP POLICY IF EXISTS "Admin full access players" ON public.players;
DROP POLICY IF EXISTS "Admin full access sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Admin full access events" ON public.gameplay_events;
DROP POLICY IF EXISTS "Admin full access preferences" ON public.player_preferences;
DROP POLICY IF EXISTS "Admin full access deletion_requests" ON public.deletion_requests;

CREATE POLICY "Admin full access players" ON public.players
    FOR ALL TO authenticated
    USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com')
    WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com');

CREATE POLICY "Admin full access sessions" ON public.game_sessions
    FOR ALL TO authenticated
    USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com')
    WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com');

CREATE POLICY "Admin full access events" ON public.gameplay_events
    FOR ALL TO authenticated
    USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com')
    WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com');

CREATE POLICY "Admin full access preferences" ON public.player_preferences
    FOR ALL TO authenticated
    USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com')
    WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com');

CREATE POLICY "Admin full access deletion_requests" ON public.deletion_requests
    FOR ALL TO authenticated
    USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com')
    WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'anishpatil146@gmail.com');

-- -----------------------------------------------------------------------------
-- 8. TOKEN-SCOPED SECURITY DEFINER FUNCTIONS FOR PUBLIC GAMEPLAY
-- Every public operation validates `p_session_token` ownership on the server
-- and never leaks private profiles, Instagram handles, or other sessions.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_upsert_session(
    p_session_token TEXT,
    p_presentation TEXT DEFAULT 'UNSPECIFIED',
    p_campaign_source TEXT DEFAULT NULL,
    p_campaign_medium TEXT DEFAULT NULL,
    p_campaign_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.game_sessions;
    v_player public.players;
    v_pres TEXT := CASE
        WHEN upper(coalesce(p_presentation, '')) IN ('HIM', 'HER', 'UNSPECIFIED')
        THEN upper(p_presentation)
        ELSE 'UNSPECIFIED'
    END;
BEGIN
    IF p_session_token IS NULL OR char_length(p_session_token) < 16 THEN
        RAISE EXCEPTION 'Invalid session token';
    END IF;

    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE session_token = p_session_token
    LIMIT 1;

    IF NOT FOUND THEN
        INSERT INTO public.game_sessions (
            session_token,
            character_presentation,
            current_chapter,
            status,
            started_at,
            campaign_source,
            campaign_medium,
            campaign_name,
            utm_source,
            utm_medium,
            utm_campaign
        ) VALUES (
            p_session_token,
            v_pres,
            1,
            'in_progress',
            now(),
            NULLIF(trim(coalesce(p_campaign_source, '')), ''),
            NULLIF(trim(coalesce(p_campaign_medium, '')), ''),
            NULLIF(trim(coalesce(p_campaign_name, '')), ''),
            NULLIF(trim(coalesce(p_campaign_source, '')), ''),
            NULLIF(trim(coalesce(p_campaign_medium, '')), ''),
            NULLIF(trim(coalesce(p_campaign_name, '')), '')
        )
        RETURNING * INTO v_session;
    ELSIF v_pres <> 'UNSPECIFIED' AND v_session.character_presentation = 'UNSPECIFIED' THEN
        UPDATE public.game_sessions
        SET character_presentation = v_pres
        WHERE id = v_session.id
        RETURNING * INTO v_session;
    END IF;

    IF v_session.player_id IS NOT NULL THEN
        SELECT * INTO v_player FROM public.players WHERE id = v_session.player_id;
    END IF;

    RETURN jsonb_build_object(
        'id', v_session.id,
        'player_id', v_session.player_id,
        'character_presentation', v_session.character_presentation,
        'started_at', v_session.started_at,
        'completed_at', v_session.completed_at,
        'current_chapter', v_session.current_chapter,
        'status', v_session.status,
        'result_archetype', v_session.result_archetype,
        'campaign_source', v_session.campaign_source,
        'campaign_medium', v_session.campaign_medium,
        'campaign_name', v_session.campaign_name,
        'created_at', v_session.created_at,
        'player_display_name', v_player.display_name
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_submit_profile(
    p_session_token TEXT,
    p_display_name TEXT,
    p_instagram_username TEXT DEFAULT NULL,
    p_consent BOOLEAN DEFAULT false,
    p_presentation TEXT DEFAULT 'UNSPECIFIED'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.game_sessions;
    v_player public.players;
    v_pres TEXT := CASE
        WHEN upper(coalesce(p_presentation, '')) IN ('HIM', 'HER', 'UNSPECIFIED')
        THEN upper(p_presentation)
        ELSE 'UNSPECIFIED'
    END;
    v_clean_ig TEXT := NULLIF(regexp_replace(trim(coalesce(p_instagram_username, '')), '^@+', ''), '');
BEGIN
    IF p_consent IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'Explicit profile consent is required';
    END IF;

    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE session_token = p_session_token
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found for token';
    END IF;

    IF v_session.player_id IS NOT NULL THEN
        UPDATE public.players
        SET
            display_name = trim(p_display_name),
            instagram_username = v_clean_ig,
            profile_consent = true,
            character_presentation = v_pres
        WHERE id = v_session.player_id
        RETURNING * INTO v_player;
    ELSE
        INSERT INTO public.players (
            display_name,
            instagram_username,
            profile_consent,
            character_presentation
        ) VALUES (
            trim(p_display_name),
            v_clean_ig,
            true,
            v_pres
        )
        RETURNING * INTO v_player;
    END IF;

    UPDATE public.game_sessions
    SET
        player_id = v_player.id,
        character_presentation = v_pres
    WHERE id = v_session.id
    RETURNING * INTO v_session;

    RETURN jsonb_build_object(
        'player_id', v_player.id,
        'display_name', v_player.display_name,
        'character_presentation', v_session.character_presentation,
        'session_id', v_session.id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_record_event(
    p_session_token TEXT,
    p_chapter INTEGER,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_result_archetype TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.game_sessions;
    v_existing_id UUID;
    v_event_id UUID;
BEGIN
    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE session_token = p_session_token
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found for token';
    END IF;

    -- Prevent duplicate completion events
    IF p_event_type IN ('chapter_completed', 'game_completed', 'landing_view') THEN
        SELECT id INTO v_existing_id
        FROM public.gameplay_events
        WHERE session_id = v_session.id
          AND chapter = p_chapter
          AND event_type = p_event_type
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            IF p_event_type = 'game_completed' AND p_result_archetype IS NOT NULL THEN
                UPDATE public.game_sessions
                SET status = 'completed',
                    completed_at = COALESCE(completed_at, now()),
                    result_archetype = COALESCE(p_result_archetype, result_archetype)
                WHERE id = v_session.id;
            END IF;
            RETURN jsonb_build_object('recorded', true, 'deduplicated', true, 'event_id', v_existing_id);
        END IF;
    END IF;

    INSERT INTO public.gameplay_events (
        session_id,
        chapter,
        event_type,
        event_data
    ) VALUES (
        v_session.id,
        p_chapter,
        p_event_type,
        COALESCE(p_event_data, '{}'::jsonb)
    )
    RETURNING id INTO v_event_id;

    IF p_event_type = 'chapter_started' AND p_chapter BETWEEN 1 AND 6 THEN
        UPDATE public.game_sessions
        SET current_chapter = GREATEST(current_chapter, p_chapter)
        WHERE id = v_session.id;
    ELSIF p_event_type = 'chapter_completed' AND p_chapter BETWEEN 1 AND 6 THEN
        UPDATE public.game_sessions
        SET current_chapter = GREATEST(current_chapter, LEAST(6, p_chapter + 1))
        WHERE id = v_session.id;
    ELSIF p_event_type = 'game_completed' THEN
        UPDATE public.game_sessions
        SET
            status = 'completed',
            completed_at = COALESCE(completed_at, now()),
            current_chapter = 6,
            result_archetype = COALESCE(NULLIF(trim(coalesce(p_result_archetype, '')), ''), result_archetype)
        WHERE id = v_session.id;
    END IF;

    RETURN jsonb_build_object('recorded', true, 'deduplicated', false, 'event_id', v_event_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_record_preference(
    p_session_token TEXT,
    p_category TEXT,
    p_selected_value TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.game_sessions;
BEGIN
    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE session_token = p_session_token
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found for token';
    END IF;

    -- Avoid duplicate exact category+value pair on refresh
    DELETE FROM public.player_preferences
    WHERE session_id = v_session.id
      AND preference_category = p_category
      AND (
          p_category <> 'canvas_object'
          OR selected_value = p_selected_value
      );

    INSERT INTO public.player_preferences (
        session_id,
        preference_category,
        selected_value
    ) VALUES (
        v_session.id,
        p_category,
        p_selected_value
    );

    RETURN jsonb_build_object('recorded', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_session_dossier(
    p_lookup TEXT,
    p_archetype_if_complete TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.game_sessions;
    v_display_name TEXT;
    v_events JSONB;
    v_preferences JSONB;
BEGIN
    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE id::text = p_lookup OR session_token = p_lookup
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    IF p_archetype_if_complete IS NOT NULL AND v_session.result_archetype IS NULL THEN
        UPDATE public.game_sessions
        SET result_archetype = p_archetype_if_complete,
            status = CASE WHEN current_chapter >= 6 THEN 'completed' ELSE status END,
            completed_at = CASE WHEN current_chapter >= 6 THEN COALESCE(completed_at, now()) ELSE completed_at END
        WHERE id = v_session.id
        RETURNING * INTO v_session;
    END IF;

    IF v_session.player_id IS NOT NULL THEN
        SELECT display_name INTO v_display_name
        FROM public.players
        WHERE id = v_session.player_id;
    END IF;

    SELECT COALESCE(jsonb_agg(row_to_json(e) ORDER BY e.created_at ASC), '[]'::jsonb)
    INTO v_events
    FROM (
        SELECT id, session_id, chapter, event_type, event_data, created_at
        FROM public.gameplay_events
        WHERE session_id = v_session.id
        ORDER BY created_at ASC
    ) e;

    SELECT COALESCE(jsonb_agg(row_to_json(p) ORDER BY p.created_at ASC), '[]'::jsonb)
    INTO v_preferences
    FROM (
        SELECT id, session_id, preference_category, selected_value, created_at
        FROM public.player_preferences
        WHERE session_id = v_session.id
        ORDER BY created_at ASC
    ) p;

    -- Notice: session_token and instagram_username are NEVER returned publicly
    RETURN jsonb_build_object(
        'session', jsonb_build_object(
            'id', v_session.id,
            'character_presentation', v_session.character_presentation,
            'started_at', v_session.started_at,
            'completed_at', v_session.completed_at,
            'current_chapter', v_session.current_chapter,
            'status', v_session.status,
            'result_archetype', v_session.result_archetype,
            'created_at', v_session.created_at
        ),
        'player_display_name', v_display_name,
        'events', v_events,
        'preferences', v_preferences
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_submit_deletion_request(
    p_identifier TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.deletion_requests (identifier, reason)
    VALUES (trim(p_identifier), NULLIF(trim(coalesce(p_reason, '')), ''))
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('submitted', true, 'request_id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_upsert_session(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_submit_profile(TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_record_event(TEXT, INTEGER, TEXT, JSONB, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_record_preference(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_session_dossier(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_submit_deletion_request(TEXT, TEXT) TO anon, authenticated, service_role;



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
