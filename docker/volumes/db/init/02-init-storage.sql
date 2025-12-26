-- Storage Buckets Initialization for Shiksha
-- Creates the required storage buckets with proper permissions

-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('File', 'File', true, 52428800, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]),
  ('admission-documents', 'admission-documents', false, 52428800, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for File bucket (public read)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Public Read Access', 'File', 'SELECT', 'true'::jsonb),
  ('Authenticated Upload', 'File', 'INSERT', '(auth.role() = ''authenticated'')'::jsonb),
  ('Owner Delete', 'File', 'DELETE', '(auth.role() = ''authenticated'')'::jsonb)
ON CONFLICT DO NOTHING;

-- Storage policies for admission-documents bucket (authenticated only)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Authenticated Read', 'admission-documents', 'SELECT', '(auth.role() = ''authenticated'')'::jsonb),
  ('Authenticated Upload', 'admission-documents', 'INSERT', '(auth.role() = ''authenticated'')'::jsonb),
  ('Authenticated Delete', 'admission-documents', 'DELETE', '(auth.role() = ''authenticated'')'::jsonb)
ON CONFLICT DO NOTHING;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Storage buckets created: File, admission-documents';
END $$;
