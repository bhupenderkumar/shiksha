-- SQL script to check for existing data and insert a test record

-- First, let's check the data type and format of class_id in the Class table
SELECT id, name, pg_typeof(id) as id_type
FROM school."Class"
WHERE name LIKE '%CLS201%' OR id::text LIKE '%CLS201%'
LIMIT 10;

-- Let's also check if there's a class with ID 'CLS201' or similar
SELECT id, name
FROM school."Class"
LIMIT 10;

-- Now let's find the correct class_id for the student
-- Note: Using the correct case for classId (with capital I)
SELECT c.id as class_id, c.name as class_name, s.name as student_name
FROM school."Class" c
JOIN school."Student" s ON s."classId" = c.id
WHERE s.name = 'AVYUKT SURESH DHONI'
LIMIT 1;

-- Let's store the correct class_id in a variable
DO $$
DECLARE
    correct_class_id UUID;
    student_exists BOOLEAN;
BEGIN
    -- First check if the student exists and get their class_id
    SELECT EXISTS (
        SELECT 1 FROM school."Student"
        WHERE name = 'AVYUKT SURESH DHONI'
    ) INTO student_exists;

    IF student_exists THEN
        SELECT s."classId" INTO correct_class_id
        FROM school."Student" s
        WHERE s.name = 'AVYUKT SURESH DHONI'
        LIMIT 1;

        RAISE NOTICE 'Found student with class_id: %', correct_class_id;

        -- Check if there's any data for the specified student
        EXECUTE format('
            SELECT * FROM school."ParentSubmittedFeedback"
            WHERE class_id = %L
            AND student_name = %L
            AND month = %L',
            correct_class_id, 'AVYUKT SURESH DHONI', 'April'
        );

        -- Insert a test record if we have a valid class_id
        IF correct_class_id IS NOT NULL THEN
            EXECUTE format('
                INSERT INTO school."ParentSubmittedFeedback" (
                  id,
                  class_id,
                  student_name,
                  parent_name,
                  month,
                  feedback,
                  status
                )
                VALUES (
                  gen_random_uuid(),
                  %L,
                  %L,
                  %L,
                  %L,
                  %L,
                  %L
                )
                ON CONFLICT (class_id, student_name, month)
                DO NOTHING',
                correct_class_id, 'AVYUKT SURESH DHONI', 'Test Parent', 'April',
                'This is a test feedback to verify the API works correctly.', 'PENDING'
            );

            RAISE NOTICE 'Inserted test record with class_id: %', correct_class_id;
        ELSE
            RAISE NOTICE 'Could not find a valid class_id for the student';
        END IF;
    ELSE
        RAISE NOTICE 'Student "AVYUKT SURESH DHONI" not found in the database';

        -- Let's get a valid class_id to use
        SELECT id INTO correct_class_id
        FROM school."Class"
        LIMIT 1;

        IF correct_class_id IS NOT NULL THEN
            RAISE NOTICE 'Using class_id: % for test data', correct_class_id;

            -- Insert a test record with a valid class_id
            EXECUTE format('
                INSERT INTO school."ParentSubmittedFeedback" (
                  id,
                  class_id,
                  student_name,
                  parent_name,
                  month,
                  feedback,
                  status
                )
                VALUES (
                  gen_random_uuid(),
                  %L,
                  %L,
                  %L,
                  %L,
                  %L,
                  %L
                )
                ON CONFLICT (class_id, student_name, month)
                DO NOTHING',
                correct_class_id, 'AVYUKT SURESH DHONI', 'Test Parent', 'April',
                'This is a test feedback to verify the API works correctly.', 'PENDING'
            );

            RAISE NOTICE 'Inserted test record with class_id: %', correct_class_id;
        ELSE
            RAISE NOTICE 'No classes found in the database';
        END IF;
    END IF;
END $$;
