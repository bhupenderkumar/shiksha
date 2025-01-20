-- First, let's check if we have correct permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON auth.users TO postgres, service_role;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION school.create_auth_users_for_students()
RETURNS void AS $$
DECLARE
    student_record RECORD;
    default_password TEXT := 'Student@123';
    new_user_id UUID;
    email_address TEXT;
    total_students INTEGER;
    current_count INTEGER := 0;
BEGIN
    -- Get total count for progress tracking
    SELECT COUNT(*) INTO total_students 
    FROM school."Student" s
    LEFT JOIN school."Profile" p ON s.id = p.id
    WHERE p.id IS NULL;

    RAISE NOTICE 'Starting to create % user accounts...', total_students;

    -- Disable trigger temporarily
    ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

    FOR student_record IN 
        SELECT s.* 
        FROM school."Student" s
        LEFT JOIN school."Profile" p ON s.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            current_count := current_count + 1;
            
            -- Create unique email using admission number
            email_address := LOWER(
                REPLACE(
                    student_record."admissionNumber" || '.' ||
                    REGEXP_REPLACE(student_record.name, '[^a-zA-Z0-9]', '.', 'g'),
                    '..', '.'
                ) || '@myfirststeppublicschool.com'
            );

            -- Generate new UUID
            new_user_id := gen_random_uuid();

            -- Insert auth user with explicit password hashing
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_user_meta_data,
                raw_app_meta_data,
                aud,
                role,
                created_at,
                updated_at,
                confirmation_token,
                recovery_token
            ) VALUES (
                new_user_id,
                email_address,
                crypt(default_password, gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'full_name', student_record.name,
                    'admission_number', student_record."admissionNumber",
                    'student_id', student_record.id
                ),
                jsonb_build_object(
                    'provider', 'email',
                    'providers', ARRAY['email']
                ),
                'authenticated',
                'authenticated',
                NOW(),
                NOW(),
                NULL,
                NULL
            );

            -- Create Profile
            INSERT INTO school."Profile" (
                id,
                user_id,
                role,
                full_name
            ) VALUES (
                student_record.id,
                new_user_id,
                'STUDENT',
                student_record.name
            );

            -- Create UserSettings
            INSERT INTO school."UserSettings" (
                user_id,
                theme
            ) VALUES (
                new_user_id,
                'light'
            );

            RAISE NOTICE 'Created user % of %: % (%)', 
                current_count, total_students, student_record.name, email_address;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error for student %: %', student_record.name, SQLERRM;
            RAISE NOTICE 'Continuing with next student...';
        END;
    END LOOP;

    -- Re-enable trigger
    ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

    -- Final verification
    RAISE NOTICE 'Process completed. Verifying results...';
    
    -- Show final counts
    RAISE NOTICE 'Final counts:';
    RAISE NOTICE 'Total students: %', (SELECT COUNT(*) FROM school."Student");
    RAISE NOTICE 'Total auth users: %', (SELECT COUNT(*) FROM auth.users);
    RAISE NOTICE 'Total profiles: %', (SELECT COUNT(*) FROM school."Profile");
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant required permissions
GRANT EXECUTE ON FUNCTION school.create_auth_users_for_students() TO postgres;
GRANT EXECUTE ON FUNCTION school.create_auth_users_for_students() TO service_role;

-- Execute the function
SELECT school.create_auth_users_for_students();

-- Verify results
SELECT 
    COUNT(*) as total_auth_users 
FROM auth.users;

SELECT 
    COUNT(*) as total_profiles
FROM school."Profile";

-- Show some sample created users
SELECT 
    s.id,
    s.name,
    s."admissionNumber",
    u.email,
    u.created_at
FROM school."Student" s
JOIN school."Profile" p ON s.id = p.id
JOIN auth.users u ON p.user_id = u.id
ORDER BY s.id
LIMIT 5;
