-- Migration script to transfer data from IDCard table to Student table
-- This script:
-- 1. Creates a function to generate random student IDs and admission numbers
-- 2. Inserts data from IDCard into Student table
-- 3. Handles existing students by updating their information

-- Create a function to generate a unique student ID
CREATE OR REPLACE FUNCTION generate_unique_student_id() RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random ID
    new_id := 'STU' || floor(random() * 100000)::TEXT;

    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM school."Student" WHERE id = new_id) INTO id_exists;

    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate a unique admission number
CREATE OR REPLACE FUNCTION generate_unique_admission_number() RETURNS TEXT AS $$
DECLARE
  new_admission TEXT;
  admission_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random admission number
    new_admission := 'ADM' || extract(year from current_date)::TEXT || floor(random() * 100000)::TEXT;

    -- Check if this admission number already exists
    SELECT EXISTS(SELECT 1 FROM school."Student" WHERE "admissionNumber" = new_admission) INTO admission_exists;

    -- Exit loop if admission number is unique
    EXIT WHEN NOT admission_exists;
  END LOOP;

  RETURN new_admission;
END;
$$ LANGUAGE plpgsql;

-- Begin transaction
BEGIN;

-- Create a temporary table to store the migration results
CREATE TEMP TABLE migration_results (
  student_name TEXT,
  class_id TEXT,
  action TEXT,
  student_id TEXT
);

-- Process each IDCard record
DO $$
DECLARE
  idcard_record RECORD;
  existing_student_id TEXT;
  new_student_id TEXT;
  new_admission_number TEXT;
BEGIN
  -- Loop through each record in the IDCard table
  FOR idcard_record IN SELECT * FROM school."IDCard" LOOP
    -- Check if a student with the same name and class already exists
    SELECT id INTO existing_student_id
    FROM school."Student"
    WHERE name = idcard_record.student_name
    AND "classId" = idcard_record.class_id
    LIMIT 1;

    -- Generate new IDs
    new_student_id := generate_unique_student_id();
    new_admission_number := generate_unique_admission_number();

    IF existing_student_id IS NOT NULL THEN
      -- Update existing student
      UPDATE school."Student"
      SET
        "dateOfBirth" = CASE
          WHEN idcard_record.date_of_birth IS NOT NULL THEN idcard_record.date_of_birth::TIMESTAMP
          ELSE "dateOfBirth"
        END,
        address = COALESCE(idcard_record.address, address),
        "contactNumber" = COALESCE(idcard_record.father_mobile, idcard_record.mother_mobile, "contactNumber"),
        "parentName" = COALESCE(idcard_record.father_name, idcard_record.mother_name, "parentName"),
        "parentContact" = COALESCE(idcard_record.father_mobile, idcard_record.mother_mobile, "parentContact"),
        "updatedAt" = NOW()
      WHERE id = existing_student_id;

      -- Record the update
      INSERT INTO migration_results (student_name, class_id, action, student_id)
      VALUES (idcard_record.student_name, idcard_record.class_id, 'UPDATED', existing_student_id);
    ELSE
      -- Insert new student
      INSERT INTO school."Student" (
        id,
        "admissionNumber",
        name,
        "dateOfBirth",
        gender,
        address,
        "contactNumber",
        "parentName",
        "parentContact",
        "parentEmail",
        "bloodGroup",
        "classId",
        "createdAt",
        "updatedAt"
      ) VALUES (
        new_student_id,
        new_admission_number,
        idcard_record.student_name,
        CASE
          WHEN idcard_record.date_of_birth IS NOT NULL THEN idcard_record.date_of_birth::TIMESTAMP
          ELSE NOW()
        END,
        'Not Specified',
        COALESCE(idcard_record.address, 'Not Specified'),
        COALESCE(idcard_record.father_mobile, idcard_record.mother_mobile, 'Not Specified'),
        COALESCE(idcard_record.father_name, idcard_record.mother_name, 'Not Specified'),
        COALESCE(idcard_record.father_mobile, idcard_record.mother_mobile, 'Not Specified'),
        'parent_' || REPLACE(LOWER(idcard_record.student_name), ' ', '.') || '@example.com',
        NULL,
        idcard_record.class_id,
        NOW(),
        NOW()
      );

      -- Record the insertion
      INSERT INTO migration_results (student_name, class_id, action, student_id)
      VALUES (idcard_record.student_name, idcard_record.class_id, 'INSERTED', new_student_id);
    END IF;
  END LOOP;
END $$;

-- Show migration results
SELECT action, COUNT(*) as count FROM migration_results GROUP BY action;

-- Show sample of migrated data
SELECT mr.action, mr.student_name, mr.class_id, s.*
FROM migration_results mr
JOIN school."Student" s ON mr.student_id = s.id
LIMIT 10;

-- Commit the transaction
COMMIT;

-- Drop the temporary functions
DROP FUNCTION IF EXISTS generate_unique_student_id();
DROP FUNCTION IF EXISTS generate_unique_admission_number();
