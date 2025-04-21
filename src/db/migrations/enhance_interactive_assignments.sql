-- Add new assignment types to the InteractiveAssignmentType enum
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'SORTING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'HANDWRITING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'LETTER_TRACING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'NUMBER_RECOGNITION';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'PICTURE_WORD_MATCHING';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'PATTERN_COMPLETION';
ALTER TYPE school."InteractiveAssignmentType" ADD VALUE IF NOT EXISTS 'CATEGORIZATION';

-- Add child-friendly features to InteractiveAssignment table
ALTER TABLE school."InteractiveAssignment" 
ADD COLUMN IF NOT EXISTS audio_instructions TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS has_audio_feedback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_celebration BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('nursery', 'lkg', 'ukg', 'elementary')),
ADD COLUMN IF NOT EXISTS requires_parent_help BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shareable_link TEXT,
ADD COLUMN IF NOT EXISTS shareable_link_expires_at TIMESTAMP WITH TIME ZONE;

-- Create a table for student progress analytics
CREATE TABLE IF NOT EXISTS school."StudentProgressAnalytics" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES school."Student"(id),
    assignment_type TEXT NOT NULL,
    assignments_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    average_time_spent INTEGER DEFAULT 0, -- in seconds
    strengths TEXT[],
    areas_for_improvement TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, assignment_type)
);

-- Create a table for tracking assignment completion milestones
CREATE TABLE IF NOT EXISTS school."CompletionMilestone" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES school."Student"(id),
    milestone_type TEXT NOT NULL, -- e.g., 'first_matching', 'ten_assignments', etc.
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assignment_id TEXT REFERENCES school."InteractiveAssignment"(id),
    badge_awarded TEXT,
    UNIQUE(student_id, milestone_type)
);

-- Create a table for teacher feedback templates
CREATE TABLE IF NOT EXISTS school."FeedbackTemplate" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_text TEXT NOT NULL,
    assignment_type TEXT,
    performance_level TEXT CHECK (performance_level IN ('excellent', 'good', 'average', 'needs_improvement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, template_name)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_analytics_student ON school."StudentProgressAnalytics"(student_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_type ON school."StudentProgressAnalytics"(assignment_type);
CREATE INDEX IF NOT EXISTS idx_completion_milestone_student ON school."CompletionMilestone"(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_template_teacher ON school."FeedbackTemplate"(teacher_id);

-- Enable Row Level Security
ALTER TABLE school."StudentProgressAnalytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."CompletionMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."FeedbackTemplate" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY student_analytics_select_policy ON school."StudentProgressAnalytics"
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        student_id IN (
            SELECT id FROM school."Student" WHERE user_id = auth.uid()
        )
    );

CREATE POLICY completion_milestone_select_policy ON school."CompletionMilestone"
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        student_id IN (
            SELECT id FROM school."Student" WHERE user_id = auth.uid()
        )
    );

CREATE POLICY feedback_template_select_policy ON school."FeedbackTemplate"
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM school."Profile" WHERE role IN ('ADMIN', 'TEACHER')
        ) OR
        teacher_id = auth.uid()
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON school."StudentProgressAnalytics" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON school."CompletionMilestone" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."FeedbackTemplate" TO authenticated;
