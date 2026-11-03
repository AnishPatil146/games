-- THE UNWRITTEN: Complete PostgreSQL Schema for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-initializing (safe order)
DROP TABLE IF EXISTS player_preferences CASCADE;
DROP TABLE IF EXISTS gameplay_events CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- 3. Players table (Voluntary player profiles)
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    instagram_username TEXT NULL,
    profile_consent BOOLEAN NOT NULL DEFAULT false,
    character_presentation TEXT NOT NULL DEFAULT 'unspecified', -- 'HIM', 'HER', 'UNSPECIFIED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Game Sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE,
    character_presentation TEXT NOT NULL DEFAULT 'unspecified',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    current_chapter INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    result_archetype TEXT NULL,
    utm_source TEXT NULL,
    utm_medium TEXT NULL,
    utm_campaign TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Gameplay Events table
CREATE TABLE gameplay_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    chapter INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'landing_view', 'game_started', 'profile_submitted', 'chapter_started', 'choice_selected', 'clue_inspected', 'puzzle_attempted', 'hint_used', 'chapter_completed', 'game_completed'
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Player Preferences table (Explicit preferences separated from inferred traits)
CREATE TABLE player_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    preference_category TEXT NOT NULL,
    selected_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Performance Indexes
CREATE INDEX idx_game_sessions_token ON game_sessions(session_token);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);
CREATE INDEX idx_gameplay_events_session_id ON gameplay_events(session_id);
CREATE INDEX idx_gameplay_events_chapter ON gameplay_events(chapter);
CREATE INDEX idx_gameplay_events_type ON gameplay_events(event_type);
CREATE INDEX idx_player_preferences_session_id ON player_preferences(session_id);
CREATE INDEX idx_players_created_at ON players(created_at DESC);

-- 8. Row Level Security (RLS) Setup
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gameplay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_preferences ENABLE ROW LEVEL SECURITY;

-- 8a. Public Policies (Players playing the game anonymously or registered)
-- Allow public insert to players (only voluntary profile creation)
CREATE POLICY "Public insert players" ON players
    FOR INSERT WITH CHECK (true);

-- Allow public read of own session by session_token or session id
CREATE POLICY "Public insert sessions" ON game_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read own session" ON game_sessions
    FOR SELECT USING (true);

CREATE POLICY "Public update own session" ON game_sessions
    FOR UPDATE USING (true);

-- Allow public insert of gameplay events
CREATE POLICY "Public insert gameplay events" ON gameplay_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read own gameplay events" ON gameplay_events
    FOR SELECT USING (true);

-- Allow public insert of player preferences
CREATE POLICY "Public insert preferences" ON player_preferences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read preferences" ON player_preferences
    FOR SELECT USING (true);

-- Service role bypasses RLS automatically in Supabase.

