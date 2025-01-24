-- Reset database schema
DROP SCHEMA IF EXISTS school CASCADE;
CREATE SCHEMA school;

-- Create tables with proper data types
CREATE TABLE school."Staff" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "contactNumber" TEXT,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STAFF')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."Class" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    "teacherId" TEXT REFERENCES school."Staff"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."Student" (
    id TEXT PRIMARY KEY,
    "admissionNumber" TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "contactNumber" TEXT,
    "parentContact" TEXT,
    address TEXT,
    "dateOfBirth" DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    "classId" TEXT REFERENCES school."Class"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."Subject" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "classId" TEXT REFERENCES school."Class"(id),
    "teacherId" TEXT REFERENCES school."Staff"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."Homework" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "subjectId" TEXT REFERENCES school."Subject"(id),
    "teacherId" TEXT REFERENCES school."Staff"(id),
    "classId" TEXT REFERENCES school."Class"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."HomeworkSubmission" (
    id TEXT PRIMARY KEY,
    "homeworkId" TEXT REFERENCES school."Homework"(id),
    "studentId" TEXT REFERENCES school."Student"(id),
    "submissionText" TEXT,
    "submissionUrl" TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'GRADED')),
    grade TEXT,
    feedback TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."Attendance" (
    id TEXT PRIMARY KEY,
    "studentId" TEXT REFERENCES school."Student"(id),
    "classId" TEXT REFERENCES school."Class"(id),
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."UserSettings" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    theme TEXT DEFAULT 'light',
    notifications BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school."AdmissionEnquiry" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    "gradeApplying" TEXT NOT NULL,
    "currentSchool" TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on all tables
ALTER TABLE school."Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."Homework" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."HomeworkSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."UserSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."AdmissionEnquiry" ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION school.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM school."Staff"
        WHERE email = auth.jwt()->>'email'
        AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is teacher
CREATE OR REPLACE FUNCTION school.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM school."Staff"
        WHERE email = auth.jwt()->>'email'
        AND role = 'TEACHER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's student ID
CREATE OR REPLACE FUNCTION school.get_student_id()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT id FROM school."Student"
        WHERE "parentEmail" = auth.jwt()->>'email'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's class ID
CREATE OR REPLACE FUNCTION school.get_student_class_id()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT "classId" FROM school."Student"
        WHERE "parentEmail" = auth.jwt()->>'email'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff table policies
CREATE POLICY "Admins can do everything with staff"
    ON school."Staff"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can view staff"
    ON school."Staff"
    FOR SELECT
    TO authenticated
    USING (school.is_teacher());

CREATE POLICY "Staff can view own profile"
    ON school."Staff"
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Class table policies
CREATE POLICY "Admins can do everything with classes"
    ON school."Class"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can view and update their classes"
    ON school."Class"
    FOR ALL
    TO authenticated
    USING ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'))
    WITH CHECK ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Students can view their class"
    ON school."Class"
    FOR SELECT
    TO authenticated
    USING (id = school.get_student_class_id());

-- Student table policies
CREATE POLICY "Admins can do everything with students"
    ON school."Student"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can view and update their class students"
    ON school."Student"
    FOR ALL
    TO authenticated
    USING (
        "classId" IN (
            SELECT id FROM school."Class"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    )
    WITH CHECK (
        "classId" IN (
            SELECT id FROM school."Class"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    );

CREATE POLICY "Students can view own profile"
    ON school."Student"
    FOR SELECT
    TO authenticated
    USING ("parentEmail" = auth.jwt()->>'email');

-- Subject table policies
CREATE POLICY "Admins can do everything with subjects"
    ON school."Subject"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can manage their subjects"
    ON school."Subject"
    FOR ALL
    TO authenticated
    USING ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'))
    WITH CHECK ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Students can view their class subjects"
    ON school."Subject"
    FOR SELECT
    TO authenticated
    USING ("classId" = school.get_student_class_id());

-- Homework table policies
CREATE POLICY "Admins can do everything with homework"
    ON school."Homework"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can manage their homework"
    ON school."Homework"
    FOR ALL
    TO authenticated
    USING ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'))
    WITH CHECK ("teacherId" IN (SELECT id FROM school."Staff" WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Students can view their class homework"
    ON school."Homework"
    FOR SELECT
    TO authenticated
    USING ("classId" = school.get_student_class_id());

-- HomeworkSubmission table policies
CREATE POLICY "Admins can do everything with homework submissions"
    ON school."HomeworkSubmission"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can view and grade homework submissions"
    ON school."HomeworkSubmission"
    FOR ALL
    TO authenticated
    USING (
        "homeworkId" IN (
            SELECT id FROM school."Homework"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    )
    WITH CHECK (
        "homeworkId" IN (
            SELECT id FROM school."Homework"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    );

CREATE POLICY "Students can manage their homework submissions"
    ON school."HomeworkSubmission"
    FOR ALL
    TO authenticated
    USING ("studentId" = school.get_student_id())
    WITH CHECK ("studentId" = school.get_student_id());

-- Attendance table policies
CREATE POLICY "Admins can do everything with attendance"
    ON school."Attendance"
    TO authenticated
    USING (school.is_admin())
    WITH CHECK (school.is_admin());

CREATE POLICY "Teachers can manage their class attendance"
    ON school."Attendance"
    FOR ALL
    TO authenticated
    USING (
        "classId" IN (
            SELECT id FROM school."Class"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    )
    WITH CHECK (
        "classId" IN (
            SELECT id FROM school."Class"
            WHERE "teacherId" IN (
                SELECT id FROM school."Staff"
                WHERE email = auth.jwt()->>'email'
            )
        )
    );

CREATE POLICY "Students can view their attendance"
    ON school."Attendance"
    FOR SELECT
    TO authenticated
    USING ("studentId" = school.get_student_id());

-- UserSettings table policies
CREATE POLICY "Users can manage their own settings"
    ON school."UserSettings"
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- AdmissionEnquiry table policies
CREATE POLICY "Allow public to create admission enquiries"
    ON school."AdmissionEnquiry"
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Staff can view admission enquiries"
    ON school."AdmissionEnquiry"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM school."Staff" s
            WHERE s.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "Staff can update admission enquiries"
    ON school."AdmissionEnquiry"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM school."Staff" s
            WHERE s.email = auth.jwt()->>'email'
        )
    );

-- Insert initial data (your existing insert statements here)
[Your existing INSERT statements...]
