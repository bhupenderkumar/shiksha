-- Check the actual column names in the InteractiveQuestion table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'school'
AND table_name = 'InteractiveQuestion'
ORDER BY column_name;

-- Verify the specific columns we're using
SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_schema = 'school'
  AND table_name = 'InteractiveQuestion'
  AND column_name IN (
    'question_type',
    'question_order',
    'question_text',
    'question_data'
  );

-- Create a function to ensure required fields are never null
CREATE OR REPLACE FUNCTION school.ensure_required_fields_not_null()
RETURNS TRIGGER AS $$
BEGIN
  -- If question_type is null, set it to 'MATCHING'
  IF NEW.question_type IS NULL THEN
    NEW.question_type := 'MATCHING';
  END IF;

  -- If question_order is null, set it to 1
  IF NEW.question_order IS NULL THEN
    NEW.question_order := 1;
  END IF;

  -- If question_text is null, set it to empty string
  IF NEW.question_text IS NULL THEN
    NEW.question_text := '';
  END IF;

  -- If question_data is null, set it to empty JSON object
  IF NEW.question_data IS NULL THEN
    NEW.question_data := '{}'::jsonb;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_required_fields_not_null_trigger ON school."InteractiveQuestion";
CREATE TRIGGER ensure_required_fields_not_null_trigger
BEFORE INSERT OR UPDATE ON school."InteractiveQuestion"
FOR EACH ROW EXECUTE FUNCTION school.ensure_required_fields_not_null();

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');
