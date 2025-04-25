-- Add missing columns to InteractiveQuestion table
ALTER TABLE school."InteractiveQuestion" 
ADD COLUMN IF NOT EXISTS audio_instructions TEXT,
ADD COLUMN IF NOT EXISTS hint_text TEXT,
ADD COLUMN IF NOT EXISTS hint_image_url TEXT,
ADD COLUMN IF NOT EXISTS feedback_correct TEXT,
ADD COLUMN IF NOT EXISTS feedback_incorrect TEXT;

-- Comment explaining the migration
COMMENT ON TABLE school."InteractiveQuestion" IS 'Table for storing interactive assignment questions with enhanced feedback and hint features';
