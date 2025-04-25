-- Check if the assignment_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'school' 
  AND table_name = 'InteractiveQuestion' 
  AND column_name = 'assignment_id';

-- If the assignment_id column exists but assignmentId doesn't, add the assignmentId column
ALTER TABLE school."InteractiveQuestion" 
ADD COLUMN IF NOT EXISTS "assignmentId" TEXT;

-- Copy data from assignment_id to assignmentId
UPDATE school."InteractiveQuestion"
SET "assignmentId" = assignment_id
WHERE "assignmentId" IS NULL AND assignment_id IS NOT NULL;

-- Create a trigger to keep both columns in sync
CREATE OR REPLACE FUNCTION school.sync_assignment_id_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW."assignmentId" IS NOT NULL AND NEW.assignment_id IS NULL THEN
      NEW.assignment_id := NEW."assignmentId";
    ELSIF NEW.assignment_id IS NOT NULL AND NEW."assignmentId" IS NULL THEN
      NEW."assignmentId" := NEW.assignment_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS sync_assignment_id_trigger ON school."InteractiveQuestion";

-- Create the trigger
CREATE TRIGGER sync_assignment_id_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW
EXECUTE FUNCTION school.sync_assignment_id_columns();

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verify both columns exist
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'school' 
  AND table_name = 'InteractiveQuestion' 
  AND column_name IN ('assignment_id', 'assignmentId');
