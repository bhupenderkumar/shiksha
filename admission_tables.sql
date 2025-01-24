-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS school;

-- ProspectiveStudent table
CREATE TABLE IF NOT EXISTS school.ProspectiveStudent (
    id UUID PRIMARY KEY,
    studentName VARCHAR(255) NOT NULL,
    parentName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(20) NOT NULL,
    gradeApplying VARCHAR(10) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dateOfBirth DATE,
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    appliedDate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdateDate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AdmissionProcess table
CREATE TABLE IF NOT EXISTS school.AdmissionProcess (
    id UUID PRIMARY KEY,
    prospectiveStudentId UUID NOT NULL REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE,
    documentsRequired JSONB NOT NULL DEFAULT '{}',
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prospective_student FOREIGN KEY (prospectiveStudentId) 
        REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE
);

-- AdmissionNotes table
CREATE TABLE IF NOT EXISTS school.AdmissionNotes (
    id UUID PRIMARY KEY,
    prospectiveStudentId UUID NOT NULL REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    createdBy VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prospective_student_notes FOREIGN KEY (prospectiveStudentId) 
        REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospective_student_status ON school.ProspectiveStudent(status);
CREATE INDEX IF NOT EXISTS idx_prospective_student_email ON school.ProspectiveStudent(email);
CREATE INDEX IF NOT EXISTS idx_admission_process_student_id ON school.AdmissionProcess(prospectiveStudentId);
CREATE INDEX IF NOT EXISTS idx_admission_notes_student_id ON school.AdmissionNotes(prospectiveStudentId);

-- Comments for better documentation
COMMENT ON TABLE school.ProspectiveStudent IS 'Stores information about prospective students and their admission enquiries';
COMMENT ON TABLE school.AdmissionProcess IS 'Tracks the admission process and required documents for each prospective student';
COMMENT ON TABLE school.AdmissionNotes IS 'Stores notes and updates related to each admission enquiry';
