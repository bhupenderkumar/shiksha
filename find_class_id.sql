-- SQL script to find the correct class ID and insert a test record

-- First, let's check the data type of the class_id column
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'school'
AND table_name = 'Class'
AND column_name = 'id';

-- Let's check the structure of the ParentSubmittedFeedback table to see all required columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'school'
AND table_name = 'ParentSubmittedFeedback'
ORDER BY ordinal_position;

-- Let's look at some sample class data to understand the format
SELECT id, name, section
FROM school."Class"
LIMIT 10;

-- Let's try to find a class with a name or ID similar to 'CLS201'
SELECT id, name, section
FROM school."Class"
WHERE name LIKE '%CLS201%' OR name LIKE '%201%' OR id::text LIKE '%201%'
LIMIT 10;

-- Let's find the student 'AVYUKT SURESH DHONI' and their class
SELECT s.name as student_name, s."classId" as class_id, c.name as class_name, c.section
FROM school."Student" s
LEFT JOIN school."Class" c ON s."classId" = c.id
WHERE s.name = 'AVYUKT SURESH DHONI'
LIMIT 1;

-- If we can't find the specific student, let's get any student as an example
SELECT s.name as student_name, s."classId" as class_id, c.name as class_name, c.section
FROM school."Student" s
LEFT JOIN school."Class" c ON s."classId" = c.id
LIMIT 10;

-- Now let's get a valid class ID to use for our test
DO $$
DECLARE
    valid_class_id UUID;
    valid_student_name TEXT;
BEGIN
    -- Try to find the specific student first
    SELECT s."classId", s.name INTO valid_class_id, valid_student_name
    FROM school."Student" s
    WHERE s.name = 'AVYUKT SURESH DHONI'
    LIMIT 1;

    -- If not found, get any student
    IF valid_class_id IS NULL THEN
        SELECT s."classId", s.name INTO valid_class_id, valid_student_name
        FROM school."Student" s
        LIMIT 1;
    END IF;

    -- If we found a valid class ID, use it
    IF valid_class_id IS NOT NULL THEN
        RAISE NOTICE 'Found valid class ID: % for student: %', valid_class_id, valid_student_name;

        -- Check if there's any existing feedback for this student
        RAISE NOTICE 'Checking for existing feedback...';
        PERFORM *
        FROM school."ParentSubmittedFeedback"
        WHERE class_id = valid_class_id
        AND student_name = valid_student_name
        AND month = 'April';

        -- Insert a test record
        RAISE NOTICE 'Inserting test feedback record...';
        INSERT INTO school."ParentSubmittedFeedback" (
            id,
            class_id,
            student_name,
            parent_name,
            parent_relation,
            month,
            feedback,
            status
        )
        VALUES (
            gen_random_uuid(),
            valid_class_id,
            valid_student_name,
            'Test Parent',
            'Father',  -- Adding parent_relation value
            'April',
            'This is a test feedback to verify the API works correctly.',
            'PENDING'
        )
        ON CONFLICT (class_id, student_name, month)
        DO UPDATE SET
            parent_name = 'Test Parent (Updated)',
            parent_relation = 'Father',  -- Adding parent_relation value
            feedback = 'This is an updated test feedback.',
            updated_at = NOW();

        RAISE NOTICE 'Test record inserted or updated successfully.';

        -- Show the inserted/updated record
        RAISE NOTICE 'Retrieving the feedback record...';
        PERFORM *
        FROM school."ParentSubmittedFeedback"
        WHERE class_id = valid_class_id
        AND student_name = valid_student_name
        AND month = 'April';
    ELSE
        RAISE NOTICE 'Could not find any valid class ID. Please check your database.';
    END IF;
END $$;
