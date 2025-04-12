-- Create ID Card table
CREATE TABLE IF NOT EXISTS school."IDCard" (
  id UUID PRIMARY KEY,
    date_of_birth DATE,

  student_name TEXT NOT NULL,
  class_id text REFERENCES school."Class"(id),
  student_photo_url TEXT,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  father_photo_url TEXT,
  mother_photo_url TEXT,
  father_mobile TEXT,
  mother_mobile TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_count INTEGER DEFAULT 0
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_idcard_class_id ON school."IDCard"(class_id);

-- Add comment to table
COMMENT ON TABLE school."IDCard" IS 'Stores student ID card information';



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."IDCard" TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."IDCard" TO anon;

-- Create storage bucket for ID card photos with public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'File',
  'File',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg']::text[]
);

-- Enable public access to the bucket
UPDATE storage.buckets SET public = true WHERE id = 'File';

-- Set up storage bucket policies to allow public access to ID card photos
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'File');

CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'File');

CREATE POLICY "Owners Can Update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'File');

CREATE POLICY "Owners Can Delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'File');
