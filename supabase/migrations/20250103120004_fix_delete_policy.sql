-- Drop existing delete policy
DROP POLICY IF EXISTS "Enable delete for owners" ON assignments;

-- Create more permissive delete policy for teachers and admins
CREATE POLICY "Enable delete for teachers and admins"
ON assignments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('teacher', 'admin')
  )
);
