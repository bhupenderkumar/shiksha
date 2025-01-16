-- First, get the student IDs to reset their user_id
UPDATE school."Student" s
SET user_id = NULL
WHERE user_id IN (
    SELECT id 
    FROM auth.users 
    WHERE encrypted_password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGRl3K1Fli.'
);

-- Delete related records in UserSettings
DELETE FROM school."UserSettings"
WHERE user_id IN (
    SELECT id 
    FROM auth.users 
    WHERE encrypted_password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGRl3K1Fli.'
);

-- Delete related records in Profile
DELETE FROM school."Profile"
WHERE user_id IN (
    SELECT id 
    FROM auth.users 
    WHERE encrypted_password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGRl3K1Fli.'
);

-- Finally, delete the users
DELETE FROM auth.users
WHERE encrypted_password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGRl3K1Fli.';

-- Verify deletion
SELECT COUNT(*) as remaining_test_users 
FROM auth.users 
WHERE encrypted_password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGRl3K1Fli.';
