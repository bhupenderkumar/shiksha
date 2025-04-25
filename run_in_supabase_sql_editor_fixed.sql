-- Add missing columns to InteractiveQuestion table with camelCase column names
-- Note: This uses the exact camelCase column names that match the TypeScript code
ALTER TABLE school."InteractiveQuestion" 
ADD COLUMN IF NOT EXISTS "audioInstructions" TEXT,
ADD COLUMN IF NOT EXISTS "hintText" TEXT,
ADD COLUMN IF NOT EXISTS "hintImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackCorrect" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackIncorrect" TEXT;

-- Comment explaining the migration
COMMENT ON TABLE school."InteractiveQuestion" IS 'Table for storing interactive assignment questions with enhanced feedback and hint features';
