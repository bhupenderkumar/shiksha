-- Create school schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS school;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ProspectiveStudent table
CREATE TABLE IF NOT EXISTS school.prospective_student (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name VARCHAR(255) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    grade_applying VARCHAR(50) NOT NULL,
    current_school VARCHAR(255),
    address TEXT NOT NULL,
    blood_group VARCHAR(10),
    status VARCHAR(50) NOT NULL,
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    school_id UUID NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AdmissionProcess table
CREATE TABLE IF NOT EXISTS school.admission_process (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospective_student_id UUID NOT NULL REFERENCES school.prospective_student(id),
    assigned_class_id UUID,
    admission_number VARCHAR(50),
    documents_required JSONB DEFAULT '{}',
    documents_submitted JSONB DEFAULT '{}',
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_notes TEXT,
    fee_details JSONB,
    approved_by UUID,
    student_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AdmissionCommunication table
CREATE TABLE IF NOT EXISTS school.admission_communication (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospective_student_id UUID NOT NULL REFERENCES school.prospective_student(id),
    communication_type VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL,
    staff_id UUID NOT NULL,
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    direction VARCHAR(10) DEFAULT 'outgoing' CHECK (direction IN ('incoming', 'outgoing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AdmissionNotes table
CREATE TABLE IF NOT EXISTS school.admission_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospective_student_id UUID NOT NULL REFERENCES school.prospective_student(id),
    content TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prospective_student_status ON school.prospective_student(status);
CREATE INDEX IF NOT EXISTS idx_prospective_student_applied_date ON school.prospective_student(applied_date);
CREATE INDEX IF NOT EXISTS idx_admission_process_student ON school.admission_process(prospective_student_id);
CREATE INDEX IF NOT EXISTS idx_admission_communication_student ON school.admission_communication(prospective_student_id);
CREATE INDEX IF NOT EXISTS idx_admission_notes_student ON school.admission_notes(prospective_student_id);

-- Add triggers for updating last_update_date
CREATE OR REPLACE FUNCTION update_last_update_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_prospective_student_last_update_date ON school.prospective_student;
CREATE TRIGGER update_prospective_student_last_update_date
    BEFORE UPDATE ON school.prospective_student
    FOR EACH ROW
    EXECUTE FUNCTION update_last_update_date();

DROP TRIGGER IF EXISTS update_prospective_student_updated_at ON school.prospective_student;
CREATE TRIGGER update_prospective_student_updated_at
    BEFORE UPDATE ON school.prospective_student
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_admission_process_updated_at ON school.admission_process;
CREATE TRIGGER update_admission_process_updated_at
    BEFORE UPDATE ON school.admission_process
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_admission_communication_updated_at ON school.admission_communication;
CREATE TRIGGER update_admission_communication_updated_at
    BEFORE UPDATE ON school.admission_communication
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();