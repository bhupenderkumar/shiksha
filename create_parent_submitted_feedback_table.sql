-- SQL script to create the ParentSubmittedFeedback table in the school schema

-- First, ensure the schema exists
CREATE SCHEMA IF NOT EXISTS school;

-- Create the ParentSubmittedFeedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS school."ParentSubmittedFeedback" (
  id UUID PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES school."Class"(id),
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  month TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESPONDED')),
  
  -- Add a unique constraint to prevent duplicate entries
  UNIQUE(class_id, student_name, month)
);

-- Add RLS policies for the ParentSubmittedFeedback table
-- Enable RLS
ALTER TABLE school."ParentSubmittedFeedback" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for parent submissions)
CREATE POLICY parent_feedback_insert_policy ON school."ParentSubmittedFeedback"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select their own submissions
CREATE POLICY parent_feedback_select_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to view all feedback
CREATE POLICY parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update feedback
CREATE POLICY parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment to the table
COMMENT ON TABLE school."ParentSubmittedFeedback" IS 'Stores feedback submitted by parents about their children';
