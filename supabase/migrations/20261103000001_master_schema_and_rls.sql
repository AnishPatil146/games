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
    chapter INTEGER NOT NULL CHECK (chapter BETWEEN 0 AND 6),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'landing_view',
            'game_started',
            'profile_submitted',
            'chapter_started',
            'choice_selected',
            'clue_inspected',
            'puzzle_attempted',
            'hint_used',
            'chapter_completed',
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
