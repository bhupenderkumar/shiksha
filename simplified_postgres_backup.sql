-- Create the School table
CREATE TABLE school."School" (
    id text NOT NULL,
    "schoolName" text NOT NULL,
    "schoolAddress" text NOT NULL,
    PRIMARY KEY (id)
);

-- Insert data into the School table
INSERT INTO school."School" (id, "schoolName", "schoolAddress") VALUES
('1', 'Public School', 'Saurabh Vihar');

-- Create the Student table
CREATE TABLE school."Student" (
    id text NOT NULL,
    "admissionNumber" text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    address text NOT NULL,
    "contactNumber" text NOT NULL,
    "parentName" text NOT NULL,
    "parentContact" text NOT NULL,
    "parentEmail" text NOT NULL,
    "bloodGroup" text,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id)
);

-- Create the Class table
CREATE TABLE school."Class" (
    id text NOT NULL,
    name text NOT NULL,
    section text NOT NULL,
    "roomNumber" text,
    capacity integer NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("schoolId") REFERENCES school."School"(id)
);

-- Create the Subject table
CREATE TABLE school."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("classId") REFERENCES school."Class"(id)
);

-- Create the Homework table
CREATE TABLE school."Homework" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "subjectId" text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("subjectId") REFERENCES school."Subject"(id),
    FOREIGN KEY ("classId") REFERENCES school."Class"(id)
);

-- Create the Attendance table
CREATE TABLE school."Attendance" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "studentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    classid text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("studentId") REFERENCES school."Student"(id),
    FOREIGN KEY ("classid") REFERENCES school."Class"(id)
);

-- Create the Fee table
CREATE TABLE school."Fee" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "feeType" text NOT NULL,
    status text NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "receiptNumber" text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("studentId") REFERENCES school."Student"(id)
);

-- Create the File table
CREATE TABLE school."File" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone NOT NULL,
    "schoolId" text,
    "homeworkId" text,
    "classworkId" text,
    "feeId" text,
    "grievanceId" text,
    "uploadedBy" uuid NOT NULL,
    "homeworkSubmissionId" text,
    PRIMARY KEY (id),
    FOREIGN KEY ("schoolId") REFERENCES school."School"(id)
);

-- Create the Notification table
CREATE TABLE school."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "studentId" text NOT NULL,
    "isRead" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("studentId") REFERENCES school."Student"(id)
);

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notifications table with school context
CREATE TYPE school.notification_type AS ENUM ('SUCCESS', 'ERROR', 'WARNING', 'INFO');
CREATE TYPE school.notification_target AS ENUM ('CLASS', 'USER', 'ALL', 'GRADE', 'SECTION');

CREATE TABLE school.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type school.notification_type DEFAULT 'INFO',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  -- Target fields
  target_type school.notification_target NOT NULL,
  target_id uuid, -- Can be class_id, user_id, grade_id, or section_id
  -- Metadata for additional context
  metadata jsonb DEFAULT '{}'::jsonb,
  -- School context
  school_id text REFERENCES school."School"(id) NOT NULL,
  is_archived boolean DEFAULT false,
  archived_at timestamptz,
  -- Scheduling
  scheduled_for timestamptz,
  expires_at timestamptz,
  -- Priority
  is_important boolean DEFAULT false,
  -- Category for filtering
  category text
);

-- Notification reads tracking
CREATE TABLE school.notification_reads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_id uuid REFERENCES school.notifications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  read_at timestamptz DEFAULT now() NOT NULL,
  -- Additional tracking
  read_on_device text,
  read_in_app boolean DEFAULT true,
  CONSTRAINT unique_notification_read UNIQUE (notification_id, user_id)
);

-- Notification recipients for targeted notifications
CREATE TABLE school.notification_recipients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_id uuid REFERENCES school.notifications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_notification_recipient UNIQUE (notification_id, user_id)
);

-- RLS Policies
ALTER TABLE school.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view notifications targeted to them"
  ON school.notifications FOR SELECT
  USING (
    -- User is the creator
    auth.uid() = created_by
    -- Or notification is targeted to them
    OR EXISTS (
      SELECT 1 FROM school.notification_recipients
      WHERE notification_id = school.notifications.id
      AND user_id = auth.uid()
    )
    -- Or notification is for everyone
    OR target_type = 'ALL'
  );

-- Staff can update their own notifications
CREATE POLICY "Staff can update their notifications"
  ON school.notifications FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policies for notification reads
CREATE POLICY "Users can mark notifications as read"
  ON school.notification_reads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for better performance
CREATE INDEX idx_notifications_created_at ON school.notifications(created_at DESC);
CREATE INDEX idx_notifications_target ON school.notifications(target_type, target_id);
CREATE INDEX idx_notification_reads_user ON school.notification_reads(user_id, read_at);

-- Grant permissions on the Settings table to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON school."Settings" TO authenticated;

-- Grant permissions on the UserSettings table to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON school."UserSettings" TO authenticated;

-- Grant permissions on the Profile table to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON school."Profile" TO authenticated;

-- Grant permissions on the UserSettings_id_seq to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON school."UserSettings_id_seq" TO anon;

-- Grant permissions on the UserSettings_id_seq to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON school."UserSettings_id_seq" TO authenticated;

-- Create the Profile table
CREATE TABLE IF NOT EXISTS school."Profile" (
id UUID PRIMARY KEY,
avatar_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Settings table
CREATE TABLE IF NOT EXISTS school."Settings" (
id SERIAL PRIMARY KEY,
school_name VARCHAR(255) NOT NULL,
address VARCHAR(255),
phone VARCHAR(50),
email VARCHAR(100),
website VARCHAR(255),
description TEXT,
logo_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the UserSettings table
CREATE TABLE IF NOT EXISTS school."UserSettings" (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
notifications JSONB NOT NULL,
theme JSONB NOT NULL,
security JSONB NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop the UserSettings table if it exists
DROP TABLE IF EXISTS school."UserSettings";

-- Recreate the UserSettings table with a UNIQUE constraint on user_id
CREATE TABLE IF NOT EXISTS school."UserSettings" (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL, -- This will be the UID from Supabase authentication
notifications JSONB NOT NULL,
theme JSONB NOT NULL,
security JSONB NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id) -- Ensure each user has only one settings entry
);
