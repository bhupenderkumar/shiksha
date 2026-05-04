-- Extend SchoolFeedback to support a parent-trackable complaint flow:
--   * ticket_code  : short human-readable code parents save to look up status
--   * category     : optional classification (Complaint / Suggestion / Appreciation / Other)
--   * admin_reply  : reply text written by school staff
--   * replied_at   : timestamp of reply
--   * replied_by   : staff name (or user id) who replied
-- Also extends the status check to allow 'REPLIED'.

ALTER TABLE school."SchoolFeedback"
    ADD COLUMN IF NOT EXISTS ticket_code TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS admin_reply TEXT,
    ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS replied_by TEXT;

-- Backfill ticket_code for any existing rows (best-effort short code derived from id)
UPDATE school."SchoolFeedback"
SET ticket_code = 'FB-' || UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 6))
WHERE ticket_code IS NULL;

-- Make ticket_code unique going forward
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_feedback_ticket_code
    ON school."SchoolFeedback"(ticket_code);

-- Update status CHECK to permit 'REPLIED'
ALTER TABLE school."SchoolFeedback"
    DROP CONSTRAINT IF EXISTS "SchoolFeedback_status_check";

ALTER TABLE school."SchoolFeedback"
    ADD CONSTRAINT "SchoolFeedback_status_check"
    CHECK (status IN ('NEW', 'REVIEWED', 'REPLIED'));

COMMENT ON COLUMN school."SchoolFeedback".ticket_code IS 'Short code shown to parent so they can check status without login';
COMMENT ON COLUMN school."SchoolFeedback".admin_reply IS 'Reply written by school staff, visible to parent via ticket lookup';
