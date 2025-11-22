-- Add the email_notifications column to the UserSettings table in the school schema
ALTER TABLE school."UserSettings"
ADD COLUMN "email_notifications" BOOLEAN DEFAULT TRUE;