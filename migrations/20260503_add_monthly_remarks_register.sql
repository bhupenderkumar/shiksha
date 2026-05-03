-- ============================================================================
-- Monthly Class Remarks Register
-- Used to publish per-class, per-month student feedback (remarks register)
-- These students are NOT linked to the main Student table — many of them
-- only attend for a few weeks. So we keep their identity inline (name + roll).
-- ============================================================================

-- Register: one row per (class_name, month, academic_year)
CREATE TABLE IF NOT EXISTS school."MonthlyRemarksRegister" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,                -- e.g. "Pre Nursery", "Nursery", "LKG", "UKG", "Class I", "Class II"
  section TEXT,                            -- optional section label e.g. "DELTA"
  month TEXT NOT NULL,                     -- "April", "May", ...
  academic_year TEXT NOT NULL,             -- e.g. "2026-27"
  total_present_days INT,                  -- total working days in this month
  page_label TEXT,                         -- the small "DELTA (Pg No.)" caption
  notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  share_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT uq_remarks_register UNIQUE (class_name, month, academic_year)
);

-- Entry: one row per child within a register
CREATE TABLE IF NOT EXISTS school."MonthlyRemarksEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id UUID NOT NULL REFERENCES school."MonthlyRemarksRegister"(id) ON DELETE CASCADE,
  serial_no INT NOT NULL DEFAULT 1,        -- # column shown in the table (1, 2, 3...)
  student_name TEXT NOT NULL,
  roll_no TEXT,                            -- displayed under name; nullable (use "—" client-side)
  attendance_days INT,                     -- days present this month (optional)
  remarks TEXT NOT NULL DEFAULT '',
  student_photo_url TEXT,                  -- optional avatar shown in the report
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remarks_entry_register_id
  ON school."MonthlyRemarksEntry"(register_id);

CREATE INDEX IF NOT EXISTS idx_remarks_register_class_month
  ON school."MonthlyRemarksRegister"(class_name, month, academic_year);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION school.set_updated_at_remarks() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_remarks_register_updated_at ON school."MonthlyRemarksRegister";
CREATE TRIGGER trg_remarks_register_updated_at
  BEFORE UPDATE ON school."MonthlyRemarksRegister"
  FOR EACH ROW EXECUTE FUNCTION school.set_updated_at_remarks();

DROP TRIGGER IF EXISTS trg_remarks_entry_updated_at ON school."MonthlyRemarksEntry";
CREATE TRIGGER trg_remarks_entry_updated_at
  BEFORE UPDATE ON school."MonthlyRemarksEntry"
  FOR EACH ROW EXECUTE FUNCTION school.set_updated_at_remarks();

-- ----------------------------------------------------------------------------
-- Permissions: anon can read published registers; only authenticated can write.
-- ----------------------------------------------------------------------------
ALTER TABLE school."MonthlyRemarksRegister" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."MonthlyRemarksEntry"    ENABLE ROW LEVEL SECURITY;

-- Public read of published registers
DROP POLICY IF EXISTS "remarks_register_public_read" ON school."MonthlyRemarksRegister";
CREATE POLICY "remarks_register_public_read"
  ON school."MonthlyRemarksRegister"
  FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "remarks_register_auth_all" ON school."MonthlyRemarksRegister";
CREATE POLICY "remarks_register_auth_all"
  ON school."MonthlyRemarksRegister"
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Public read of entries belonging to a published register
DROP POLICY IF EXISTS "remarks_entry_public_read" ON school."MonthlyRemarksEntry";
CREATE POLICY "remarks_entry_public_read"
  ON school."MonthlyRemarksEntry"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school."MonthlyRemarksRegister" r
      WHERE r.id = register_id AND r.is_published = TRUE
    )
  );

DROP POLICY IF EXISTS "remarks_entry_auth_all" ON school."MonthlyRemarksEntry";
CREATE POLICY "remarks_entry_auth_all"
  ON school."MonthlyRemarksEntry"
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Make sure schema/tables are visible to anon + authenticated roles
GRANT USAGE ON SCHEMA school TO anon, authenticated;
GRANT SELECT ON school."MonthlyRemarksRegister" TO anon;
GRANT SELECT ON school."MonthlyRemarksEntry"    TO anon;
GRANT ALL    ON school."MonthlyRemarksRegister" TO authenticated;
GRANT ALL    ON school."MonthlyRemarksEntry"    TO authenticated;
