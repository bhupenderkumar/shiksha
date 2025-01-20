-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create auth users for existing students
CREATE OR REPLACE FUNCTION school.create_auth_users_for_students()
RETURNS void AS $$
DECLARE
    student_record RECORD;
    default_password TEXT := 'Student@123'; -- Default password for all students
    new_user_id UUID;
    email_address TEXT;
    base_email TEXT;
    counter INTEGER;
    total_created INTEGER := 0;
    total_skipped INTEGER := 0;
BEGIN
    -- Temporarily disable the trigger that creates students
    ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

    -- Loop through each student that doesn't have a corresponding auth.user
    FOR student_record IN 
        SELECT s.* 
        FROM school."Student" s
        LEFT JOIN school."Profile" p ON s.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Generate base email
            base_email := LOWER(REPLACE(TRIM(student_record.name), ' ', '.') || '@myfirststeppublicschool.com');
            
            -- Initialize counter and email
            counter := 1;
            email_address := base_email;
            
            -- Keep trying until we find a unique email
            WHILE EXISTS (SELECT 1 FROM auth.users WHERE email = email_address) LOOP
                email_address := LOWER(REPLACE(TRIM(student_record.name), ' ', '.') || counter || '@myfirststeppublicschool.com');
                counter := counter + 1;
            END LOOP;

            -- Generate UUID for new user
            new_user_id := gen_random_uuid();

            -- Insert into auth.users
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
                updated_at
            ) VALUES (
                new_user_id,
                email_address,
                crypt(default_password, gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'full_name', student_record.name,
                    'date_of_birth', student_record."dateOfBirth",
                    'gender', student_record.gender,
                    'address', student_record.address,
                    'phone', student_record."contactNumber",
                    'parent_name', student_record."parentName",
                    'parent_contact', student_record."parentContact",
                    'admission_number', student_record."admissionNumber"
                ),
                jsonb_build_object(
                    'provider', 'email',
                    'providers', ARRAY['email']
                ),
                'authenticated',
                'authenticated',
                NOW(),
                NOW()
            );

            -- Create Profile entry
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

            -- Create UserSettings entry with correct columns
            INSERT INTO school."UserSettings" (
                user_id,
                theme
            ) VALUES (
                new_user_id,
                'light'
            );

            -- Log each successful creation
            total_created := total_created + 1;
            RAISE NOTICE 'Created user % of %: % (%)', total_created, student_record.id, student_record.name, email_address;

        EXCEPTION WHEN OTHERS THEN
            total_skipped := total_skipped + 1;
            RAISE NOTICE 'Error creating user for %: %', student_record.name, SQLERRM;
        END;
    END LOOP;

    -- Re-enable the trigger
    ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

    -- Final summary
    RAISE NOTICE 'Creation completed. Created: %, Skipped: %', total_created, total_skipped;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION school.create_auth_users_for_students() TO postgres;
GRANT EXECUTE ON FUNCTION school.create_auth_users_for_students() TO service_role;

-- Execute the function to create auth users
SELECT school.create_auth_users_for_students();

-- Verify the results
SELECT 
    s.id as student_id,
    s.name as student_name,
    u.email as auth_email,
    p.role as profile_role
FROM school."Student" s
JOIN school."Profile" p ON s.id = p.id
JOIN auth.users u ON p.user_id = u.id
ORDER BY s.name
LIMIT 10;
