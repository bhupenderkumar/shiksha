-- Execute SQL RPC Function for Shiksha
-- This function is used by student.service.ts for admin operations
-- Run this after the initial database setup

-- Create the execute_sql function in the school schema
CREATE OR REPLACE FUNCTION school.execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role only (admin operations)
REVOKE ALL ON FUNCTION school.execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION school.execute_sql(text) TO service_role;

-- Verify the function was created
DO $$
BEGIN
  RAISE NOTICE 'execute_sql function created successfully in school schema';
END $$;
