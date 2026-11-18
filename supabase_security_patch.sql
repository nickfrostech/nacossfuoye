-- ====================================================================
-- NACOSS FUOYE Portal: Security Hardening SQL Patch (Clean Version)
-- ====================================================================
-- Instructions:
-- 1. In Supabase Dashboard, open SQL Editor.
-- 2. Open a NEW query tab.
-- 3. Paste the entire content below and click RUN.
-- ====================================================================

-- 1. Enable RLS on user_roles
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated to read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to read own role or admin read all" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON public.user_roles;

-- 3. Users can strictly read ONLY their own role (Least-Privilege Enforcement)
CREATE POLICY "Allow users to read own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'));

-- 4. Admins and President can manage (insert, update, delete) roles
CREATE POLICY "Allow admins to manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.get_user_role() IN ('admin', 'president'))
WITH CHECK (public.get_user_role() IN ('admin', 'president'));

-- 5. Enable Row-Level Security on game_scores
ALTER TABLE IF EXISTS public.game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view game scores" ON public.game_scores;
CREATE POLICY "Public can view game scores"
ON public.game_scores
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can submit game scores" ON public.game_scores;
CREATE POLICY "Public can submit game scores"
ON public.game_scores
FOR INSERT
WITH CHECK (true);

-- 6. Ensure RLS is enabled across all application tables
ALTER TABLE IF EXISTS public.memo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treasurer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_journal ENABLE ROW LEVEL SECURITY;
