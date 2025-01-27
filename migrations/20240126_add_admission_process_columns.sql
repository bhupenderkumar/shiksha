-- Add missing columns to AdmissionProcess table
ALTER TABLE school.AdmissionProcess
ADD COLUMN IF NOT EXISTS interviewdate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assignedclass VARCHAR(10);

-- Add comments for documentation
COMMENT ON COLUMN school.AdmissionProcess.interviewdate IS 'Timestamp of scheduled interview';
COMMENT ON COLUMN school.AdmissionProcess.assignedclass IS 'Class assigned to the student after admission';