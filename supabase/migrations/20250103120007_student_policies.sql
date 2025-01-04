-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can create students" ON students;
DROP POLICY IF EXISTS "Only admins can update students" ON students;

-- Create correct INSERT policy with WITH CHECK
CREATE POLICY "Only admins can create students"
ON students FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update policy remains the same with USING
CREATE POLICY "Only admins can update students"
ON students FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);