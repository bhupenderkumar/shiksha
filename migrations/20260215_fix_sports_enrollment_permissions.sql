-- Fix: Grant table-level permissions to anon and authenticated roles for SportsEnrollment
-- The RLS policies alone are not enough — the role also needs GRANT access to the table.

-- Grant INSERT and SELECT to anon (public parents)
GRANT INSERT, SELECT ON school."SportsEnrollment" TO anon;

-- Grant full access to authenticated users (school staff)
GRANT ALL ON school."SportsEnrollment" TO authenticated;

-- Also grant usage on the schema if not already done
GRANT USAGE ON SCHEMA school TO anon;
GRANT USAGE ON SCHEMA school TO authenticated;
