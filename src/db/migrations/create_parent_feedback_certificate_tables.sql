-- Create Parent Feedback and Certificate tables
-- This migration adds tables for storing student feedback and certificates that can be viewed by parents

-- Create ParentFeedback table
CREATE TABLE IF NOT EXISTS school."ParentFeedback" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES school."Class"(id),
    student_name TEXT NOT NULL,
    month TEXT NOT NULL,
    good_things TEXT,
    need_to_improve TEXT,
    best_can_do TEXT,
    attendance_percentage NUMERIC,
    student_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_feedback_class_id ON school."ParentFeedback"(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_student_name ON school."ParentFeedback"(student_name);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_month ON school."ParentFeedback"(month);

-- Create FeedbackCertificate table
CREATE TABLE IF NOT EXISTS school."FeedbackCertificate" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES school."ParentFeedback"(id) ON DELETE CASCADE,
    certificate_url TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_certificate_feedback_id ON school."FeedbackCertificate"(feedback_id);

-- Add comments to tables
COMMENT ON TABLE school."ParentFeedback" IS 'Stores student feedback information for parents to view';
COMMENT ON TABLE school."FeedbackCertificate" IS 'Stores certificate information related to student feedback';

-- Create RLS policies for ParentFeedback

-- Allow anyone to view feedback (public access)
CREATE POLICY "Allow public to view feedback" ON school."ParentFeedback"
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users with admin role to insert/update/delete
CREATE POLICY "Allow admins to manage feedback" ON school."ParentFeedback"
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role = 'ADMIN'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role = 'ADMIN'
        )
    );

-- Create RLS policies for FeedbackCertificate
-- Allow anyone to view certificates (public access)
CREATE POLICY "Allow public to view certificates" ON school."FeedbackCertificate"
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users with admin role to insert/update/delete
CREATE POLICY "Allow admins to manage certificates" ON school."FeedbackCertificate"
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role = 'ADMIN'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role = 'ADMIN'
        )
    );

-- Grant necessary permissions
GRANT SELECT ON school."ParentFeedback" TO anon;
GRANT SELECT ON school."FeedbackCertificate" TO anon;

GRANT ALL ON school."ParentFeedback" TO authenticated;
GRANT ALL ON school."FeedbackCertificate" TO authenticated;

-- Enable RLS on tables
ALTER TABLE school."ParentFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."FeedbackCertificate" ENABLE ROW LEVEL SECURITY;
