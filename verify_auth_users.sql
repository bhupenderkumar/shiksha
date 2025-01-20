-- Check total counts
SELECT 
    (SELECT COUNT(*) FROM school."Student") as total_students,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM school."Profile") as total_profiles;

-- Check students without auth users
SELECT s.id, s.name
FROM school."Student" s
LEFT JOIN school."Profile" p ON s.id = p.id
WHERE p.id IS NULL;

-- Check all created auth users with their details
SELECT 
    s.id as student_id,
    s.name as student_name,
    s."admissionNumber",
    u.email as auth_email,
    p.role as profile_role,
    u.created_at as auth_created_at
FROM school."Student" s
JOIN school."Profile" p ON s.id = p.id
JOIN auth.users u ON p.user_id = u.id
ORDER BY s.name;

-- Check for any duplicate emails
SELECT email, COUNT(*) 
FROM auth.users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check UserSettings
SELECT COUNT(*) as settings_count 
FROM school."UserSettings";
