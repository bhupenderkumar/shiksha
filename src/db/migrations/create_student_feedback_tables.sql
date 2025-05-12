-- Create Student Feedback and Certificate tables
-- This migration adds tables for storing student feedback and certificates

-- Create StudentFeedback table
CREATE TABLE IF NOT EXISTS school."StudentFeedback" (
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

-- Create FeedbackCertificate table
CREATE TABLE IF NOT EXISTS school."FeedbackCertificate" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES school."StudentFeedback"(id),
    certificate_url TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_feedback_class_id ON school."StudentFeedback"(class_id);
CREATE INDEX IF NOT EXISTS idx_feedback_certificate_feedback_id ON school."FeedbackCertificate"(feedback_id);

-- Enable Row Level Security
ALTER TABLE school."StudentFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."FeedbackCertificate" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for StudentFeedback
-- Allow anyone to view feedback (public access)
CREATE POLICY "Allow public to view feedback" ON school."StudentFeedback"
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users with admin role to insert/update/delete
CREATE POLICY "Allow admins to manage feedback" ON school."StudentFeedback"
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
GRANT USAGE ON SCHEMA school TO anon, authenticated;
GRANT SELECT ON school."StudentFeedback" TO anon;
GRANT SELECT ON school."FeedbackCertificate" TO anon;
GRANT ALL ON school."StudentFeedback" TO authenticated;
GRANT ALL ON school."FeedbackCertificate" TO authenticated;
