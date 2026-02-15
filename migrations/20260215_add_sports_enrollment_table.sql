-- Migration: Add SportsEnrollment table for Annual Sports Week 2026
-- Created: 2026-02-15

CREATE TABLE IF NOT EXISTS school."SportsEnrollment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentName" TEXT NOT NULL,
  "parentName" TEXT NOT NULL,
  "contactNumber" TEXT NOT NULL,
  "classId" TEXT REFERENCES school."Class"(id),
  "className" TEXT NOT NULL,
  "selectedGames" TEXT[] DEFAULT '{}',
  "specialNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ENROLLED',
  "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sports_enrollment_class ON school."SportsEnrollment"("classId");
CREATE INDEX IF NOT EXISTS idx_sports_enrollment_status ON school."SportsEnrollment"("status");

-- Enable RLS
ALTER TABLE school."SportsEnrollment" ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (parents don't need to be logged in)
CREATE POLICY "Allow public insert on SportsEnrollment"
  ON school."SportsEnrollment"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public read (for checking enrollment)
CREATE POLICY "Allow public read on SportsEnrollment"
  ON school."SportsEnrollment"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant table-level permissions (required in addition to RLS policies)
GRANT USAGE ON SCHEMA school TO anon;
GRANT USAGE ON SCHEMA school TO authenticated;
GRANT INSERT, SELECT ON school."SportsEnrollment" TO anon;
GRANT ALL ON school."SportsEnrollment" TO authenticated;
