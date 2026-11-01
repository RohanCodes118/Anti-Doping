-- ==============================================================================
-- CLEAN QUEST - COMPLETE DATABASE SETUP & DEMO ACCOUNTS SEED SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It creates all required tables, triggers, indexes, RLS policies, and
-- authenticates the 3 demo users with full confirmed email access and progress.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- STEP 1: TABLES CREATION
-- ==============================================================================

-- 1. Profiles Table
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

-- 2. Quiz Attempts Table
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

-- 3. Game Attempts Table
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

-- 4. Community Posts Table
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

-- 5. Community Likes Table
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_attempts_user_id ON public.game_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_game_id ON public.game_attempts(game_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_completed_at ON public.game_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_post ON public.community_likes(user_id, post_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or leaderboard" ON public.profiles;
CREATE POLICY "Users can view own profile or leaderboard" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update own quiz attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can delete own quiz attempts" ON public.quiz_attempts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own game attempts" ON public.game_attempts;
CREATE POLICY "Users can view own game attempts" ON public.game_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game attempts" ON public.game_attempts;
CREATE POLICY "Users can insert own game attempts" ON public.game_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own game attempts" ON public.game_attempts;
CREATE POLICY "Users can delete own game attempts" ON public.game_attempts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.community_posts;
CREATE POLICY "Authenticated users can view posts" ON public.community_posts FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create own posts" ON public.community_posts;
CREATE POLICY "Users can create own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own likes" ON public.community_likes;
CREATE POLICY "Users can view own likes" ON public.community_likes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own likes" ON public.community_likes;
CREATE POLICY "Users can insert own likes" ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.community_likes;
CREATE POLICY "Users can delete own likes" ON public.community_likes FOR DELETE USING (auth.uid() = user_id);

-- Signup Trigger (Must specify SET search_path = public so auth admin can access public.profiles)
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
    id, name, email, username, sport, country, rank, level, xp, xp_to_next,
    total_xp, streak, completed_challenges, community_interactions, settings,
    learning_progress, challenge_progress, created_at, updated_at
  )
  VALUES (
    new.id, display_name, new.email, user_name_prefix, user_sport, '', 'Rookie',
    1, 0, 500, 0, 1, 0, 0,
    jsonb_build_object('notifications', true, 'soundEffects', true),
    '{}'::jsonb, '{}'::jsonb,
    NOW(), NOW()
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

-- ==============================================================================
-- STEP 2: CLEAN PREVIOUS DEMO DATA & INSERT COMPLETE AUTH USERS
-- ==============================================================================

-- Remove previous demo entries to prevent conflicts
DELETE FROM auth.identities WHERE identity_data->>'email' IN ('beginner@cleanquest.io', 'learner@cleanquest.io', 'champion@cleanquest.io') OR provider_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'beginner@cleanquest.io', 'learner@cleanquest.io', 'champion@cleanquest.io');
DELETE FROM auth.users WHERE email IN ('beginner@cleanquest.io', 'learner@cleanquest.io', 'champion@cleanquest.io') OR id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- 1. Beginner Athlete (Sam Rivera)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token,
  reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'beginner@cleanquest.io',
  crypt('CleanSport#2026', gen_salt('bf')),
  NOW(),
  NULL, '', NULL, '', NULL,
  '', '', NULL, NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sam Rivera","sport":"Athletics"}'::jsonb,
  FALSE, NOW(), NOW(),
  NULL, NULL, '', '', NULL,
  '', 0, NULL, '',
  NULL, FALSE, NULL, FALSE
);

-- 2. Active Learner (Maya Lin)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token,
  reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'learner@cleanquest.io',
  crypt('CleanSport#2026', gen_salt('bf')),
  NOW(),
  NULL, '', NULL, '', NULL,
  '', '', NULL, NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Maya Lin","sport":"Swimming"}'::jsonb,
  FALSE, NOW(), NOW(),
  NULL, NULL, '', '', NULL,
  '', 0, NULL, '',
  NULL, FALSE, NULL, FALSE
);

-- 3. Clean Sport Champion (Elena Rostova)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token,
  reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'champion@cleanquest.io',
  crypt('CleanSport#2026', gen_salt('bf')),
  NOW(),
  NULL, '', NULL, '', NULL,
  '', '', NULL, NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Elena Rostova","sport":"Cycling"}'::jsonb,
  FALSE, NOW(), NOW(),
  NULL, NULL, '', '', NULL,
  '', 0, NULL, '',
  NULL, FALSE, NULL, FALSE
);

