-- Migration: Add AdmissionTestResult table
-- Date: 2026-03-04
-- Description: Stores results of admission tests taken by prospective students

CREATE TABLE IF NOT EXISTS school."AdmissionTestResult" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentName" TEXT NOT NULL,
  "classLevel" TEXT NOT NULL CHECK ("classLevel" IN ('pre-nursery', 'nursery', 'kg', 'class-1')),
  "totalQuestions" INTEGER NOT NULL,
  "correctAnswers" INTEGER NOT NULL,
  "percentage" INTEGER NOT NULL,
  "timeTaken" INTEGER NOT NULL, -- in seconds
  "answers" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "prospectiveStudentId" TEXT REFERENCES school."ProspectiveStudent"(id) ON DELETE SET NULL,
  "conductedBy" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for listing/filtering
CREATE INDEX IF NOT EXISTS idx_admission_test_result_class_level
  ON school."AdmissionTestResult" ("classLevel");

CREATE INDEX IF NOT EXISTS idx_admission_test_result_created_at
  ON school."AdmissionTestResult" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_admission_test_result_student_name
  ON school."AdmissionTestResult" ("studentName");

-- Enable RLS
ALTER TABLE school."AdmissionTestResult" ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (test is public)
CREATE POLICY "Anyone can insert test results"
  ON school."AdmissionTestResult"
  FOR INSERT
  WITH CHECK (true);

-- Policy: authenticated users can read
CREATE POLICY "Authenticated users can read test results"
  ON school."AdmissionTestResult"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Grant table-level permissions
GRANT INSERT, SELECT ON school."AdmissionTestResult" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."AdmissionTestResult" TO authenticated;
