-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins and teachers have full access to files" ON assignment_files;
DROP POLICY IF EXISTS "Students and parents can view files" ON assignment_files;

-- Create new policies for assignment_files
CREATE POLICY "Enable insert for authenticated users" 
ON assignment_files FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" 
ON assignment_files FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable update for file owners" 
ON assignment_files FOR UPDATE 
TO authenticated 
USING (uploaded_by = auth.uid());

CREATE POLICY "Enable delete for file owners and assignment owners" 
ON assignment_files FOR DELETE 
TO authenticated 
USING (
    uploaded_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM assignments 
        WHERE assignments.id = assignment_files.assignment_id 
        AND assignments.created_by = auth.uid()
    )
);
