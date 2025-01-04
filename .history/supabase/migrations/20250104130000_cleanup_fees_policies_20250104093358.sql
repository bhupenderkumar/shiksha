-- Drop all existing policies
DROP POLICY IF EXISTS "Admin can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can select fees" ON public.fees;
DROP POLICY IF EXISTS "Enable all access for admin" ON public.fees;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.fees;
DROP POLICY IF EXISTS "Enable read access for student" ON public.fees;
DROP POLICY IF EXISTS "Enable read access for teacher" ON public.fees;
DROP POLICY IF EXISTS "Teacher can fetch fees" ON public.fees;

-- Create simplified policies
CREATE POLICY "admin_all_access" ON public.fees
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "teacher_all_access" ON public.fees
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
);

CREATE POLICY "student_read_own" ON public.fees
FOR SELECT TO authenticated
USING (auth.uid() = created_by);

-- Grant necessary privileges
GRANT ALL ON public.fees TO authenticated;
