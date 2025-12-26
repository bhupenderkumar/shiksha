-- Shiksha Database Initialization Script
-- This script runs on first PostgreSQL container startup
-- Sets up the required schemas, extensions, and custom functions

-- Create the school schema
CREATE SCHEMA IF NOT EXISTS school;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA school TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA school TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA school TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA school TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA school GRANT SELECT ON TABLES TO anon;

-- Create the execute_sql function for dynamic SQL execution
-- Used by student.service.ts for admin operations
CREATE OR REPLACE FUNCTION school.execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role only (admin operations)
REVOKE ALL ON FUNCTION school.execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION school.execute_sql(text) TO service_role;

-- Create auth schema extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Shiksha database initialization complete';
  RAISE NOTICE 'Schema: school';
  RAISE NOTICE 'Function: school.execute_sql created';
END $$;
