    -- Check if there are any fees in the table
    SELECT COUNT(*) FROM fees;

    -- Check if the teacher's role is correctly set
    SELECT id, role 
    FROM profiles 
    WHERE id = 'b0c020ca-b47f-4e04-8eae-9ce60019b504';

    -- Insert a test fee if none exists
    INSERT INTO fees (
    title,
    description,
    amount,
    due_date,
    created_by,
    created_at,
    updated_at
    ) VALUES (
    'Test Fee',
    'Test Description',
    100,
    CURRENT_DATE,
    'b0c020ca-b47f-4e04-8eae-9ce60019b504',
    NOW(),
    NOW()
    );
