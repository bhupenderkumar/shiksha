-- First, let's check the actual column names in the InteractiveQuestion table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'school' 
AND table_name = 'InteractiveQuestion';

-- Now let's check if we have a mismatch between camelCase and snake_case
-- If the column is question_type (snake_case) but code uses questionType (camelCase)
-- We need to create a view or function to handle this

-- Option 1: Create a view that maps snake_case to camelCase
CREATE OR REPLACE VIEW school."InteractiveQuestionView" AS
SELECT 
  id,
  "assignmentId", -- assuming this is already camelCase in the DB
  question_type AS "questionType", -- map snake_case to camelCase
  "order", -- assuming this is already a reserved word and properly quoted
  question_text AS "questionText",
  question_data AS "questionData",
  audio_instructions AS "audioInstructions",
  hint_text AS "hintText",
  hint_image_url AS "hintImageUrl",
  feedback_correct AS "feedbackCorrect",
  feedback_incorrect AS "feedbackIncorrect"
FROM school."InteractiveQuestion";

-- Option 2: Add missing camelCase columns if they don't exist
-- This is a more direct approach but might cause data duplication
ALTER TABLE school."InteractiveQuestion"
ADD COLUMN IF NOT EXISTS "questionType" TEXT,
ADD COLUMN IF NOT EXISTS "questionText" TEXT,
ADD COLUMN IF NOT EXISTS "questionData" JSONB,
ADD COLUMN IF NOT EXISTS "audioInstructions" TEXT,
ADD COLUMN IF NOT EXISTS "hintText" TEXT,
ADD COLUMN IF NOT EXISTS "hintImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackCorrect" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackIncorrect" TEXT;

-- Option 3: Create a trigger to sync snake_case and camelCase columns
-- This ensures data consistency between the two naming conventions
CREATE OR REPLACE FUNCTION school.sync_interactive_question_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync from snake_case to camelCase
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW."questionType" := NEW.question_type;
    NEW."questionText" := NEW.question_text;
    NEW."questionData" := NEW.question_data;
    -- Add other columns as needed
  END IF;
  
  -- Sync from camelCase to snake_case
  IF NEW."questionType" IS NOT NULL AND (NEW.question_type IS NULL OR NEW.question_type != NEW."questionType") THEN
    NEW.question_type := NEW."questionType";
  END IF;
  
  IF NEW."questionText" IS NOT NULL AND (NEW.question_text IS NULL OR NEW.question_text != NEW."questionText") THEN
    NEW.question_text := NEW."questionText";
  END IF;
  
  IF NEW."questionData" IS NOT NULL AND (NEW.question_data IS NULL OR NEW.question_data != NEW."questionData") THEN
    NEW.question_data := NEW."questionData";
  END IF;
  
  -- Add other columns as needed
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_interactive_question_columns_trigger ON school."InteractiveQuestion";
CREATE TRIGGER sync_interactive_question_columns_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW EXECUTE FUNCTION school.sync_interactive_question_columns();

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');
