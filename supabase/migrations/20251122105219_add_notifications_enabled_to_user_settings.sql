-- Add the notifications_enabled column to the UserSettings table in the school schema
ALTER TABLE school."UserSettings"
ADD COLUMN "notifications_enabled" BOOLEAN DEFAULT TRUE;