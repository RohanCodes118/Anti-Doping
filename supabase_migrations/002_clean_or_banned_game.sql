-- ==============================================================================
-- CLEAN QUEST - MINI-GAMES & CLEAN COINS MIGRATION
-- ==============================================================================
-- Run this in your Supabase SQL Editor if updating an existing database.
-- ==============================================================================

-- 1. Add Clean Coins and Game Progress columns to Profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clean_coins INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS game_progress JSONB DEFAULT '{}'::jsonb;

-- 2. Create Game Attempts Table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_attempts_user_id ON public.game_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_game_id ON public.game_attempts(game_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_completed_at ON public.game_attempts(completed_at DESC);

-- RLS
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own game attempts" ON public.game_attempts;
CREATE POLICY "Users can view own game attempts" ON public.game_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game attempts" ON public.game_attempts;
CREATE POLICY "Users can insert own game attempts" ON public.game_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own game attempts" ON public.game_attempts;
CREATE POLICY "Users can delete own game attempts" ON public.game_attempts FOR DELETE USING (auth.uid() = user_id);

-- Ensure table permissions for all roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
