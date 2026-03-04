-- Flyway Migration V1: Create app_user table for JWT authentication
-- This table is used by the Spring Security auth module and does not exist in the original Supabase schema.

CREATE TABLE IF NOT EXISTS school."app_user" (
    id              VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    phone           VARCHAR(50),
    role            VARCHAR(50) NOT NULL DEFAULT 'user',
    school_id       VARCHAR(255),
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    refresh_token   TEXT,
    push_token      VARCHAR(500),
    push_platform   VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

-- Index for email lookups (used by auth)
CREATE INDEX IF NOT EXISTS idx_app_user_email ON school.app_user(email);

-- Index for school filtering
CREATE INDEX IF NOT EXISTS idx_app_user_school_id ON school.app_user(school_id);
