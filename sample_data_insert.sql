-- Function to generate dates in the past year
CREATE OR REPLACE FUNCTION generate_past_dates(start_date date, num_dates integer)
RETURNS TABLE(generated_date timestamp) AS $$
BEGIN
    RETURN QUERY
    SELECT (start_date - (n || ' days')::interval)::timestamp
    FROM generate_series(0, num_dates-1) n;
END;
$$ LANGUAGE plpgsql;

-- Generate 10 students for each class
DO $$
DECLARE
    class_record RECORD;
    student_count INTEGER := 1;
BEGIN
    FOR class_record IN SELECT id FROM school."Class" LOOP
        FOR i IN 1..10 LOOP
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
                'STUD_' || student_count,
                'ADM' || LPAD(student_count::text, 6, '0'),
                'Student ' || student_count,
                '2010-01-01'::timestamp + (student_count || ' months')::interval,
                CASE WHEN student_count % 2 = 0 THEN 'Male' ELSE 'Female' END,
                'Address ' || student_count,
                '+91' || LPAD(student_count::text, 10, '0'),
                'Parent ' || student_count,
                '+91' || LPAD((student_count + 1)::text, 10, '0'),
                'parent' || student_count || '@email.com',
                CASE student_count % 4 
                    WHEN 0 THEN 'A+'
                    WHEN 1 THEN 'B+'
                    WHEN 2 THEN 'O+'
                    ELSE 'AB+'
                END,
                class_record.id,
                NOW(),
                NOW()
            );
            student_count := student_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- Generate attendance records for the past year (Updated with proper type casting)
DO $$
DECLARE
    student_record RECORD;
    class_record RECORD;
    curr_date timestamp;
BEGIN
    FOR curr_date IN SELECT * FROM generate_past_dates(CURRENT_DATE, 365) LOOP
        FOR student_record IN SELECT id, "classId" FROM school."Student" LOOP
            INSERT INTO school."Attendance" (
                id,
                date,
                status,
                "studentId",
                "classId",
                "createdAt",
                "updatedAt"
            ) VALUES (
                'ATT_' || student_record.id || '_' || to_char(curr_date, 'YYYYMMDD'),
                curr_date,
                (CASE (random() * 100)::integer % 100
                    WHEN 0 THEN 'ABSENT'
                    WHEN 1 THEN 'LATE'
                    WHEN 2 THEN 'HALF_DAY'
                    ELSE 'PRESENT'
                END)::school."AttendanceStatus",  -- Cast to AttendanceStatus enum
                student_record.id,
                student_record."classId",
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- Generate homework records with proper type casting
DO $$
DECLARE
    subject_record RECORD;
    homework_count INTEGER := 1;
BEGIN
    FOR subject_record IN SELECT id, "classId" FROM school."Subject" LOOP
        FOR i IN 1..100 LOOP
            INSERT INTO school."Homework" (
                id,
                title,
                description,
                "dueDate",
                "subjectId",
                status,
                "createdAt",
                "updatedAt",
                "classId"
            ) VALUES (
                'HW_' || homework_count,
                'Homework ' || homework_count,
                'Description for homework ' || homework_count,
                CURRENT_DATE + (i || ' days')::interval,
                subject_record.id,
                'PENDING'::school."HomeworkStatus",
                NOW(),
                NOW(),
                subject_record."classId"
            );
            homework_count := homework_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- Generate fee records for each student (monthly for past year)
DO $$
DECLARE
    student_record RECORD;
    fee_count INTEGER := 1;
    fee_type school."FeeType";
BEGIN
    FOR student_record IN SELECT id FROM school."Student" LOOP
        FOR i IN 1..12 LOOP -- 12 months
            FOR fee_type IN (
                SELECT unnest(enum_range(NULL::school."FeeType"))
            ) LOOP
                INSERT INTO school."Fee" (
                    id,
                    "studentId",
                    amount,
                    "dueDate",
                    "feeType",
                    status,
                    "paymentDate",
                    "paymentMethod",
                    "receiptNumber",
                    "createdAt",
                    "updatedAt"
                ) VALUES (
                    'FEE_' || fee_count,
                    student_record.id,
                    CASE fee_type
                        WHEN 'TUITION' THEN 5000
                        WHEN 'EXAMINATION' THEN 1000
                        WHEN 'TRANSPORT' THEN 2000
                        WHEN 'LIBRARY' THEN 500
                        WHEN 'LABORATORY' THEN 1500
                        ELSE 1000
                    END,
                    CURRENT_DATE - ((12 - i) || ' months')::interval,
                    fee_type,
                    (CASE WHEN i < 10 THEN 'PAID' ELSE 'PENDING' END)::school."FeeStatus",
                    CASE WHEN i < 10 THEN CURRENT_DATE - ((12 - i) || ' months')::interval ELSE NULL END,
                    CASE WHEN i < 10 THEN 'ONLINE' ELSE NULL END,
                    CASE WHEN i < 10 THEN 'RCPT' || fee_count ELSE NULL END,
                    NOW(),
                    NOW()
                );
                fee_count := fee_count + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Generate homework submissions with proper type casting
DO $$
DECLARE
    homework_record RECORD;
    student_record RECORD;
    submission_count INTEGER := 1;
BEGIN
    FOR homework_record IN SELECT id FROM school."Homework" LOOP
        FOR student_record IN 
            SELECT id FROM school."Student" 
            WHERE "classId" = (
                SELECT "classId" FROM school."Homework" 
                WHERE id = homework_record.id
            )
        LOOP
            INSERT INTO school."HomeworkSubmission" (
                id,
                "homeworkId",
                "studentId",
                status,
                "submittedAt"
            ) VALUES (
                'HS_' || submission_count,
                homework_record.id,
                student_record.id,
                (CASE (random() * 3)::integer
                    WHEN 0 THEN 'PENDING'
                    WHEN 1 THEN 'COMPLETED'
                    WHEN 2 THEN 'SUBMITTED'
                    ELSE 'OVERDUE'
                END)::school."HomeworkStatus",
                NOW()
            );
            submission_count := submission_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- Generate classwork records
DO $$
DECLARE
    class_record RECORD;
    classwork_count INTEGER := 1;
BEGIN
    FOR class_record IN SELECT id FROM school."Class" LOOP
        FOR i IN 1..100 LOOP
            INSERT INTO school."Classwork" (
                id,
                title,
                description,
                date,
                "classId",
                "createdAt",
                "updatedAt"
            ) VALUES (
                'CW_' || classwork_count,
                'Classwork ' || classwork_count,
                'Description for classwork ' || classwork_count,
                CURRENT_DATE - (i || ' days')::interval,
                class_record.id,
                NOW(),
                NOW()
            );
            classwork_count := classwork_count + 1;
        END LOOP;
    END LOOP;
END $$;
