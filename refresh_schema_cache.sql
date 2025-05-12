-- SQL script to verify the table structure and refresh the schema cache

-- Check the current structure of the ParentSubmittedFeedback table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'school' 
AND table_name = 'ParentSubmittedFeedback';

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';

-- Insert a test record to verify everything works
INSERT INTO school."ParentSubmittedFeedback" (
  id, 
  class_id, 
  student_name, 
  parent_name, 
  month, 
  feedback, 
  status
) 
VALUES (
  gen_random_uuid(), 
  'CLS201'::uuid, 
  'AVYUKT SURESH DHONI', 
  'Test Parent', 
  'April', 
  'This is a test feedback to verify the table structure.', 
  'PENDING'
)
ON CONFLICT (class_id, student_name, month) 
DO UPDATE SET 
  parent_name = 'Test Parent',
  feedback = 'This is a test feedback to verify the table structure.',
  updated_at = NOW();
