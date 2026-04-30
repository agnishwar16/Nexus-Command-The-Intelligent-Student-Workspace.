-- Nexus Command: Final Database Schema Fixes
-- This schema handles Gmail IDs (Text) instead of UUIDs to support NextAuth.

-- 1. Create a table for student profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the user_stats table (Streaks & Career Focus)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id TEXT PRIMARY KEY,
  total_focus_minutes INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_streak_date DATE,
  weekly_progress TEXT DEFAULT '[0,0,0,0,0,0,0]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create a table for tasks (Temporal Rift)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  course TEXT DEFAULT 'General',
  deadline TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create Open Access Policies (Optimized for Web Dashboard)
DROP POLICY IF EXISTS "Public access to stats" ON public.user_stats;
CREATE POLICY "Public access to stats" ON public.user_stats FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to tasks" ON public.tasks;
CREATE POLICY "Public access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to profiles" ON public.profiles;
CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
