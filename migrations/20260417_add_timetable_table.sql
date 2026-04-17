-- Migration: Create TimeTable table for class schedules
-- Used by AI Planner to know which subjects are scheduled on which day

CREATE TABLE IF NOT EXISTS school."TimeTable" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "classId" TEXT NOT NULL REFERENCES school."Class"(id) ON DELETE CASCADE,
  "subjectId" TEXT NOT NULL REFERENCES school."Subject"(id) ON DELETE CASCADE,
  "day" INTEGER NOT NULL CHECK ("day" >= 0 AND "day" <= 6),  -- 0=Sunday, 6=Saturday
  "startTime" TEXT NOT NULL,  -- e.g. '09:00'
  "endTime" TEXT NOT NULL,    -- e.g. '09:45'
  "periodNumber" INTEGER NOT NULL DEFAULT 1,
  "teacherName" TEXT,
  "room" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "day", "periodNumber")
);

-- Enable RLS
ALTER TABLE school."TimeTable" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "authenticated_read_TimeTable" ON school."TimeTable";
DROP POLICY IF EXISTS "authenticated_write_TimeTable" ON school."TimeTable";
CREATE POLICY "authenticated_read_TimeTable" ON school."TimeTable" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_TimeTable" ON school."TimeTable" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON school."TimeTable" TO authenticated;
GRANT SELECT ON school."TimeTable" TO anon;
