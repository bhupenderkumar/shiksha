-- Migration: Create shareable link tables + fix anonymous permissions
-- Created: 2026-03-04
-- Purpose: Allow anonymous (unauthenticated) parents to view shared homework/classwork
-- via shareable links without logging in.
--
-- Includes table creation from the original 20250117 migration (which was
-- never applied) plus GRANT + RLS fixes so the anon role can actually
-- read shared content.

-- ============================================================
-- 0. Ensure the school schema exists and anon has USAGE
-- ============================================================
CREATE SCHEMA IF NOT EXISTS school;
GRANT USAGE ON SCHEMA school TO anon;
GRANT USAGE ON SCHEMA school TO authenticated;

-- ============================================================
-- 1. Create shareable-link tables (IF NOT EXISTS)
-- ============================================================

-- ShareableLink
CREATE TABLE IF NOT EXISTS school."ShareableLink" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) NOT NULL UNIQUE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('homework', 'classwork')),
    content_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_shareable_link_token ON school."ShareableLink"(token);
CREATE INDEX IF NOT EXISTS idx_shareable_link_content ON school."ShareableLink"(content_type, content_id);

-- ContentQuery
CREATE TABLE IF NOT EXISTS school."ContentQuery" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shareable_link_id UUID NOT NULL REFERENCES school."ShareableLink"(id) ON DELETE CASCADE,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20),
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_query_link ON school."ContentQuery"(shareable_link_id);

-- QueryReply
CREATE TABLE IF NOT EXISTS school."QueryReply" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES school."ContentQuery"(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    replied_by TEXT NOT NULL,
    replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_reply_query ON school."QueryReply"(query_id);

-- ============================================================
-- 2. Enable RLS on share tables
-- ============================================================
ALTER TABLE school."ShareableLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."ContentQuery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."QueryReply" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS policies for share tables
-- ============================================================

-- Drop existing policies first (safe if they don't exist)
DROP POLICY IF EXISTS "Public can view active shareable links" ON school."ShareableLink";
DROP POLICY IF EXISTS "Teachers can manage shareable links" ON school."ShareableLink";
DROP POLICY IF EXISTS "Public can view queries" ON school."ContentQuery";
DROP POLICY IF EXISTS "Public can create queries" ON school."ContentQuery";
DROP POLICY IF EXISTS "Teachers can manage queries" ON school."ContentQuery";
DROP POLICY IF EXISTS "Public can view replies" ON school."QueryReply";
DROP POLICY IF EXISTS "Teachers can manage replies" ON school."QueryReply";
DROP POLICY IF EXISTS "anon_update_shareablelink_viewcount" ON school."ShareableLink";

-- ShareableLink: anon can view active links
CREATE POLICY "anon_select_active_shareable_links"
ON school."ShareableLink"
FOR SELECT TO anon
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- ShareableLink: anon can update (view count)
CREATE POLICY "anon_update_shareablelink_viewcount"
ON school."ShareableLink"
FOR UPDATE TO anon
USING (is_active = true)
WITH CHECK (is_active = true);

-- ShareableLink: authenticated users full access
CREATE POLICY "authenticated_manage_shareable_links"
ON school."ShareableLink"
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ContentQuery: anon can view
CREATE POLICY "anon_select_queries"
ON school."ContentQuery"
FOR SELECT TO anon
USING (true);

-- ContentQuery: anon can create
CREATE POLICY "anon_insert_queries"
ON school."ContentQuery"
FOR INSERT TO anon
WITH CHECK (true);

-- ContentQuery: authenticated full access
CREATE POLICY "authenticated_manage_queries"
ON school."ContentQuery"
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- QueryReply: anon can view
CREATE POLICY "anon_select_replies"
ON school."QueryReply"
FOR SELECT TO anon
USING (true);

-- QueryReply: authenticated full access
CREATE POLICY "authenticated_manage_replies"
ON school."QueryReply"
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- 4. GRANTs for share tables
-- ============================================================
GRANT SELECT, UPDATE ON school."ShareableLink" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."ShareableLink" TO authenticated;

GRANT SELECT, INSERT ON school."ContentQuery" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."ContentQuery" TO authenticated;

GRANT SELECT ON school."QueryReply" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON school."QueryReply" TO authenticated;

-- ============================================================
-- 5. GRANTs for content tables (anon SELECT only)
-- ============================================================
GRANT SELECT ON school."Homework" TO anon;
GRANT SELECT ON school."Classwork" TO anon;
GRANT SELECT ON school."Class" TO anon;
GRANT SELECT ON school."Subject" TO anon;
GRANT SELECT ON school."File" TO anon;

-- ============================================================
-- 6. RLS policies for anon on content tables
--    Anon can only read homework/classwork that have an active share link.
-- ============================================================

-- Drop if re-running
DROP POLICY IF EXISTS "anon_read_homework_via_share" ON school."Homework";
DROP POLICY IF EXISTS "anon_read_classwork_via_share" ON school."Classwork";
DROP POLICY IF EXISTS "anon_read_class" ON school."Class";
DROP POLICY IF EXISTS "anon_read_subject" ON school."Subject";
DROP POLICY IF EXISTS "anon_read_files_via_share" ON school."File";

-- Homework: anon can only SELECT rows with an active share link
CREATE POLICY "anon_read_homework_via_share"
ON school."Homework"
FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM school."ShareableLink" sl
    WHERE sl.content_type = 'homework'
      AND sl.content_id = school."Homework".id::text
      AND sl.is_active = true
      AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
  )
);

-- Classwork: anon can only SELECT rows with an active share link
CREATE POLICY "anon_read_classwork_via_share"
ON school."Classwork"
FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM school."ShareableLink" sl
    WHERE sl.content_type = 'classwork'
      AND sl.content_id = school."Classwork".id::text
      AND sl.is_active = true
      AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
  )
);

-- Class: anon can read class info (not sensitive)
CREATE POLICY "anon_read_class"
ON school."Class"
FOR SELECT TO anon
USING (true);

-- Subject: anon can read subject info (not sensitive)
CREATE POLICY "anon_read_subject"
ON school."Subject"
FOR SELECT TO anon
USING (true);

-- File: anon can only read files that belong to shared content
CREATE POLICY "anon_read_files_via_share"
ON school."File"
FOR SELECT TO anon
USING (
  (
    "homeworkId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM school."ShareableLink" sl
      WHERE sl.content_type = 'homework'
        AND sl.content_id = school."File"."homeworkId"::text
        AND sl.is_active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
    )
  )
  OR
  (
    "classworkId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM school."ShareableLink" sl
      WHERE sl.content_type = 'classwork'
        AND sl.content_id = school."File"."classworkId"::text
        AND sl.is_active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
    )
  )
);