-- Identities linking
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'beginner@cleanquest.io', 'email_verified', true),
  'email',
  '11111111-1111-1111-1111-111111111111',
  NOW(), NOW(), NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'learner@cleanquest.io', 'email_verified', true),
  'email',
  '22222222-2222-2222-2222-222222222222',
  NOW(), NOW(), NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333', 'email', 'champion@cleanquest.io', 'email_verified', true),
  'email',
  '33333333-3333-3333-3333-333333333333',
  NOW(), NOW(), NOW()
);

-- ==============================================================================
-- STEP 3: PROFILES DATA (Distinct progress per demo user)
-- ==============================================================================

-- Profile 1: Beginner Athlete (Level 1, 0 XP, fresh start)
INSERT INTO public.profiles (
  id, name, email, username, sport, country, rank, level, xp, xp_to_next,
  total_xp, streak, completed_challenges, community_interactions,
  settings, learning_progress, challenge_progress, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Sam Rivera',
  'beginner@cleanquest.io',
  'sam_rivera',
  'Athletics',
  'USA',
  'Rookie',
  1,
  0,
  500,
  0,
  1,
  0,
  0,
  '{"notifications": true, "soundEffects": true}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  xp_to_next = EXCLUDED.xp_to_next,
  total_xp = EXCLUDED.total_xp,
  streak = EXCLUDED.streak,
  completed_challenges = EXCLUDED.completed_challenges,
  learning_progress = EXCLUDED.learning_progress,
  challenge_progress = EXCLUDED.challenge_progress,
  updated_at = NOW();

-- Profile 2: Active Learner (Level 8, 850 XP, 4.2k total XP, 5-day streak)
INSERT INTO public.profiles (
  id, name, email, username, sport, country, rank, level, xp, xp_to_next,
  total_xp, streak, completed_challenges, community_interactions,
  settings, learning_progress, challenge_progress, created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Maya Lin',
  'learner@cleanquest.io',
  'maya_lin',
  'Swimming',
  'Canada',
  'Contender',
  8,
  850,
  1500,
  4200,
  5,
  3,
  4,
  '{"notifications": true, "soundEffects": true}'::jsonb,
  '{
    "mod_001": {"completedLessonIds": ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"], "progress": 100, "completed": true},
    "mod_002": {"completedLessonIds": ["l1", "l2", "l3", "l4"], "progress": 33, "completed": false},
    "mod_003": {"completedLessonIds": ["l1", "l2"], "progress": 33, "completed": false}
  }'::jsonb,
  '{
    "chl_001": {"status": "completed", "progress": 100, "lastCompletedDate": "Today"},
    "chl_002": {"status": "completed", "progress": 100},
    "chl_003": {"status": "completed", "progress": 100},
    "chl_004": {"status": "in_progress", "progress": 45}
  }'::jsonb,
  NOW() - INTERVAL '14 days',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  xp_to_next = EXCLUDED.xp_to_next,
  total_xp = EXCLUDED.total_xp,
  streak = EXCLUDED.streak,
  completed_challenges = EXCLUDED.completed_challenges,
  learning_progress = EXCLUDED.learning_progress,
  challenge_progress = EXCLUDED.challenge_progress,
  updated_at = NOW();

-- Profile 3: Clean Sport Champion (Level 18, 2400 XP, 28.9k total XP, 14-day streak)
INSERT INTO public.profiles (
  id, name, email, username, sport, country, rank, level, xp, xp_to_next,
  total_xp, streak, completed_challenges, community_interactions,
  settings, learning_progress, challenge_progress, created_at, updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Elena Rostova',
  'champion@cleanquest.io',
  'elena_r',
  'Cycling',
  'Germany',
  'Elite Athlete',
  18,
  2400,
  4800,
  28900,
  14,
  6,
  12,
  '{"notifications": true, "soundEffects": true}'::jsonb,
  '{
    "mod_001": {"completedLessonIds": ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"], "progress": 100, "completed": true},
    "mod_002": {"completedLessonIds": ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12"], "progress": 100, "completed": true},
    "mod_003": {"completedLessonIds": ["l1", "l2", "l3", "l4", "l5", "l6"], "progress": 100, "completed": true},
    "mod_004": {"completedLessonIds": ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"], "progress": 100, "completed": true}
  }'::jsonb,
  '{
    "chl_001": {"status": "completed", "progress": 100, "lastCompletedDate": "Today"},
    "chl_002": {"status": "completed", "progress": 100},
    "chl_003": {"status": "completed", "progress": 100},
    "chl_004": {"status": "completed", "progress": 100},
    "chl_005": {"status": "completed", "progress": 100},
    "chl_006": {"status": "completed", "progress": 100}
  }'::jsonb,
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  xp_to_next = EXCLUDED.xp_to_next,
  total_xp = EXCLUDED.total_xp,
  streak = EXCLUDED.streak,
  completed_challenges = EXCLUDED.completed_challenges,
  learning_progress = EXCLUDED.learning_progress,
  challenge_progress = EXCLUDED.challenge_progress,
  updated_at = NOW();

-- ==============================================================================
-- STEP 4: QUIZ ATTEMPTS DATA
-- ==============================================================================

DELETE FROM public.quiz_attempts WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Active Learner Quiz Attempts
INSERT INTO public.quiz_attempts (
  id, user_id, quiz_id, quiz_title, category_id, category_name, difficulty,
  score, total_questions, score_percentage, xp_earned, time_spent_seconds, completed_at
) VALUES
(
  'att_demo_l1',
  '22222222-2222-2222-2222-222222222222',
  'qz_001',
  'Introduction to Clean Sport & WADA',
  'cat_basics',
  'Anti-Doping Basics',
  'Beginner',
  5, 5, 100, 50, 140,
  NOW() - INTERVAL '5 days'
),
(
  'att_demo_l2',
  '22222222-2222-2222-2222-222222222222',
  'qz_002',
  'Strict Liability & Medication Checking',
  'cat_responsibilities',
  'Athlete Responsibilities',
  'Beginner',
  4, 5, 80, 40, 190,
  NOW() - INTERVAL '3 days'
),
(
  'att_demo_l3',
  '22222222-2222-2222-2222-222222222222',
  'qz_003',
  'WADA Prohibited List & Categories',
  'cat_substances',
  'Prohibited Substances',
  'Intermediate',
  5, 5, 100, 100, 220,
  NOW() - INTERVAL '1 day'
);

-- Clean Sport Champion Quiz Attempts
INSERT INTO public.quiz_attempts (
  id, user_id, quiz_id, quiz_title, category_id, category_name, difficulty,
  score, total_questions, score_percentage, xp_earned, time_spent_seconds, completed_at
) VALUES
(
  'att_demo_c1',
  '33333333-3333-3333-3333-333333333333',
  'qz_001',
  'Introduction to Clean Sport & WADA',
  'cat_basics',
  'Anti-Doping Basics',
  'Beginner',
  5, 5, 100, 50, 115,
  NOW() - INTERVAL '14 days'
),
(
  'att_demo_c2',
  '33333333-3333-3333-3333-333333333333',
  'qz_002',
  'Strict Liability & Medication Checking',
  'cat_responsibilities',
  'Athlete Responsibilities',
  'Beginner',
  5, 5, 100, 50, 130,
  NOW() - INTERVAL '12 days'
),
(
  'att_demo_c3',
  '33333333-3333-3333-3333-333333333333',
  'qz_003',
  'WADA Prohibited List & Categories',
  'cat_substances',
  'Prohibited Substances',
  'Intermediate',
  5, 5, 100, 100, 180,
  NOW() - INTERVAL '10 days'
),
(
  'att_demo_c4',
  '33333333-3333-3333-3333-333333333333',
  'qz_004',
  'Step-by-Step Doping Control Process',
  'cat_testing',
  'Testing Procedures',
  'Intermediate',
  5, 5, 100, 100, 195,
  NOW() - INTERVAL '8 days'
),
(
  'att_demo_c5',
  '33333333-3333-3333-3333-333333333333',
  'qz_005',
  'Therapeutic Use Exemptions (TUE) Masterclass',
  'cat_tue',
  'Therapeutic Use Exemptions',
  'Advanced',
  5, 5, 100, 200, 240,
  NOW() - INTERVAL '5 days'
),
(
  'att_demo_c6',
  '33333333-3333-3333-3333-333333333333',
  'qz_006',
  'Ethics, Fair Play & Spirit of Sport',
  'cat_ethics',
  'Ethics & Values',
  'Beginner',
  5, 5, 100, 50, 120,
  NOW() - INTERVAL '2 days'
);

-- Ensure table permissions for all roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
