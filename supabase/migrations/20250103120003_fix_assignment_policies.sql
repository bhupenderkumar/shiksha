-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins and teachers have full access" ON assignments;
DROP POLICY IF EXISTS "Students and parents can view assignments" ON assignments;

-- Create more permissive policies
CREATE POLICY "Enable read access for all authenticated users"
ON assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON assignments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for owners"
ON assignments FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for owners"
ON assignments FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
