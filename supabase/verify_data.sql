-- First verify if there are any fees
SELECT COUNT(*) FROM fees;

-- Insert test fees for the teacher
INSERT INTO fees (
    id,
    title,
    description,
    amount,
    due_date,
    created_by,
    created_at,
    updated_at,
    class_id
) VALUES 
(
    gen_random_uuid(),
    'Test Fee 1',
    'Monthly fee for January',
    1000,
    '2025-01-04',
    'b0c020ca-b47f-4e04-8eae-9ce60019b504',
    NOW(),
    NOW(),
    'class-1'
),
(
    gen_random_uuid(),
    'Test Fee 2',
    'Monthly fee for February',
    1500,
    '2025-02-04',
    'b0c020ca-b47f-4e04-8eae-9ce60019b504',
    NOW(),
    NOW(),
    'class-1'
);

-- Verify the inserted data
SELECT * FROM fees 
WHERE created_by = 'b0c020ca-b47f-4e04-8eae-9ce60019b504'
ORDER BY created_at DESC;

-- Verify the policy for the teacher
SELECT has_table_privilege('authenticated', 'fees', 'SELECT');
