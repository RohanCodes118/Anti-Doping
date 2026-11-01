-- ==============================================================================
-- CLEAN QUEST / ANTI-DOPING PLATFORM - SUPABASE DATABASE SETUP SCRIPT
-- ==============================================================================
-- Run this SQL in your Supabase Project: Dashboard -> SQL Editor -> New Query
-- It creates all required tables, triggers, indexes, and Row Level Security (RLS)
-- policies for user profiles, quiz attempts, progress tracking, and community posts.
-- ==============================================================================

-- 1. PROFILES TABLE (Stores user progression, settings, and progress maps)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  username TEXT,
  sport TEXT DEFAULT 'General',
  country TEXT DEFAULT '',
  rank TEXT DEFAULT 'Rookie',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 500,
  total_xp INTEGER DEFAULT 0,
  clean_coins INTEGER DEFAULT 100,
  streak INTEGER DEFAULT 1,
  completed_challenges INTEGER DEFAULT 0,
  community_interactions INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{"notifications": true, "soundEffects": true}'::jsonb,
  learning_progress JSONB DEFAULT '{}'::jsonb,
  challenge_progress JSONB DEFAULT '{}'::jsonb,
  game_progress JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. QUIZ ATTEMPTS TABLE (Stores individual completed quiz history per user)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  category_id TEXT,
  category_name TEXT,
  difficulty TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  score_percentage INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. GAME ATTEMPTS TABLE (Stores mini-games history: Clean or Banned, etc.)
CREATE TABLE IF NOT EXISTS public.game_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  game_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy_percentage INTEGER NOT NULL,
  best_streak INTEGER DEFAULT 0,
  xp_earned INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_initial TEXT,
  sport TEXT,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. COMMUNITY LIKES TABLE
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- 5. USER PASSKEYS TABLE (Stores registered WebAuthn / Biometric public keys per user)
CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  aaguid TEXT,
  credential_name TEXT DEFAULT 'Personal Device',
  authenticator_attachment TEXT DEFAULT 'platform',
  transports JSONB DEFAULT '["internal"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_used_at TIMESTAMPTZ,
  CONSTRAINT unique_user_credential UNIQUE (user_id, credential_id)
);

-- 6. PASSKEY CHALLENGES TABLE (Transient store for one-time server challenges with TTL)
CREATE TABLE IF NOT EXISTS public.passkey_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'authentication',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '5 minutes') NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_attempts_user_id ON public.game_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_game_id ON public.game_attempts(game_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_completed_at ON public.game_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_post ON public.community_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON public.user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON public.user_passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_challenge ON public.passkey_challenges(challenge);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only view and modify their own data
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- User Passkeys Policies
DROP POLICY IF EXISTS "Users can view own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can view own passkeys"
  ON public.user_passkeys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can insert own passkeys"
  ON public.user_passkeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can update own passkeys"
  ON public.user_passkeys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can delete own passkeys"
  ON public.user_passkeys FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or leaderboard" ON public.profiles;
CREATE POLICY "Users can view own profile or leaderboard"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Quiz Attempts Policies
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update own quiz attempts"
  ON public.quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can delete own quiz attempts"
  ON public.quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Game Attempts Policies
DROP POLICY IF EXISTS "Users can view own game attempts" ON public.game_attempts;
CREATE POLICY "Users can view own game attempts"
  ON public.game_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game attempts" ON public.game_attempts;
CREATE POLICY "Users can insert own game attempts"
  ON public.game_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own game attempts" ON public.game_attempts;
CREATE POLICY "Users can delete own game attempts"
  ON public.game_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Community Posts Policies
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.community_posts;
CREATE POLICY "Authenticated users can view posts"
  ON public.community_posts FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create own posts" ON public.community_posts;
CREATE POLICY "Users can create own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Community Likes Policies
DROP POLICY IF EXISTS "Users can view own likes" ON public.community_likes;
CREATE POLICY "Users can view own likes"
  ON public.community_likes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own likes" ON public.community_likes;
CREATE POLICY "Users can insert own likes"
  ON public.community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.community_likes;
CREATE POLICY "Users can delete own likes"
  ON public.community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Automatically creates a clean, isolated profile when an auth.user is registered
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  user_sport TEXT;
  user_name_prefix TEXT;
BEGIN
  display_name := COALESCE(new.raw_user_meta_data->>'name', '');
  user_sport := COALESCE(new.raw_user_meta_data->>'sport', 'General');
  user_name_prefix := split_part(new.email, '@', 1);

  IF display_name = '' THEN
    display_name := user_name_prefix;
  END IF;

  INSERT INTO public.profiles (
    id,
    name,
    email,
    username,
    sport,
    country,
    rank,
    level,
    xp,
    xp_to_next,
    total_xp,
    streak,
    completed_challenges,
    community_interactions,
    settings,
    learning_progress,
    challenge_progress,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    display_name,
    new.email,
    user_name_prefix,
    user_sport,
    '',
    'Rookie',
    1,
    0,
    500,
    0,
    1,
    0,
    0,
    jsonb_build_object('notifications', true, 'soundEffects', true),
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
