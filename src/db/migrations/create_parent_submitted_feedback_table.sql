-- Create Parent Submitted Feedback table
-- This migration adds a table for storing feedback submitted by parents

-- Create ParentSubmittedFeedback table
CREATE TABLE IF NOT EXISTS school."ParentSubmittedFeedback" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id TEXT NOT NULL REFERENCES school."Class"(id),
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    month TEXT NOT NULL,
    feedback TEXT NOT NULL, -- Parent's feedback about child's progress
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING' -- PENDING, REVIEWED, RESPONDED
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_submitted_feedback_class_id ON school."ParentSubmittedFeedback"(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_submitted_feedback_student_name ON school."ParentSubmittedFeedback"(student_name);
CREATE INDEX IF NOT EXISTS idx_parent_submitted_feedback_month ON school."ParentSubmittedFeedback"(month);
CREATE INDEX IF NOT EXISTS idx_parent_submitted_feedback_status ON school."ParentSubmittedFeedback"(status);

-- Add comments to tables
COMMENT ON TABLE school."ParentSubmittedFeedback" IS 'Stores feedback submitted by parents about their children';

-- Create RLS policies for ParentSubmittedFeedback

-- Allow anyone to insert feedback (public access for submission)
CREATE POLICY "Allow public to submit feedback" ON school."ParentSubmittedFeedback"
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow authenticated users with admin role to view/update/delete
CREATE POLICY "Allow admins to manage parent submitted feedback" ON school."ParentSubmittedFeedback"
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

-- Allow public to view their own submitted feedback using a secret token
-- This would require adding a token column and implementing token-based verification
-- For now, we'll rely on the admin interface to share responses with parents
