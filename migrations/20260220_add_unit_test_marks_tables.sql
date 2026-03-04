-- =====================================================
-- Unit Test Marks & Copy Request Tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Unit Test Marks Table
CREATE TABLE IF NOT EXISTS school."unit_test_marks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES school."Student"(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES school."Class"(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  exam_name TEXT NOT NULL DEFAULT 'Unit Test 4',
  writing_marks NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (writing_marks >= 0 AND writing_marks <= 15),
  oral_marks NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (oral_marks >= 0 AND oral_marks <= 5),
  total_marks NUMERIC(4,1) GENERATED ALWAYS AS (writing_marks + oral_marks) STORED,
  max_writing_marks NUMERIC(4,1) NOT NULL DEFAULT 15,
  max_oral_marks NUMERIC(4,1) NOT NULL DEFAULT 5,
  max_total_marks NUMERIC(4,1) NOT NULL DEFAULT 20,
  remarks TEXT,
  entered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject, exam_name)
);

-- 2. Copy Request Table (parents request to see unit test copy)
CREATE TABLE IF NOT EXISTS school."copy_requests" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES school."Student"(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES school."Class"(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  parent_contact TEXT NOT NULL,
  exam_name TEXT NOT NULL DEFAULT 'Unit Test 4',
  subject TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_unit_test_marks_student ON school."unit_test_marks"(student_id);
CREATE INDEX IF NOT EXISTS idx_unit_test_marks_class ON school."unit_test_marks"(class_id);
CREATE INDEX IF NOT EXISTS idx_unit_test_marks_exam ON school."unit_test_marks"(exam_name);
CREATE INDEX IF NOT EXISTS idx_unit_test_marks_class_exam ON school."unit_test_marks"(class_id, exam_name);

CREATE INDEX IF NOT EXISTS idx_copy_requests_student ON school."copy_requests"(student_id);
CREATE INDEX IF NOT EXISTS idx_copy_requests_class ON school."copy_requests"(class_id);
CREATE INDEX IF NOT EXISTS idx_copy_requests_status ON school."copy_requests"(status);

-- 4. Enable RLS
ALTER TABLE school."unit_test_marks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."copy_requests" ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for unit_test_marks
CREATE POLICY "Allow authenticated read unit_test_marks"
  ON school."unit_test_marks"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert unit_test_marks"
  ON school."unit_test_marks"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update unit_test_marks"
  ON school."unit_test_marks"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete unit_test_marks"
  ON school."unit_test_marks"
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. RLS Policies for copy_requests
CREATE POLICY "Allow anon read copy_requests"
  ON school."copy_requests"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon insert copy_requests"
  ON school."copy_requests"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update copy_requests"
  ON school."copy_requests"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete copy_requests"
  ON school."copy_requests"
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION school.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unit_test_marks_updated_at
  BEFORE UPDATE ON school."unit_test_marks"
  FOR EACH ROW
  EXECUTE FUNCTION school.update_updated_at_column();

CREATE TRIGGER update_copy_requests_updated_at
  BEFORE UPDATE ON school."copy_requests"
  FOR EACH ROW
  EXECUTE FUNCTION school.update_updated_at_column();
