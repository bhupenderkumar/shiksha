-- Migration: Add isActive column to Student table
-- This allows marking students as active or inactive without deleting their records

-- Add isActive column with default value true (all existing students are active)
ALTER TABLE school."Student" 
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Create an index for faster filtering by active status
CREATE INDEX IF NOT EXISTS idx_student_isactive ON school."Student" ("isActive");

-- Optional: Create a composite index for class + active status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_student_class_isactive ON school."Student" ("classId", "isActive");

-- Add a comment for documentation
COMMENT ON COLUMN school."Student"."isActive" IS 'Indicates whether the student is currently active. Inactive students are hidden from most views but data is retained.';
