-- Create storage bucket for assignments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignments', 'assignments', true);

-- Set up storage policies for the assignments bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  auth.role() IN ('authenticated')
);

CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assignments');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'assignments' AND owner = auth.uid());

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assignments' AND owner = auth.uid());
