-- Create feedback and transition tables
CREATE TABLE IF NOT EXISTS school."AcademicYear" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school."YearEndFeedback" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES school."Student"(id),
    academic_year_id UUID NOT NULL REFERENCES school."AcademicYear"(id),
    parent_feedback TEXT,
    student_feedback TEXT,
    teacher_feedback TEXT,
    academic_performance TEXT,
    behavioral_assessment TEXT,
    areas_of_improvement TEXT,
    strengths TEXT,
    next_class_recommendation TEXT NOT NULL,
    student_photo_url TEXT,
    father_photo_url TEXT,
    mother_photo_url TEXT,
    father_name TEXT,
    mother_name TEXT,
    father_occupation TEXT,
    mother_occupation TEXT,
    father_contact TEXT,
    mother_contact TEXT,
    father_email TEXT,
    mother_email TEXT,
    address TEXT,
    emergency_contact TEXT,
    medical_conditions TEXT,
    extracurricular_activities TEXT,
    achievements TEXT,
    attendance_record JSONB,
    feedback_status VARCHAR(20) DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school."ClassTransition" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES school."Student"(id),
    academic_year_id UUID NOT NULL REFERENCES school."AcademicYear"(id),
    previous_class_id TEXT NOT NULL REFERENCES school."Class"(id),
    next_class_id TEXT NOT NULL REFERENCES school."Class"(id),
    transition_status VARCHAR(20) DEFAULT 'PENDING',
    transition_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_student ON school."YearEndFeedback"(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_academic_year ON school."YearEndFeedback"(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_transition_student ON school."ClassTransition"(student_id);
CREATE INDEX IF NOT EXISTS idx_transition_academic_year ON school."ClassTransition"(academic_year_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_academic_year_updated_at
    BEFORE UPDATE ON school."AcademicYear"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON school."YearEndFeedback"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transition_updated_at
    BEFORE UPDATE ON school."ClassTransition"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert initial academic year
INSERT INTO school."AcademicYear" (year_name, start_date, end_date, status)
VALUES ('2024-2025', '2024-04-01', '2025-03-31', 'ACTIVE');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA school TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA school TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA school TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA school TO authenticated;

-- Enable Row Level Security
ALTER TABLE school."AcademicYear" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."YearEndFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."ClassTransition" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Enable read access for all users" ON school."AcademicYear"
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable read access for all users" ON school."YearEndFeedback"
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON school."YearEndFeedback"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON school."YearEndFeedback"
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for all users" ON school."ClassTransition"
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert/update for authenticated users only" ON school."ClassTransition"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
