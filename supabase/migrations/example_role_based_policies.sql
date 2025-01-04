
-- Example of more specific role-based policies if needed:
CREATE POLICY "Teachers and admins can manage all assignments"
ON assignments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('teacher', 'admin')
  )
);