-- First, make sure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update all parent users with a known password ('Test@123')
UPDATE auth.users
SET 
    encrypted_password = encode(digest('Test@123', 'sha1'), 'hex'),
    email_confirmed_at = NOW(),
    created_at = NOW(),
    updated_at = NOW(),
    is_sso_user = false
WHERE email LIKE 'parent%@email.com';

-- Let's also update one specific test user that we can verify
UPDATE auth.users
SET 
    email = 'testparent@example.com',
    encrypted_password = encode(digest('Test@123', 'sha1'), 'hex'),
    email_confirmed_at = NOW(),
    raw_user_meta_data = jsonb_build_object(
        'full_name', 'Test Parent',
        'phone', '+1234567890'
    )
WHERE email = 'parent49@email.com';

-- Verify the update
SELECT 
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'testparent@example.com';
