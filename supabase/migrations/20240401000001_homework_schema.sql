-- Drop existing tables if they exist
DROP TABLE IF EXISTS assignment_files;
DROP TABLE IF EXISTS assignments;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS file_type;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create enum for file types
CREATE TYPE file_type AS ENUM ('image', 'pdf');

-- Assignments table
CREATE TABLE assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assignment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    class_id UUID
);

-- Assignment files table with explicit foreign key
CREATE TABLE assignment_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    file_type file_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_assignment_files_assignment_id ON assignment_files(assignment_id);

-- RLS Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_files ENABLE ROW LEVEL SECURITY;

-- Policies for assignments
CREATE POLICY "Admins and teachers have full access" ON assignments
    FOR ALL USING (auth.role() IN ('admin', 'teacher'));

CREATE POLICY "Students and parents can view assignments" ON assignments
    FOR SELECT USING (auth.role() IN ('student', 'parent'));

-- Policies for assignment files
CREATE POLICY "Admins and teachers have full access to files" ON assignment_files
    FOR ALL USING (auth.role() IN ('admin', 'teacher'));

CREATE POLICY "Students and parents can view files" ON assignment_files
    FOR SELECT USING (auth.role() IN ('student', 'parent'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating timestamps
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 