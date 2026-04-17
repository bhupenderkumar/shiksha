-- Migration: Fix RLS policies for AI planning tables
-- The new tables need proper GRANT + policies matching the existing pattern

-- ===== 1. GRANT table access to authenticated and anon roles =====

GRANT SELECT, INSERT, UPDATE, DELETE ON school."Syllabus" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."SyllabusItem" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."SyllabusProgress" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."NextDayPlan" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."NextDayPlanItem" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."AiFlag" TO authenticated;

-- Anon read access for shared/public views
GRANT SELECT ON school."Syllabus" TO anon;
GRANT SELECT ON school."SyllabusItem" TO anon;
GRANT SELECT ON school."SyllabusProgress" TO anon;
GRANT SELECT ON school."NextDayPlan" TO anon;
GRANT SELECT ON school."NextDayPlanItem" TO anon;
GRANT SELECT ON school."AiFlag" TO anon;

-- ===== 2. Drop old generic policies and create proper ones =====

-- Syllabus
DROP POLICY IF EXISTS "Authenticated access" ON school."Syllabus";
DROP POLICY IF EXISTS "authenticated_read_Syllabus" ON school."Syllabus";
DROP POLICY IF EXISTS "authenticated_write_Syllabus" ON school."Syllabus";
CREATE POLICY "authenticated_read_Syllabus" ON school."Syllabus" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_Syllabus" ON school."Syllabus" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SyllabusItem
DROP POLICY IF EXISTS "Authenticated access" ON school."SyllabusItem";
DROP POLICY IF EXISTS "authenticated_read_SyllabusItem" ON school."SyllabusItem";
DROP POLICY IF EXISTS "authenticated_write_SyllabusItem" ON school."SyllabusItem";
CREATE POLICY "authenticated_read_SyllabusItem" ON school."SyllabusItem" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_SyllabusItem" ON school."SyllabusItem" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SyllabusProgress
DROP POLICY IF EXISTS "Authenticated access" ON school."SyllabusProgress";
DROP POLICY IF EXISTS "authenticated_read_SyllabusProgress" ON school."SyllabusProgress";
DROP POLICY IF EXISTS "authenticated_write_SyllabusProgress" ON school."SyllabusProgress";
CREATE POLICY "authenticated_read_SyllabusProgress" ON school."SyllabusProgress" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_SyllabusProgress" ON school."SyllabusProgress" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NextDayPlan
DROP POLICY IF EXISTS "Authenticated access" ON school."NextDayPlan";
DROP POLICY IF EXISTS "authenticated_read_NextDayPlan" ON school."NextDayPlan";
DROP POLICY IF EXISTS "authenticated_write_NextDayPlan" ON school."NextDayPlan";
CREATE POLICY "authenticated_read_NextDayPlan" ON school."NextDayPlan" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_NextDayPlan" ON school."NextDayPlan" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NextDayPlanItem
DROP POLICY IF EXISTS "Authenticated access" ON school."NextDayPlanItem";
DROP POLICY IF EXISTS "authenticated_read_NextDayPlanItem" ON school."NextDayPlanItem";
DROP POLICY IF EXISTS "authenticated_write_NextDayPlanItem" ON school."NextDayPlanItem";
CREATE POLICY "authenticated_read_NextDayPlanItem" ON school."NextDayPlanItem" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_NextDayPlanItem" ON school."NextDayPlanItem" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AiFlag
DROP POLICY IF EXISTS "Authenticated access" ON school."AiFlag";
DROP POLICY IF EXISTS "authenticated_read_AiFlag" ON school."AiFlag";
DROP POLICY IF EXISTS "authenticated_write_AiFlag" ON school."AiFlag";
CREATE POLICY "authenticated_read_AiFlag" ON school."AiFlag" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_AiFlag" ON school."AiFlag" FOR ALL TO authenticated USING (true) WITH CHECK (true);
