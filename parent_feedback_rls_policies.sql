-- SQL script to create RLS policies for the ParentSubmittedFeedback table

-- First, ensure the table exists
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

-- Enable Row Level Security on the table
ALTER TABLE school."ParentSubmittedFeedback" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS parent_feedback_select_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_insert_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_update_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback";
DROP POLICY IF EXISTS parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback";

-- Create policy to allow anonymous users to select their own feedback
-- This allows parents to view feedback they've submitted
CREATE POLICY parent_feedback_select_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO anon
  USING (true);  -- Allow all anonymous users to view all feedback

-- Create policy to allow anonymous users to insert feedback
-- This allows parents to submit feedback without logging in
CREATE POLICY parent_feedback_insert_policy ON school."ParentSubmittedFeedback"
  FOR INSERT
  TO anon
  WITH CHECK (true);  -- Allow all anonymous users to insert feedback

-- Create policy to allow anonymous users to update their own feedback
-- This allows parents to update feedback they've submitted
CREATE POLICY parent_feedback_update_policy ON school."ParentSubmittedFeedback"
  FOR UPDATE
  TO anon
  USING (true)  -- Allow all anonymous users to update any feedback
  WITH CHECK (true);

-- Create policy to allow authenticated users to view all feedback
-- This allows school staff to view all feedback
CREATE POLICY parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback"
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view all feedback

-- Create policy to allow authenticated users to update all feedback
-- This allows school staff to update status and respond to feedback
CREATE POLICY parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback"
  FOR UPDATE
  TO authenticated
  USING (true)  -- Allow all authenticated users to update any feedback
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete feedback
-- This allows school staff to delete inappropriate feedback if needed
CREATE POLICY parent_feedback_delete_auth_policy ON school."ParentSubmittedFeedback"
  FOR DELETE
  TO authenticated
  USING (true);  -- Allow all authenticated users to delete any feedback

-- Grant necessary permissions to the anon role
GRANT SELECT, INSERT, UPDATE ON school."ParentSubmittedFeedback" TO anon;

-- Grant necessary permissions to the authenticated role
GRANT ALL ON school."ParentSubmittedFeedback" TO authenticated;

-- Add comment to the table
COMMENT ON TABLE school."ParentSubmittedFeedback" IS 'Stores feedback submitted by parents about their children';
