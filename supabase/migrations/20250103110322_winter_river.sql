/*
  # Initial Schema Setup for School Management System

  1. New Tables
    - profiles (extends auth.users)
      - user_id (references auth.users)
      - role (enum: admin, teacher, student)
      - full_name
      - avatar_url
    
    - teachers
      - id (uuid)
      - user_id (references profiles)
      - specializations (array of subjects)
      - bio
      - contact_info
    
    - students
      - id (uuid)
      - user_id (references profiles)
      - grade_level
      - enrollment_date
      - parent_contact
    
    - classes
      - id (uuid)
      - name
      - description
      - teacher_id
      - schedule
      - max_students
    
    - class_enrollments
      - id (uuid)
      - class_id
      - student_id
      - enrollment_date
    
    - assignments
      - id (uuid)
      - class_id
      - title
      - description
      - due_date
      - created_by
    
    - submissions
      - id (uuid)
      - assignment_id
      - student_id
      - submission_url
      - grade
      - submitted_at
    
  2. Security
    - Enable RLS on all tables
    - Create policies for role-based access
    - Set up audit logging
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  specializations text[] NOT NULL DEFAULT '{}',
  bio text,
  contact_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  grade_level integer NOT NULL,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  parent_contact jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  schedule jsonb NOT NULL,
  max_students integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create class_enrollments table
CREATE TABLE class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Create assignments table
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  submission_url text,
  grade numeric(5,2),
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers policies
CREATE POLICY "Teachers viewable by authenticated users"
  ON teachers FOR SELECT
  USING (auth.role() IN ('authenticated'));

CREATE POLICY "Admins can manage teachers"
  ON teachers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Students policies
CREATE POLICY "Students viewable by teachers and admins"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

-- Classes policies
CREATE POLICY "Classes viewable by authenticated users"
  ON classes FOR SELECT
  USING (auth.role() IN ('authenticated'));

CREATE POLICY "Teachers can manage their classes"
  ON classes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = classes.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- Create functions for audit logging
CREATE OR REPLACE FUNCTION audit_log() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    performed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    OLD,
    NEW,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;