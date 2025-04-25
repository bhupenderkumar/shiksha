-- First, let's check the actual column names in the InteractiveQuestion table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'school' 
AND table_name = 'InteractiveQuestion';

-- Create a function to handle the conversion between camelCase and snake_case
CREATE OR REPLACE FUNCTION school.handle_interactive_question_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Map camelCase to snake_case
  IF NEW."questionType" IS NOT NULL THEN
    NEW.question_type := NEW."questionType";
  ELSIF NEW.question_type IS NULL THEN
    NEW.question_type := 'MATCHING'; -- Default value to prevent not-null constraint
  END IF;
  
  IF NEW."questionText" IS NOT NULL THEN
    NEW.question_text := NEW."questionText";
  END IF;
  
  IF NEW."questionData" IS NOT NULL THEN
    NEW.question_data := NEW."questionData";
  END IF;
  
  -- Ensure not-null constraints are satisfied
  IF NEW.question_type IS NULL THEN
    NEW.question_type := 'MATCHING';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS handle_interactive_question_insert_trigger ON school."InteractiveQuestion";
CREATE TRIGGER handle_interactive_question_insert_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW EXECUTE FUNCTION school.handle_interactive_question_insert();

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');
