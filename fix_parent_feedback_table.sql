-- SQL script to fix the ParentSubmittedFeedback table structure

-- First, check if the table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'school'
        AND table_name = 'ParentSubmittedFeedback'
    ) INTO table_exists;

    IF NOT table_exists THEN
        -- Create the table if it doesn't exist
        EXECUTE '
        CREATE TABLE school."ParentSubmittedFeedback" (
            id UUID PRIMARY KEY,
            class_id UUID NOT NULL REFERENCES school."Class"(id),
            student_name TEXT NOT NULL,
            parent_name TEXT NOT NULL,
            month TEXT NOT NULL,
            feedback TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            status TEXT NOT NULL DEFAULT ''PENDING'' CHECK (status IN (''PENDING'', ''REVIEWED'', ''RESPONDED'')),
            
            -- Add a unique constraint to prevent duplicate entries
            UNIQUE(class_id, student_name, month)
        )';
        
        RAISE NOTICE 'Created ParentSubmittedFeedback table';
    ELSE
        RAISE NOTICE 'ParentSubmittedFeedback table already exists';
        
        -- Check if the feedback column exists
        DECLARE
            feedback_column_exists BOOLEAN;
        BEGIN
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'school'
                AND table_name = 'ParentSubmittedFeedback'
                AND column_name = 'feedback'
            ) INTO feedback_column_exists;
            
            IF NOT feedback_column_exists THEN
                -- Add the feedback column if it doesn't exist
                EXECUTE 'ALTER TABLE school."ParentSubmittedFeedback" ADD COLUMN feedback TEXT NOT NULL DEFAULT ''No feedback provided''';
                RAISE NOTICE 'Added missing feedback column';
            ELSE
                RAISE NOTICE 'Feedback column already exists';
            END IF;
        END;
    END IF;
END $$;

-- Enable Row Level Security on the table
ALTER TABLE school."ParentSubmittedFeedback" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS parent_feedback_select_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_insert_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_update_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_delete_auth_policy ON school."ParentSubmittedFeedback";

-- Create policy to allow anonymous users to select their own feedback
CREATE POLICY parent_feedback_select_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO anon
  USING (true);  -- Allow all anonymous users to view all feedback

-- Create policy to allow anonymous users to insert feedback
CREATE POLICY parent_feedback_insert_policy ON school."ParentSubmittedFeedback"
  FOR INSERT
  TO anon
  WITH CHECK (true);  -- Allow all anonymous users to insert feedback

-- Create policy to allow anonymous users to update their own feedback
CREATE POLICY parent_feedback_update_policy ON school."ParentSubmittedFeedback"
  FOR UPDATE
  TO anon
  USING (true)  -- Allow all anonymous users to update any feedback
  WITH CHECK (true);

-- Create policy to allow authenticated users to view all feedback
CREATE POLICY parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view all feedback

-- Create policy to allow authenticated users to update all feedback
CREATE POLICY parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback"
  FOR UPDATE
  TO authenticated
  USING (true)  -- Allow all authenticated users to update any feedback
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete feedback
CREATE POLICY parent_feedback_delete_auth_policy ON school."ParentSubmittedFeedback"
  FOR DELETE
  TO authenticated
  USING (true);  -- Allow all authenticated users to delete any feedback

-- Grant necessary permissions to the anon role
GRANT SELECT, INSERT, UPDATE ON school."ParentSubmittedFeedback" TO anon;

-- Grant necessary permissions to the authenticated role
GRANT ALL ON school."ParentSubmittedFeedback" TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Show the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'school'
AND table_name = 'ParentSubmittedFeedback'
ORDER BY ordinal_position;
