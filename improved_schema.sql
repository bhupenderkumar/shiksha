-- Drop and recreate schema
DROP SCHEMA IF EXISTS school CASCADE;
CREATE SCHEMA school;

-- Grant permissions
GRANT USAGE ON SCHEMA school TO authenticated;
GRANT USAGE ON SCHEMA school TO anon;

-- Common ENUM types
CREATE TYPE school.user_role AS ENUM (
    'ADMIN',
    'PRINCIPAL',
    'TEACHER',
    'STAFF',
    'STUDENT',
    'PARENT',
    'ACCOUNTANT'
);

CREATE TYPE school.admission_status AS ENUM (
    'ENQUIRY',
    'DOCUMENT_SUBMISSION',
    'INTERVIEW_SCHEDULED',
    'INTERVIEW_COMPLETED',
    'APPROVED',
    'ENROLLED',
    'REJECTED',
    'WITHDRAWN'
);

-- Base Tables
CREATE TABLE school.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Unified user profiles table
CREATE TABLE school.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    school_id UUID REFERENCES school.schools(id),
    role school.user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    gender TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Staff specific details
CREATE TABLE school.staff_details (
    user_id UUID PRIMARY KEY REFERENCES school.users(id),
    employee_id TEXT NOT NULL UNIQUE,
    qualification TEXT NOT NULL,
    experience INTEGER,
    joining_date DATE NOT NULL,
    department TEXT,
    specialization TEXT[]
);

-- Academic Classes
CREATE TABLE school.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school.schools(id),
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    room_number TEXT,
    capacity INTEGER NOT NULL,
    class_teacher_id UUID REFERENCES school.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, name, section, academic_year)
);

-- Admissions and Student Management
CREATE TABLE school.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school.schools(id),
    user_id UUID REFERENCES school.users(id), -- NULL until student profile is created
    admission_number TEXT UNIQUE,
    student_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    address TEXT NOT NULL,
    previous_school TEXT,
    applying_for_class TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_occupation TEXT,
    admission_status school.admission_status NOT NULL DEFAULT 'ENQUIRY',
    documents JSONB DEFAULT '{}',
    interview_date TIMESTAMPTZ,
    interview_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student specific details (created after admission is approved)
CREATE TABLE school.student_details (
    user_id UUID PRIMARY KEY REFERENCES school.users(id),
    admission_id UUID NOT NULL REFERENCES school.admissions(id),
    current_class_id UUID REFERENCES school.classes(id),
    roll_number TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    medical_conditions TEXT[],
    extra_curricular_activities TEXT[]
);

-- Parent-Student Relationship
CREATE TABLE school.parent_student_relationships (
    parent_id UUID NOT NULL REFERENCES school.users(id),
    student_id UUID NOT NULL REFERENCES school.users(id),
    relationship_type TEXT NOT NULL,
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_id, student_id)
);

-- Subjects
CREATE TABLE school.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school.schools(id),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, code)
);

-- Class Subjects (Many-to-Many relationship between classes and subjects)
CREATE TABLE school.class_subjects (
    class_id UUID NOT NULL REFERENCES school.classes(id),
    subject_id UUID NOT NULL REFERENCES school.subjects(id),
    teacher_id UUID REFERENCES school.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, subject_id)
);

-- Create necessary indexes
CREATE INDEX idx_users_school ON school.users(school_id);
CREATE INDEX idx_users_role ON school.users(role);
CREATE INDEX idx_admissions_status ON school.admissions(admission_status);
CREATE INDEX idx_admissions_school ON school.admissions(school_id);
CREATE INDEX idx_class_subjects_teacher ON school.class_subjects(teacher_id);

-- RLS Policies
ALTER TABLE school.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.parent_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE school.class_subjects ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you'll need to customize these based on your requirements)
CREATE POLICY "Users can view their own school data" ON school.schools
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT school_id FROM school.users 
            WHERE auth.uid() = id
        )
    );

CREATE POLICY "Users can view their own profile" ON school.users
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR 
        school_id IN (
            SELECT school_id FROM school.users 
            WHERE auth.uid() = id AND role IN ('ADMIN', 'PRINCIPAL')
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA school TO authenticated;
GRANT INSERT, UPDATE ON school.admissions TO authenticated;
GRANT INSERT, UPDATE ON school.users TO authenticated;
