-- Function to generate fee records
DO $$
DECLARE
    student_record RECORD;
    month_date DATE;
    fee_id TEXT;
    payment_date DATE;
BEGIN
    -- Loop through each student
    FOR student_record IN SELECT id FROM school."Student"
    LOOP
        -- Loop through months (March to December 2024)
        FOR month_date IN SELECT generate_series(
            '2024-03-01'::DATE,
            '2024-12-01'::DATE,
            '1 month'::INTERVAL
        )
        LOOP
            -- Set payment date as 5th of each month
            payment_date := month_date + INTERVAL '5 days';
            
            -- Insert TUITION fee
            fee_id := 'FEE-' || student_record.id || '-' || TO_CHAR(month_date, 'YYYYMM') || '-T';
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
                fee_id,
                student_record.id,
                700.00,
                month_date + INTERVAL '10 days',
                'TUITION',
                'PAID',
                payment_date,
                'ONLINE',
                'REC-' || fee_id,
                NOW(),
                NOW()
            );

            -- Insert EXAMINATION fee
            fee_id := 'FEE-' || student_record.id || '-' || TO_CHAR(month_date, 'YYYYMM') || '-E';
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
                fee_id,
                student_record.id,
                700.00,
                month_date + INTERVAL '10 days',
                'EXAMINATION',
                'PAID',
                payment_date,
                'ONLINE',
                'REC-' || fee_id,
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- Verify the insertion
SELECT COUNT(*) as total_fee_records FROM school."Fee";

-- Sample query to verify fee records for a specific student
SELECT 
    s.name as student_name,
    f."feeType",
    f.amount,
    f.status,
    f."dueDate",
    f."paymentDate"
FROM school."Fee" f
JOIN school."Student" s ON f."studentId" = s.id
WHERE s.id = 'STU301'
ORDER BY f."dueDate";
