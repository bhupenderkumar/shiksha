-- First, check all columns in the InteractiveQuestion table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM
  information_schema.columns
WHERE
  table_schema = 'school'
  AND table_name = 'InteractiveQuestion'
ORDER BY
  ordinal_position;

-- Add missing camelCase columns if they don't exist
ALTER TABLE school."InteractiveQuestion"
ADD COLUMN IF NOT EXISTS "assignmentId" TEXT,
ADD COLUMN IF NOT EXISTS "questionType" TEXT,
ADD COLUMN IF NOT EXISTS "questionText" TEXT,
ADD COLUMN IF NOT EXISTS "questionData" JSONB,
ADD COLUMN IF NOT EXISTS "questionOrder" INTEGER,
ADD COLUMN IF NOT EXISTS "audioInstructions" TEXT,
ADD COLUMN IF NOT EXISTS "hintText" TEXT,
ADD COLUMN IF NOT EXISTS "hintImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackCorrect" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackIncorrect" TEXT;

-- Copy data from snake_case to camelCase columns
UPDATE school."InteractiveQuestion" SET
  "assignmentId" = assignment_id WHERE "assignmentId" IS NULL AND assignment_id IS NOT NULL,
  "questionType" = question_type WHERE "questionType" IS NULL AND question_type IS NOT NULL,
  "questionText" = question_text WHERE "questionText" IS NULL AND question_text IS NOT NULL,
  "questionData" = question_data WHERE "questionData" IS NULL AND question_data IS NOT NULL,
  "questionOrder" = question_order WHERE "questionOrder" IS NULL AND question_order IS NOT NULL;

-- Create a function to handle all possible column names
CREATE OR REPLACE FUNCTION school.ensure_all_required_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle all possible column names with snake_case

  -- Primary key and foreign key
  -- 'id' is usually handled automatically

  -- Handle assignment_id (foreign key)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW."assignmentId" IS NOT NULL AND NEW.assignment_id IS NULL THEN
      NEW.assignment_id := NEW."assignmentId";
    ELSIF NEW.assignment_id IS NOT NULL AND NEW."assignmentId" IS NULL THEN
      NEW."assignmentId" := NEW.assignment_id;
    END IF;
  END IF;

  -- Handle question_type
  IF NEW.question_type IS NULL AND NEW."questionType" IS NOT NULL THEN
    NEW.question_type := NEW."questionType";
  ELSIF NEW."questionType" IS NULL AND NEW.question_type IS NOT NULL THEN
    NEW."questionType" := NEW.question_type;
  ELSIF NEW.question_type IS NULL THEN
    NEW.question_type := 'MATCHING';
    NEW."questionType" := 'MATCHING';
  END IF;

  -- Handle question_order
  IF NEW.question_order IS NULL AND NEW."order" IS NOT NULL THEN
    NEW.question_order := NEW."order";
  ELSIF NEW.question_order IS NULL AND NEW.order IS NOT NULL THEN
    NEW.question_order := NEW.order;
  ELSIF NEW."questionOrder" IS NOT NULL AND NEW.question_order IS NULL THEN
    NEW.question_order := NEW."questionOrder";
  ELSIF NEW.question_order IS NOT NULL AND NEW."questionOrder" IS NULL THEN
    NEW."questionOrder" := NEW.question_order;
  ELSIF NEW.question_order IS NULL THEN
    NEW.question_order := 1;
    NEW."questionOrder" := 1;
  END IF;

  -- Handle question_text
  IF NEW.question_text IS NULL AND NEW."questionText" IS NOT NULL THEN
    NEW.question_text := NEW."questionText";
  ELSIF NEW."questionText" IS NULL AND NEW.question_text IS NOT NULL THEN
    NEW."questionText" := NEW.question_text;
  ELSIF NEW.question_text IS NULL THEN
    NEW.question_text := '';
    NEW."questionText" := '';
  END IF;

  -- Handle question_data
  IF NEW.question_data IS NULL AND NEW."questionData" IS NOT NULL THEN
    NEW.question_data := NEW."questionData";
  ELSIF NEW."questionData" IS NULL AND NEW.question_data IS NOT NULL THEN
    NEW."questionData" := NEW.question_data;
  ELSIF NEW.question_data IS NULL THEN
    NEW.question_data := '{}'::jsonb;
    NEW."questionData" := '{}'::jsonb;
  END IF;

  -- Handle audio_instructions
  IF NEW.audio_instructions IS NULL AND NEW."audioInstructions" IS NOT NULL THEN
    NEW.audio_instructions := NEW."audioInstructions";
  END IF;

  -- Handle hint_text
  IF NEW.hint_text IS NULL AND NEW."hintText" IS NOT NULL THEN
    NEW.hint_text := NEW."hintText";
  END IF;

  -- Handle hint_image_url
  IF NEW.hint_image_url IS NULL AND NEW."hintImageUrl" IS NOT NULL THEN
    NEW.hint_image_url := NEW."hintImageUrl";
  END IF;

  -- Handle feedback_correct
  IF NEW.feedback_correct IS NULL AND NEW."feedbackCorrect" IS NOT NULL THEN
    NEW.feedback_correct := NEW."feedbackCorrect";
  END IF;

  -- Handle feedback_incorrect
  IF NEW.feedback_incorrect IS NULL AND NEW."feedbackIncorrect" IS NOT NULL THEN
    NEW.feedback_incorrect := NEW."feedbackIncorrect";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_all_required_fields_trigger ON school."InteractiveQuestion";
CREATE TRIGGER ensure_all_required_fields_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW EXECUTE FUNCTION school.ensure_all_required_fields();

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verify all columns exist
SELECT
  column_name,
  data_type
FROM
  information_schema.columns
WHERE
  table_schema = 'school'
  AND table_name = 'InteractiveQuestion'
ORDER BY
  ordinal_position;
