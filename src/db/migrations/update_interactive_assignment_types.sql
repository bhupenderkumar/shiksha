-- Update the InteractiveAssignmentType enum to include new types
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'TRACING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'AUDIO_READING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'COUNTING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'IDENTIFICATION';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'PUZZLE';

-- Create a new table for tracking student progress
CREATE TABLE IF NOT EXISTS school."StudentProgress" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES school."Student"(id),
    assignment_id TEXT NOT NULL REFERENCES school."InteractiveAssignment"(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    time_spent INTEGER, -- in seconds
    attempts INTEGER DEFAULT 1,
    status TEXT DEFAULT 'IN_PROGRESS',
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, assignment_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON school."StudentProgress"(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_assignment ON school."StudentProgress"(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON school."StudentProgress"(status);

-- Enable Row Level Security
ALTER TABLE school."StudentProgress" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY student_progress_select_policy ON school."StudentProgress"
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        student_id IN (
            SELECT id FROM school."Student" WHERE user_id = auth.uid()
        )
    );

CREATE POLICY student_progress_insert_policy ON school."StudentProgress"
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        student_id IN (
            SELECT id FROM school."Student" WHERE user_id = auth.uid()
        )
    );

CREATE POLICY student_progress_update_policy ON school."StudentProgress"
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        student_id IN (
            SELECT id FROM school."Student" WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON school."StudentProgress" TO authenticated;
GRANT USAGE ON SEQUENCE school."StudentProgress_id_seq" TO authenticated;
