-- Migration: 20260416_add_ai_planning_syllabus.sql
-- AI-Powered Next Day Planning & Syllabus Management
-- NOTE: All existing tables use TEXT ids, so new tables must match.

-- ===== 1. SYLLABUS TABLES =====

CREATE TABLE school."Syllabus" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "classId" TEXT NOT NULL REFERENCES school."Class"(id),
  "subjectId" TEXT NOT NULL REFERENCES school."Subject"(id),
  "academicYear" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'archived')),
  "approvedBy" TEXT REFERENCES school."Profile"(id),
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "subjectId", "academicYear")
);

CREATE TABLE school."SyllabusItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "syllabusId" TEXT NOT NULL REFERENCES school."Syllabus"(id) ON DELETE CASCADE,
  "chapterNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "learningObjectives" TEXT[],
  "estimatedDays" INTEGER DEFAULT 5,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE school."SyllabusProgress" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "syllabusItemId" TEXT NOT NULL REFERENCES school."SyllabusItem"(id) ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES school."Class"(id),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  "startedDate" DATE,
  "completedDate" DATE,
  "actualDays" INTEGER,
  notes TEXT,
  "updatedBy" TEXT REFERENCES school."Profile"(id),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("syllabusItemId", "classId")
);

-- ===== 2. NEXT DAY PLAN TABLES =====

CREATE TABLE school."NextDayPlan" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "classId" TEXT NOT NULL REFERENCES school."Class"(id),
  "planDate" DATE NOT NULL,
  "generatedAt" TIMESTAMPTZ,
  "editedAt" TIMESTAMPTZ,
  "editedBy" TEXT REFERENCES school."Profile"(id),
  status TEXT NOT NULL DEFAULT 'ai_generated'
    CHECK (status IN ('ai_generated', 'teacher_edited', 'finalized', 'materialized')),
  "materialized" BOOLEAN NOT NULL DEFAULT false,
  "materializedAt" TIMESTAMPTZ,
  "aiRawResponse" JSONB,
  "dayScore" INTEGER,
  "dayFeedback" TEXT,
  "improvements" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "planDate")
);

CREATE TABLE school."NextDayPlanItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "planId" TEXT NOT NULL REFERENCES school."NextDayPlan"(id) ON DELETE CASCADE,
  "subjectId" TEXT NOT NULL REFERENCES school."Subject"(id),
  "syllabusItemId" TEXT REFERENCES school."SyllabusItem"(id),
  "chapterName" TEXT,
  "oralWork" TEXT,
  "oralDetails" TEXT,
  "writingWork" TEXT,
  "writingDetails" TEXT,
  "homeworkTitle" TEXT,
  "homeworkDescription" TEXT,
  "homeworkDueDate" DATE,
  "aiRationale" TEXT,
  "teacherNotes" TEXT,
  "carryForward" BOOLEAN DEFAULT false,
  "carryForwardReason" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "subjectScore" INTEGER,
  "subjectFeedback" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 3. AI FLAGS TABLE =====

CREATE TABLE school."AiFlag" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "classId" TEXT NOT NULL REFERENCES school."Class"(id),
  "planId" TEXT REFERENCES school."NextDayPlan"(id),
  "subjectId" TEXT REFERENCES school."Subject"(id),
  "syllabusItemId" TEXT REFERENCES school."SyllabusItem"(id),
  "flagType" TEXT NOT NULL
    CHECK ("flagType" IN (
      'behind_schedule', 'ahead_of_schedule', 'gap_detected',
      'festival_upcoming', 'improvement_needed', 'revision_suggested',
      'balance_alert', 'content_mismatch', 'errors_in_work', 'incomplete_work'
    )),
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  "suggestedAction" TEXT,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMPTZ,
  "resolvedBy" TEXT REFERENCES school."Profile"(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 4. EXTEND EXISTING TABLES =====

ALTER TABLE school."Classwork"
  ADD COLUMN IF NOT EXISTS "workType" TEXT DEFAULT 'writing'
    CHECK ("workType" IN ('oral', 'writing')),
  ADD COLUMN IF NOT EXISTS "chapterName" TEXT,
  ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES school."Subject"(id),
  ADD COLUMN IF NOT EXISTS "syllabusItemId" TEXT REFERENCES school."SyllabusItem"(id),
  ADD COLUMN IF NOT EXISTS "completionStatus" TEXT DEFAULT 'manual'
    CHECK ("completionStatus" IN ('planned', 'in_progress', 'completed', 'skipped', 'manual')),
  ADD COLUMN IF NOT EXISTS "sourcePlanItemId" TEXT,
  ADD COLUMN IF NOT EXISTS "photoValidation" JSONB;

ALTER TABLE school."Homework"
  ADD COLUMN IF NOT EXISTS "syllabusItemId" TEXT REFERENCES school."SyllabusItem"(id),
  ADD COLUMN IF NOT EXISTS "chapterName" TEXT,
  ADD COLUMN IF NOT EXISTS "sourcePlanItemId" TEXT,
  ADD COLUMN IF NOT EXISTS "photoValidation" JSONB;

ALTER TABLE school."File"
  ADD COLUMN IF NOT EXISTS "syllabusId" TEXT REFERENCES school."Syllabus"(id);

-- Add FK for sourcePlanItemId after NextDayPlanItem table exists
ALTER TABLE school."Classwork"
  ADD CONSTRAINT fk_classwork_plan_item
  FOREIGN KEY ("sourcePlanItemId") REFERENCES school."NextDayPlanItem"(id);

ALTER TABLE school."Homework"
  ADD CONSTRAINT fk_homework_plan_item
  FOREIGN KEY ("sourcePlanItemId") REFERENCES school."NextDayPlanItem"(id);

-- ===== 5. ENABLE RLS =====

ALTER TABLE school."Syllabus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."NextDayPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."NextDayPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."AiFlag" ENABLE ROW LEVEL SECURITY;

-- ===== 6. RLS POLICIES =====

CREATE POLICY "Authenticated access" ON school."Syllabus" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."SyllabusItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."SyllabusProgress" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."NextDayPlan" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."NextDayPlanItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."AiFlag" FOR ALL USING (true) WITH CHECK (true);

-- ===== 7. INDEXES =====

CREATE INDEX idx_syllabus_class_subject ON school."Syllabus"("classId", "subjectId");
CREATE INDEX idx_syllabus_progress_item ON school."SyllabusProgress"("syllabusItemId");
CREATE INDEX idx_next_day_plan_class_date ON school."NextDayPlan"("classId", "planDate");
CREATE INDEX idx_ai_flag_class ON school."AiFlag"("classId", "isResolved");
CREATE INDEX idx_classwork_subject ON school."Classwork"("subjectId");
CREATE INDEX idx_classwork_syllabus_item ON school."Classwork"("syllabusItemId");
CREATE INDEX idx_classwork_plan_item ON school."Classwork"("sourcePlanItemId");
CREATE INDEX idx_classwork_date ON school."Classwork"(date);
CREATE INDEX idx_classwork_status ON school."Classwork"("completionStatus");
CREATE INDEX idx_homework_plan_item ON school."Homework"("sourcePlanItemId");
CREATE INDEX idx_homework_syllabus_item ON school."Homework"("syllabusItemId");
