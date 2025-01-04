-- Drop existing teacher policy
DROP POLICY IF EXISTS "Enable read access for teacher" ON public.fees;

-- Create a more permissive teacher policy
CREATE POLICY "teacher_access_all_fees"
ON public.fees
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
);

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'fees';
