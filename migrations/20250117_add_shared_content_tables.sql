-- Migration: Add tables for shareable content and Q&A functionality
-- Created: 2025-01-17
-- Purpose: Allow parents to view homework/classwork via shared links and ask questions

-- Table to store shareable links for homework and classwork
CREATE TABLE IF NOT EXISTS school."ShareableLink" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) NOT NULL UNIQUE, -- Unique token for the shareable URL
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('homework', 'classwork')),
    content_id UUID NOT NULL, -- Reference to either homework or classwork ID
    created_by UUID NOT NULL, -- Teacher/Admin who created the link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry date
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0, -- Track how many times the link was accessed
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES school."User"(id) ON DELETE CASCADE
);

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_shareable_link_token ON school."ShareableLink"(token);
CREATE INDEX IF NOT EXISTS idx_shareable_link_content ON school."ShareableLink"(content_type, content_id);

-- Table to store queries/questions from parents
CREATE TABLE IF NOT EXISTS school."ContentQuery" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shareable_link_id UUID NOT NULL REFERENCES school."ShareableLink"(id) ON DELETE CASCADE,
    parent_name VARCHAR(100) NOT NULL, -- Name of the parent asking
    parent_phone VARCHAR(20), -- Optional phone number for follow-up
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES school."User"(id)
);

-- Create index for faster query lookup
CREATE INDEX IF NOT EXISTS idx_content_query_link ON school."ContentQuery"(shareable_link_id);

-- Table to store replies from teachers
CREATE TABLE IF NOT EXISTS school."QueryReply" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES school."ContentQuery"(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    replied_by UUID NOT NULL REFERENCES school."User"(id),
    replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster reply lookup
CREATE INDEX IF NOT EXISTS idx_query_reply_query ON school."QueryReply"(query_id);

-- Add RLS policies for security (allow public read for active shared links)

-- Enable RLS
ALTER TABLE school."ShareableLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."ContentQuery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."QueryReply" ENABLE ROW LEVEL SECURITY;

-- Allow public to view active shareable links
CREATE POLICY "Public can view active shareable links" 
ON school."ShareableLink" 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Allow authenticated users (teachers) to manage shareable links
CREATE POLICY "Teachers can manage shareable links"
ON school."ShareableLink"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public to view and create queries
CREATE POLICY "Public can view queries"
ON school."ContentQuery"
FOR SELECT
USING (true);

CREATE POLICY "Public can create queries"
ON school."ContentQuery"
FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to manage queries
CREATE POLICY "Teachers can manage queries"
ON school."ContentQuery"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public to view replies
CREATE POLICY "Public can view replies"
ON school."QueryReply"
FOR SELECT
USING (true);

-- Allow authenticated users to create replies
CREATE POLICY "Teachers can manage replies"
ON school."QueryReply"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to generate unique token
CREATE OR REPLACE FUNCTION school.generate_share_token()
RETURNS VARCHAR(64) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    result VARCHAR(64) := '';
    i INT;
BEGIN
    FOR i IN 1..16 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION school.increment_share_view_count(share_token VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE school."ShareableLink"
    SET view_count = view_count + 1,
        last_viewed_at = NOW()
    WHERE token = share_token;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE school."ShareableLink" IS 'Stores shareable links for homework and classwork content';
COMMENT ON TABLE school."ContentQuery" IS 'Stores questions from parents about homework/classwork';
COMMENT ON TABLE school."QueryReply" IS 'Stores teacher replies to parent questions';
