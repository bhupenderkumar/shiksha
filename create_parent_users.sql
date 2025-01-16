-- Add user_id column to Student table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'school' 
        AND table_name = 'Student' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE school."Student"
        ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Function to generate a proper Supabase password hash
CREATE OR REPLACE FUNCTION generate_password_hash() RETURNS TEXT AS $$
BEGIN
    -- This is the proper hash for 'Test@123' that works with Supabase
    RETURN '$2a$10$5RqCUJEpBAUbPBTYRWFj.eURJZubdGRcXpgL8KUbBPh.EQrjxrNeO';
END;
$$ LANGUAGE plpgsql;

-- Delete existing test users first
DELETE FROM auth.users WHERE email LIKE 'parent%@email.com';

-- Insert parent users based on existing students
WITH student_parents AS (
    SELECT DISTINCT -- Add DISTINCT to avoid duplicate emails
        "parentEmail",
        "parentName",
        "parentContact",
        id as student_id
    FROM school."Student"
    WHERE "parentEmail" NOT IN (SELECT email FROM auth.users WHERE email IS NOT NULL)
)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    raw_user_meta_data,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    sp."parentEmail",
    generate_password_hash(),
    NOW(),
    'authenticated',
    jsonb_build_object(
        'full_name', sp."parentName",
        'phone', sp."parentContact",
        'student_id', sp.student_id
    ),
    NOW(),
    NOW()
FROM student_parents sp
WHERE sp."parentEmail" IS NOT NULL -- Add check for NULL emails
RETURNING id, email;

-- Create profiles for parent users
INSERT INTO school."Profile" (
    id,
    user_id,
    role,
    full_name,
    avatar_url
)
SELECT 
    gen_random_uuid()::text,
    u.id,
    'PARENT',
    u.raw_user_meta_data->>'full_name',
    'https://api.dicebear.com/7.x/initials/svg?seed=' || (u.raw_user_meta_data->>'full_name')
FROM auth.users u
WHERE u.raw_user_meta_data->>'student_id' IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM school."Profile" p WHERE p.user_id = u.id
);

-- Update students with their parent's user_id
WITH parent_users AS (
    SELECT 
        id as user_id,
        (raw_user_meta_data->>'student_id')::text as student_id
    FROM auth.users
    WHERE raw_user_meta_data->>'student_id' IS NOT NULL
)
UPDATE school."Student" s
SET user_id = pu.user_id
FROM parent_users pu
WHERE s.id = pu.student_id
AND s.user_id IS NULL;

-- Create notification preferences for parent users
INSERT INTO school."UserSettings" (
    user_id,
    notifications,
    theme,
    security
)
SELECT 
    u.id,
    jsonb_build_object(
        'email', true,
        'push', true,
        'sms', true
    ),
    jsonb_build_object(
        'mode', 'light',
        'fontSize', 'medium'
    ),
    jsonb_build_object(
        'twoFactorAuth', false,
        'loginNotifications', true
    )
FROM auth.users u
WHERE u.raw_user_meta_data->>'student_id' IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM school."UserSettings" us WHERE us.user_id = u.id
);

-- Add sample notifications for each parent
INSERT INTO school."Notification" (
    title,
    message,
    type,
    "studentId",
    "isRead"
)
SELECT 
    'Welcome to School Portal',
    'Welcome to our school portal. Please complete your profile setup.',
    'GENERAL',
    s.id,
    false
FROM school."Student" s
WHERE s.user_id IS NOT NULL;

-- Create sample feedback entries
INSERT INTO school.feedback (
    user_id,
    title,
    description,
    status
)
SELECT 
    s.user_id,
    'Initial Feedback',
    'Thank you for the wonderful platform',
    'RAISED'
FROM school."Student" s
WHERE s.user_id IS NOT NULL
LIMIT 10;

-- Verify the data
SELECT 
    s.id as student_id,
    s.name as student_name,
    s."parentEmail",
    u.email,
    u.id as user_id,
    p.role,
    p.full_name
FROM school."Student" s
LEFT JOIN auth.users u ON s.user_id = u.id
LEFT JOIN school."Profile" p ON u.id = p.user_id
ORDER BY s.id;
