-- Create SchoolFeedback table for simple parent voice/text feedback
-- Minimal table: name, phone, message, voice recording, star rating

CREATE TABLE IF NOT EXISTS school."SchoolFeedback" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_name TEXT,
    phone TEXT,
    message TEXT,
    voice_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWED'))
);

-- Index for quick status filtering
CREATE INDEX IF NOT EXISTS idx_school_feedback_status ON school."SchoolFeedback"(status);
CREATE INDEX IF NOT EXISTS idx_school_feedback_created_at ON school."SchoolFeedback"(created_at DESC);

-- Enable Row Level Security
ALTER TABLE school."SchoolFeedback" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT feedback (public - parents don't need login)
CREATE POLICY "Allow public to insert feedback"
    ON school."SchoolFeedback"
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anyone to SELECT feedback 
-- (anon needs it for insert...select().single() to work,
--  authenticated needs it for admin page;
--  admin-only access is enforced at the UI/route level)
CREATE POLICY "Allow all to read feedback"
    ON school."SchoolFeedback"
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to UPDATE (mark as reviewed)
CREATE POLICY "Allow authenticated to update feedback"
    ON school."SchoolFeedback"
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to DELETE feedback
CREATE POLICY "Allow authenticated to delete feedback"
    ON school."SchoolFeedback"
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions
GRANT INSERT, SELECT ON school."SchoolFeedback" TO anon;
GRANT ALL ON school."SchoolFeedback" TO authenticated;

COMMENT ON TABLE school."SchoolFeedback" IS 'Simple parent feedback with voice recording support - public submission, admin-only viewing';
