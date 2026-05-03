-- Track public-page views of monthly remarks reports.
-- Anyone (anon) can INSERT a view; only authenticated users can SELECT counts.

CREATE TABLE IF NOT EXISTS school."MonthlyRemarksView" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id uuid NOT NULL REFERENCES school."MonthlyRemarksRegister"(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  referrer text,
  -- coarse client fingerprint (random ID stored in localStorage); never PII
  client_id text
);

CREATE INDEX IF NOT EXISTS idx_mrv_register_id_viewed_at
  ON school."MonthlyRemarksView" (register_id, viewed_at DESC);

ALTER TABLE school."MonthlyRemarksView" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mrv_insert_anon ON school."MonthlyRemarksView";
CREATE POLICY mrv_insert_anon ON school."MonthlyRemarksView"
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS mrv_select_auth ON school."MonthlyRemarksView";
CREATE POLICY mrv_select_auth ON school."MonthlyRemarksView"
  FOR SELECT TO authenticated
  USING (true);

GRANT INSERT ON school."MonthlyRemarksView" TO anon, authenticated;
GRANT SELECT ON school."MonthlyRemarksView" TO authenticated;
