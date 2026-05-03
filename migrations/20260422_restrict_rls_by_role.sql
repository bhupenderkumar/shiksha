-- Migration: Restrict RLS policies by role
-- Date: 2026-04-22
-- Purpose: Replace blanket "authenticated USING (true)" policies with
-- role-based policies so students cannot write to teacher/admin tables.
--
-- Strategy:
--   - Students can READ most tables (needed to view homework, timetable, etc.)
--   - Only TEACHER/ADMIN roles can INSERT/UPDATE/DELETE on management tables
--   - Role is checked via school."Profile" table linked by auth.uid()

-- Helper function to check user role (idempotent)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM school."Profile" WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Student table: students can read own record, teachers/admins can manage
-- ============================================================

-- Drop blanket write policy
DROP POLICY IF EXISTS "authenticated_write_Student" ON school."Student";

-- Teachers/admins can do everything
CREATE POLICY "staff_manage_Student" ON school."Student"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- Students can only read (existing read policy covers this)

-- ============================================================
-- Staff table: only admins can manage staff records
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Staff" ON school."Staff";

CREATE POLICY "admin_manage_Staff" ON school."Staff"
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ============================================================
-- Class table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Class" ON school."Class";

CREATE POLICY "staff_manage_Class" ON school."Class"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Subject table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Subject" ON school."Subject";

CREATE POLICY "staff_manage_Subject" ON school."Subject"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Homework table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Homework" ON school."Homework";

CREATE POLICY "staff_manage_Homework" ON school."Homework"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Classwork table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Classwork" ON school."Classwork";

CREATE POLICY "staff_manage_Classwork" ON school."Classwork"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Attendance table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Attendance" ON school."Attendance";

CREATE POLICY "staff_manage_Attendance" ON school."Attendance"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Fee table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_Fee" ON school."Fee";

CREATE POLICY "staff_manage_Fee" ON school."Fee"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- TimeTable: only teachers/admins can manage + anon read
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_TimeTable" ON school."TimeTable";

CREATE POLICY "staff_manage_TimeTable" ON school."TimeTable"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- Allow anonymous read for public timetable page
DROP POLICY IF EXISTS "anon_read_TimeTable" ON school."TimeTable";
CREATE POLICY "anon_read_TimeTable" ON school."TimeTable"
  FOR SELECT TO anon
  USING (true);

-- ============================================================
-- IDCard table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_IDCard" ON school."IDCard";

CREATE POLICY "staff_manage_IDCard" ON school."IDCard"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- feedback table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_feedback" ON school."feedback";

CREATE POLICY "staff_manage_feedback" ON school."feedback"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- YearEndFeedback table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_YearEndFeedback" ON school."YearEndFeedback";

CREATE POLICY "staff_manage_YearEndFeedback" ON school."YearEndFeedback"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- InteractiveAssignment table: only teachers/admins can manage
-- ============================================================

DROP POLICY IF EXISTS "authenticated_write_InteractiveAssignment" ON school."InteractiveAssignment";

CREATE POLICY "staff_manage_InteractiveAssignment" ON school."InteractiveAssignment"
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'TEACHER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'TEACHER'));

-- ============================================================
-- Anon read for Class and Subject (for public timetable page)
-- ============================================================

DROP POLICY IF EXISTS "anon_read_Class" ON school."Class";
CREATE POLICY "anon_read_Class" ON school."Class"
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_read_Subject" ON school."Subject";
CREATE POLICY "anon_read_Subject" ON school."Subject"
  FOR SELECT TO anon
  USING (true);
