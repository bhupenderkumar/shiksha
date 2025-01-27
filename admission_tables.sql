-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS school;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS school.AdmissionNotes;
DROP TABLE IF EXISTS school.AdmissionCommunication;
DROP TABLE IF EXISTS school.AdmissionProcess;
DROP TABLE IF EXISTS school.ProspectiveStudent;

-- ProspectiveStudent table
CREATE TABLE IF NOT EXISTS school.ProspectiveStudent (
    id UUID PRIMARY KEY,
    studentname VARCHAR(255) NOT NULL,
    parentname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contactnumber VARCHAR(20) NOT NULL,
    gradeapplying VARCHAR(10) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dateofbirth DATE,
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    applieddate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastupdatedate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AdmissionProcess table (case-sensitive columns fixed)
CREATE TABLE IF NOT EXISTS school.AdmissionProcess (
    id UUID PRIMARY KEY,
    prospectivestudentid UUID NOT NULL REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE,
    documentsrequired JSONB NOT NULL DEFAULT '{
      "birth_certificate": {
        "required": ["birth_certificate"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "transfer_certificate": {
        "required": ["transfer_certificate"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "report_card": {
        "required": ["report_card"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "medical_records": {
        "required": ["medical_records"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "address_proof": {
        "required": ["address_proof"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "student_photo": {
        "required": ["student_photo"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "father_photo": {
        "required": ["father_photo"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      },
      "mother_photo": {
        "required": ["mother_photo"],
        "submitted": [],
        "verificationStatus": {},
        "rejectionReason": {}
      }
    }',
    interviewdate TIMESTAMP WITH TIME ZONE,
    assignedclass VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prospective_student FOREIGN KEY (prospectivestudentid) 
        REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE
);

-- AdmissionNotes table (case-sensitive columns fixed)
CREATE TABLE IF NOT EXISTS school.AdmissionNotes (
    id UUID PRIMARY KEY,
    prospectivestudentid UUID NOT NULL REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    createdby VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prospective_student_notes FOREIGN KEY (prospectivestudentid) 
        REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE
);

-- AdmissionCommunication table (new table)
CREATE TABLE IF NOT EXISTS school.AdmissionCommunication (
    id UUID PRIMARY KEY,
    prospectivestudentid UUID NOT NULL REFERENCES school.ProspectiveStudent(id) ON DELETE CASCADE,
    communicationtype VARCHAR(50) NOT NULL,
    notes TEXT,
    staffid VARCHAR(255) NOT NULL,
    communicationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospective_student_status ON school.ProspectiveStudent(status);
CREATE INDEX IF NOT EXISTS idx_prospective_student_email ON school.ProspectiveStudent(email);
CREATE INDEX IF NOT EXISTS idx_admission_process_student_id ON school.AdmissionProcess(prospectivestudentid);
CREATE INDEX IF NOT EXISTS idx_admission_notes_student_id ON school.AdmissionNotes(prospectivestudentid);
CREATE INDEX IF NOT EXISTS idx_admission_communication_student_id ON school.AdmissionCommunication(prospectivestudentid);
CREATE INDEX IF NOT EXISTS idx_admission_communication_date ON school.AdmissionCommunication(communicationdate);

-- Comments for better documentation
COMMENT ON TABLE school.ProspectiveStudent IS 'Stores information about prospective students and their admission enquiries';
COMMENT ON TABLE school.AdmissionProcess IS 'Tracks the admission process and required documents for each prospective student';
COMMENT ON TABLE school.AdmissionNotes IS 'Stores notes and updates related to each admission enquiry';
COMMENT ON TABLE school.AdmissionCommunication IS 'Stores communication history with prospective students';
COMMENT ON COLUMN school.AdmissionProcess.interviewdate IS 'Timestamp of scheduled interview';
COMMENT ON COLUMN school.AdmissionProcess.assignedclass IS 'Class assigned to the student after admission';
