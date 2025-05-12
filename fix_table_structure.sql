-- SQL script to fix the table structure if the 'feedback' column is missing

-- First, check if the feedback column exists
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'school'
        AND table_name = 'ParentSubmittedFeedback'
        AND column_name = 'feedback'
    ) INTO column_exists;

    -- If the column doesn't exist, add it
    IF NOT column_exists THEN
        EXECUTE 'ALTER TABLE school."ParentSubmittedFeedback" ADD COLUMN feedback TEXT NOT NULL DEFAULT ''No feedback provided''';
        RAISE NOTICE 'Added missing feedback column';
    ELSE
        RAISE NOTICE 'Feedback column already exists';
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the table structure again
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'school' 
AND table_name = 'ParentSubmittedFeedback'
ORDER BY ordinal_position;
