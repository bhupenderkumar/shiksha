-- Update password for a specific user (setting password as 'password123')
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf'))
WHERE email = 'parent49@email.com';

-- Verify the user
SELECT id, email, encrypted_password 
FROM auth.users 
WHERE email = 'parent49@email.com';

-- If you want to update all parent users
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf'))
WHERE email LIKE 'parent%@email.com';
