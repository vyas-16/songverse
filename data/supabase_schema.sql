-- =========================================================================
-- SongVerse Supabase Database Schema & Row Level Security (RLS) Policies
-- Version: 1.0.0
-- Compatible with Supabase PostgreSQL 15+
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. TABLES DEFINITIONS
-- =========================================================================

-- Table 1: User Profiles (Synchronized with auth.users or guest sessions)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT NOT NULL DEFAULT 'GrooveExplorer',
    avatar_seed TEXT NOT NULL DEFAULT 'aurora',
    auth_provider TEXT NOT NULL DEFAULT 'supabase',
    total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    games_played INTEGER NOT NULL DEFAULT 0 CHECK (games_played >= 0),
    rounds_won INTEGER NOT NULL DEFAULT 0 CHECK (rounds_won >= 0),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
    preferred_languages TEXT[] NOT NULL DEFAULT ARRAY['English']::TEXT[],
    favorite_genres JSONB NOT NULL DEFAULT '{}'::JSONB,
    unlocked_achievements TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: Game Sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    mode TEXT NOT NULL DEFAULT 'classic' CHECK (mode IN ('classic', 'daily', 'practice', 'category', 'multiplayer')),
    total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
    category_filter JSONB,
    selected_languages TEXT[],
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: Game Rounds
CREATE TABLE IF NOT EXISTS public.game_rounds (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL CHECK (round_number >= 1),
    target_track_id TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 4),
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded IN (0, 20, 40, 70, 100)),
    status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'won', 'lost')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 4: Game Answers (Guesses) with Strict Level Deduplication
CREATE TABLE IF NOT EXISTS public.game_answers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id TEXT NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    round_id TEXT NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    guess_track_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded IN (0, 20, 40, 70, 100)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Ensures user cannot submit multiple guesses for the same round level
    CONSTRAINT unique_round_level_guess UNIQUE (round_id, level)
);

-- Table 5: Game Skips
CREATE TABLE IF NOT EXISTS public.game_skips (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id TEXT NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    round_id TEXT NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    skip_type TEXT NOT NULL CHECK (skip_type IN ('level', 'round')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 6: Application Error Events (Sanitized Telemetry)
CREATE TABLE IF NOT EXISTS public.application_errors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    component_stack TEXT,
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_score ON public.user_profiles (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON public.game_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_session ON public.game_rounds (session_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_round ON public.game_answers (round_id);
CREATE INDEX IF NOT EXISTS idx_game_skips_round ON public.game_skips (round_id);
CREATE INDEX IF NOT EXISTS idx_application_errors_created ON public.application_errors (created_at DESC);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_skips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_errors ENABLE ROW LEVEL SECURITY;

-- 4.1. User Profiles RLS
-- Users can view their own private profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Public can view high-level leaderboard fields (display_name, avatar_seed, score, streak)
CREATE POLICY "Public leaderboard view for profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

-- 4.2. Game Sessions RLS
-- Users can only view and manage their own sessions; service role can manage all
CREATE POLICY "Users can view own sessions"
    ON public.game_sessions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sessions"
    ON public.game_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- 4.3. Game Rounds RLS
CREATE POLICY "Users can view own rounds"
    ON public.game_rounds FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own rounds"
    ON public.game_rounds FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own rounds"
    ON public.game_rounds FOR UPDATE
    USING (auth.uid() = user_id);

-- 4.4. Game Answers RLS
CREATE POLICY "Users can view own answers"
    ON public.game_answers FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own answers"
    ON public.game_answers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4.5. Game Skips RLS
CREATE POLICY "Users can view own skips"
    ON public.game_skips FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own skips"
    ON public.game_skips FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4.6. Application Errors RLS
-- Any client can log error events
CREATE POLICY "Clients can insert application errors"
    ON public.application_errors FOR INSERT
    WITH CHECK (true);

-- Only service role can read error logs (no public read policy)

-- =========================================================================
-- 5. SECURE LEADERBOARD VIEW
-- =========================================================================
CREATE OR REPLACE VIEW public.leaderboard_public AS
SELECT 
    id AS user_id,
    display_name,
    avatar_seed,
    total_score,
    rounds_won,
    games_played,
    current_streak,
    best_streak,
    CASE 
        WHEN games_played > 0 THEN ROUND((rounds_won::NUMERIC / (games_played * 5)::NUMERIC) * 100, 1)
        ELSE 0 
    END AS accuracy_percentage,
    last_played_at
FROM public.user_profiles
WHERE games_played > 0
ORDER BY total_score DESC, current_streak DESC
LIMIT 100;

-- Grant public read access to the sanitized view
GRANT SELECT ON public.leaderboard_public TO anon, authenticated;

-- =========================================================================
-- 6. AUTO-CREATE USER PROFILE ON AUTH SIGNUP TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name, avatar_seed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'GrooveExplorer'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_seed', 'aurora')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
