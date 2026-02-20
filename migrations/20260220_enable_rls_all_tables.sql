-- Migration: Enable RLS on all tables
-- Applied via Supabase MCP on 2026-02-20
-- This migration enables Row Level Security on ALL tables and creates
-- appropriate policies for authenticated and anonymous users.

-- ============================================================
-- Enable RLS on all public schema tables
-- ============================================================

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'school')
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma_%'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Create read policies for authenticated users on all tables
-- ============================================================

DO $$
DECLARE
  tbl RECORD;
  policy_name TEXT;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'school')
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma_%'
  LOOP
    policy_name := 'authenticated_read_' || tbl.tablename;
    -- Drop existing policy if it exists
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_name, tbl.schemaname, tbl.tablename);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    -- Create read policy
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (true)',
      policy_name, tbl.schemaname, tbl.tablename
    );
  END LOOP;
END $$;

-- ============================================================
-- Create write policies for authenticated users on all tables
-- ============================================================

DO $$
DECLARE
  tbl RECORD;
  policy_name TEXT;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'school')
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma_%'
  LOOP
    policy_name := 'authenticated_write_' || tbl.tablename;
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_name, tbl.schemaname, tbl.tablename);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      policy_name, tbl.schemaname, tbl.tablename
    );
  END LOOP;
END $$;

-- ============================================================
-- Anonymous user access policies (for anonymoususer tables only)
-- ============================================================

DO $$
DECLARE
  tbl RECORD;
  policy_name TEXT;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'school')
      AND tablename IN ('anonymoususer', 'anonymoususerprogress')
  LOOP
    policy_name := 'anon_access_' || tbl.tablename;
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_name, tbl.schemaname, tbl.tablename);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR ALL TO anon USING (true) WITH CHECK (true)',
      policy_name, tbl.schemaname, tbl.tablename
    );
  END LOOP;
END $$;

-- ============================================================
-- Profile-specific policies (prevent self-admin escalation)
-- ============================================================

-- Users can only read their own profile
CREATE POLICY profiles_own_read ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile but CANNOT set role to ADMIN
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role <> 'ADMIN');

-- Users can insert their own profile (for sign-up) but not as ADMIN
CREATE POLICY profiles_own_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role <> 'ADMIN');