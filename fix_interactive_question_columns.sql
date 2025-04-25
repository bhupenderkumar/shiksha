-- COMPREHENSIVE FIX FOR INTERACTIVE QUESTION COLUMNS
-- This script addresses the issue of having both camelCase and snake_case columns
-- by ensuring data is properly synchronized between them

-- Step 1: Make sure all columns exist (both camelCase and snake_case versions)
ALTER TABLE school."InteractiveQuestion"
-- camelCase columns
ADD COLUMN IF NOT EXISTS "questionType" TEXT,
ADD COLUMN IF NOT EXISTS "questionText" TEXT,
ADD COLUMN IF NOT EXISTS "questionData" JSONB,
ADD COLUMN IF NOT EXISTS "questionOrder" INTEGER,
ADD COLUMN IF NOT EXISTS "audioInstructions" TEXT,
ADD COLUMN IF NOT EXISTS "hintText" TEXT,
ADD COLUMN IF NOT EXISTS "hintImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackCorrect" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackIncorrect" TEXT,
-- snake_case columns
ADD COLUMN IF NOT EXISTS question_type TEXT,
ADD COLUMN IF NOT EXISTS question_text TEXT,
ADD COLUMN IF NOT EXISTS question_data JSONB,
ADD COLUMN IF NOT EXISTS question_order INTEGER,
ADD COLUMN IF NOT EXISTS audio_instructions TEXT,
ADD COLUMN IF NOT EXISTS hint_text TEXT,
ADD COLUMN IF NOT EXISTS hint_image_url TEXT,
ADD COLUMN IF NOT EXISTS feedback_correct TEXT,
ADD COLUMN IF NOT EXISTS feedback_incorrect TEXT;

-- Step 2: Copy data from camelCase to snake_case columns (if snake_case is null)
-- Each field needs its own UPDATE statement
UPDATE school."InteractiveQuestion" SET question_type = "questionType" WHERE question_type IS NULL AND "questionType" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET question_text = "questionText" WHERE question_text IS NULL AND "questionText" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET question_data = "questionData" WHERE question_data IS NULL AND "questionData" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET question_order = "questionOrder" WHERE question_order IS NULL AND "questionOrder" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET audio_instructions = "audioInstructions" WHERE audio_instructions IS NULL AND "audioInstructions" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET hint_text = "hintText" WHERE hint_text IS NULL AND "hintText" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET hint_image_url = "hintImageUrl" WHERE hint_image_url IS NULL AND "hintImageUrl" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET feedback_correct = "feedbackCorrect" WHERE feedback_correct IS NULL AND "feedbackCorrect" IS NOT NULL;
UPDATE school."InteractiveQuestion" SET feedback_incorrect = "feedbackIncorrect" WHERE feedback_incorrect IS NULL AND "feedbackIncorrect" IS NOT NULL;

-- Step 3: Copy data from snake_case to camelCase columns (if camelCase is null)
UPDATE school."InteractiveQuestion" SET "questionType" = question_type WHERE "questionType" IS NULL AND question_type IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "questionText" = question_text WHERE "questionText" IS NULL AND question_text IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "questionData" = question_data WHERE "questionData" IS NULL AND question_data IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "questionOrder" = question_order WHERE "questionOrder" IS NULL AND question_order IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "audioInstructions" = audio_instructions WHERE "audioInstructions" IS NULL AND audio_instructions IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "hintText" = hint_text WHERE "hintText" IS NULL AND hint_text IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "hintImageUrl" = hint_image_url WHERE "hintImageUrl" IS NULL AND hint_image_url IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "feedbackCorrect" = feedback_correct WHERE "feedbackCorrect" IS NULL AND feedback_correct IS NOT NULL;
UPDATE school."InteractiveQuestion" SET "feedbackIncorrect" = feedback_incorrect WHERE "feedbackIncorrect" IS NULL AND feedback_incorrect IS NOT NULL;

-- Step 4: Create a trigger function to keep columns in sync
CREATE OR REPLACE FUNCTION school.sync_interactive_question_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- When camelCase columns are updated, update snake_case columns
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Handle questionType/question_type
    IF NEW."questionType" IS NOT NULL THEN
      NEW.question_type := NEW."questionType";
    ELSIF NEW.question_type IS NOT NULL THEN
      NEW."questionType" := NEW.question_type;
    END IF;

    -- Handle questionText/question_text
    IF NEW."questionText" IS NOT NULL THEN
      NEW.question_text := NEW."questionText";
    ELSIF NEW.question_text IS NOT NULL THEN
      NEW."questionText" := NEW.question_text;
    END IF;

    -- Handle questionData/question_data
    IF NEW."questionData" IS NOT NULL THEN
      NEW.question_data := NEW."questionData";
    ELSIF NEW.question_data IS NOT NULL THEN
      NEW."questionData" := NEW.question_data;
    END IF;

    -- Handle questionOrder/question_order
    IF NEW."questionOrder" IS NOT NULL THEN
      NEW.question_order := NEW."questionOrder";
    ELSIF NEW.question_order IS NOT NULL THEN
      NEW."questionOrder" := NEW.question_order;
    END IF;

    -- Handle audioInstructions/audio_instructions
    IF NEW."audioInstructions" IS NOT NULL THEN
      NEW.audio_instructions := NEW."audioInstructions";
    ELSIF NEW.audio_instructions IS NOT NULL THEN
      NEW."audioInstructions" := NEW.audio_instructions;
    END IF;

    -- Handle hintText/hint_text
    IF NEW."hintText" IS NOT NULL THEN
      NEW.hint_text := NEW."hintText";
    ELSIF NEW.hint_text IS NOT NULL THEN
      NEW."hintText" := NEW.hint_text;
    END IF;

    -- Handle hintImageUrl/hint_image_url
    IF NEW."hintImageUrl" IS NOT NULL THEN
      NEW.hint_image_url := NEW."hintImageUrl";
    ELSIF NEW.hint_image_url IS NOT NULL THEN
      NEW."hintImageUrl" := NEW.hint_image_url;
    END IF;

    -- Handle feedbackCorrect/feedback_correct
    IF NEW."feedbackCorrect" IS NOT NULL THEN
      NEW.feedback_correct := NEW."feedbackCorrect";
    ELSIF NEW.feedback_correct IS NOT NULL THEN
      NEW."feedbackCorrect" := NEW.feedback_correct;
    END IF;

    -- Handle feedbackIncorrect/feedback_incorrect
    IF NEW."feedbackIncorrect" IS NOT NULL THEN
      NEW.feedback_incorrect := NEW."feedbackIncorrect";
    ELSIF NEW.feedback_incorrect IS NOT NULL THEN
      NEW."feedbackIncorrect" := NEW.feedback_incorrect;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS sync_interactive_question_columns_trigger ON school."InteractiveQuestion";
CREATE TRIGGER sync_interactive_question_columns_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW EXECUTE FUNCTION school.sync_interactive_question_columns();

-- Step 6: Grant permissions on all columns
GRANT ALL ON school."InteractiveQuestion" TO authenticated;
GRANT ALL ON school."InteractiveQuestion" TO service_role;
GRANT ALL ON school."InteractiveQuestion" TO anon;

-- Step 7: Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Step 8: Verify the columns exist and data is synced
SELECT
  id,
  "questionType", question_type,
  "questionText", question_text,
  "audioInstructions", audio_instructions,
  "hintText", hint_text,
  "hintImageUrl", hint_image_url,
  "feedbackCorrect", feedback_correct,
  "feedbackIncorrect", feedback_incorrect
FROM
  school."InteractiveQuestion"
LIMIT 5;
