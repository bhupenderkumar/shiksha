-- Create Schema
DROP SCHEMA IF EXISTS school CASCADE;
CREATE SCHEMA school;

-- Drop and Grant Schema Permissions


GRANT USAGE ON SCHEMA school TO authenticated;
GRANT USAGE ON SCHEMA school TO anon;

-- Custom Types
CREATE TYPE school."StaffRole" AS ENUM (
    'TEACHER',
    'ADMIN',
    'PRINCIPAL',
    'ACCOUNTANT'
);

CREATE TYPE school."HomeworkStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'OVERDUE',
    'SUBMITTED'
);

CREATE TYPE school."FeeType" AS ENUM (
    'TUITION',
    'EXAMINATION',
    'TRANSPORT',
    'LIBRARY',
    'LABORATORY',
    'MISCELLANEOUS'
);

CREATE TYPE school."FeeStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'PARTIAL'
);

CREATE TYPE school."NotificationType" AS ENUM (
    'HOMEWORK',
    'ATTENDANCE',
    'FEE',
    'GENERAL',
    'EXAM',
    'EMERGENCY'
);

CREATE TYPE school."GrievanceStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE school."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY'
);

-- Base Tables (No Foreign Keys)
CREATE TABLE school."School" (
    id text NOT NULL PRIMARY KEY,
    "schoolName" text NOT NULL,
    "schoolAddress" text NOT NULL
);

-- Profile table now references auth.users
CREATE TABLE school."Profile" (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
    role text NOT NULL,
    full_name text,
    avatar_url text
);

CREATE TABLE school."Class" (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    section text NOT NULL,
    "roomNumber" text,
    capacity integer NOT NULL,
    "schoolId" text NOT NULL REFERENCES school."School"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

CREATE TABLE school."Staff" (
    id text NOT NULL PRIMARY KEY,
    "employeeId" text NOT NULL UNIQUE,
    name text NOT NULL,
    role school."StaffRole" NOT NULL,
    qualification text NOT NULL,
    experience integer NOT NULL,
    email text NOT NULL UNIQUE,
    "contactNumber" text NOT NULL,
    address text NOT NULL,
    "joiningDate" timestamp(3) NOT NULL,
    "schoolId" text NOT NULL REFERENCES school."School"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL,
    user_id uuid REFERENCES auth.users(id)
);


-- Tables with Foreign Keys (Level 2)
CREATE TABLE school."Student" (
    id text NOT NULL PRIMARY KEY,
    "admissionNumber" text NOT NULL UNIQUE,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) NOT NULL,
    gender text NOT NULL,
    address text NOT NULL,
    "contactNumber" text NOT NULL,
    "parentName" text NOT NULL,
    "parentContact" text NOT NULL,
    "parentEmail" text NOT NULL,
    "bloodGroup" text,
    "classId" text NOT NULL REFERENCES school."Class"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

-- Sample Data Insertion
-- Insert School
INSERT INTO school."School" (id, "schoolName", "schoolAddress") 
VALUES ('1', 'Demo School', '123 Education Street, Knowledge City');

-- Insert Staff
INSERT INTO school."Staff" (
    id, 
    "employeeId", 
    name, 
    role, 
    qualification, 
    experience, 
    email, 
    "contactNumber", 
    address, 
    "joiningDate", 
    "schoolId", 
    "createdAt", 
    "updatedAt"
) VALUES (
    '1',
    'EMP',
    'Bhupender Kumar',
    'ADMIN',
    'Software Engineer',
    5,
    'sharmakbhupender@gmail.com',
    '+91',
    'India',
    '2025-01-11 02:56:25.898',
    '1',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898'
);

-- Insert Sample Class
INSERT INTO school."Class" (
    id, 
    name, 
    section, 
    "roomNumber", 
    capacity, 
    "schoolId", 
    "createdAt", 
    "updatedAt"
) VALUES (
    '1',
    'Class X',
    'A',
    'R101',
    30,
    '1',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898'
);

-- Insert Sample Student
INSERT INTO school."Student" (
    id,
    "admissionNumber",
    name,
    "dateOfBirth",
    gender,
    address,
    "contactNumber",
    "parentName",
    "parentContact",
    "parentEmail",
    "bloodGroup",
    "classId",
    "createdAt",
    "updatedAt"
) VALUES (
    '1',
    'ADM001',
    'John Doe',
    '2010-01-01 00:00:00',
    'Male',
    '456 Student Lane, Knowledge City',
    '+1234567890',
    'Jane Doe',
    '+1234567891',
    'jane.doe@email.com',
    'O+',
    '1',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898'
);

CREATE TABLE school."Subject" (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    code text NOT NULL,
    "classId" text NOT NULL REFERENCES school."Class"(id),
    "teacherId" text NOT NULL REFERENCES school."Staff"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

-- Insert Sample Subject
INSERT INTO school."Subject" (
    id,
    name,
    code,
    "classId",
    "teacherId",
    "createdAt",
    "updatedAt"
) VALUES (
    '1',
    'Mathematics',
    'MATH101',
    '1',
    '1',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898'
);

-- Remove teacherId from Homework table
CREATE TABLE school."Homework" (
    id text NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    "dueDate" timestamp(3) NOT NULL,
    "subjectId" text NOT NULL REFERENCES school."Subject"(id),
    status school."HomeworkStatus" NOT NULL,
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL,
    "classId" text REFERENCES school."Class"(id)
);

-- Insert Sample Homework
INSERT INTO school."Homework" (
    id,
    title,
    description,
    "dueDate",
    "subjectId",
    status,
    "createdAt",
    "updatedAt",
    "classId"
) VALUES (
    '1',
    'Algebra Basics',
    'Complete exercises 1-10 from Chapter 3',
    '2025-01-18 23:59:59',
    '1',
    'PENDING',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898',
    '1'
);

-- Drop existing Attendance table if exists
DROP TABLE IF EXISTS school."Attendance" CASCADE;

-- Create updated Attendance table
CREATE TABLE school."Attendance" (
    id text NOT NULL PRIMARY KEY,
    date timestamp(3) NOT NULL,
    status school."AttendanceStatus" NOT NULL,
    "studentId" text NOT NULL REFERENCES school."Student"(id),
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" text REFERENCES school."Class"(id),
    "createdBy" uuid REFERENCES auth.users(id),
    description text,
    "lastModifiedBy" uuid REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX attendance_date_idx ON school."Attendance" (date);
CREATE INDEX attendance_class_idx ON school."Attendance" ("classId");
CREATE INDEX attendance_student_idx ON school."Attendance" ("studentId");

-- Grant permissions
GRANT ALL ON TABLE school."Attendance" TO authenticated;
GRANT SELECT ON TABLE school."Attendance" TO anon;

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION school.update_attendance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_attendance_timestamp
    BEFORE UPDATE ON school."Attendance"
    FOR EACH ROW
    EXECUTE FUNCTION school.update_attendance_timestamp();

CREATE TABLE school."Classwork" (
    id text NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) NOT NULL,
    "classId" text NOT NULL REFERENCES school."Class"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

CREATE TABLE school."Fee" (
    id text NOT NULL PRIMARY KEY,
    "studentId" text NOT NULL REFERENCES school."Student"(id),
    amount double precision NOT NULL,
    "dueDate" timestamp(3) NOT NULL,
    "feeType" school."FeeType" NOT NULL,
    status school."FeeStatus" NOT NULL,
    "paymentDate" timestamp(3),
    "paymentMethod" text,
    "receiptNumber" text,
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

CREATE TABLE school."Grievance" (
    id text NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    "studentId" text NOT NULL REFERENCES school."Student"(id),
    status school."GrievanceStatus" NOT NULL,
    resolution text,
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

CREATE TABLE school."Notification" (
    id text NOT NULL PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    type school."NotificationType" NOT NULL,
    "studentId" text NOT NULL REFERENCES school."Student"(id),
    "isRead" boolean NOT NULL,
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

CREATE TABLE school."TimeTable" (
    id text NOT NULL PRIMARY KEY,
    day integer NOT NULL,
    "startTime" timestamp(3) NOT NULL,
    "endTime" timestamp(3) NOT NULL,
    "classId" text NOT NULL REFERENCES school."Class"(id),
    "subjectId" text NOT NULL REFERENCES school."Subject"(id),
    "createdAt" timestamp(3) NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

-- Sequences
CREATE SEQUENCE school.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE school.feedback_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Tables with Sequences
CREATE TABLE school.feedback (
    id integer NOT NULL DEFAULT nextval('school.feedback_id_seq'::regclass),
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    note text,
    status character varying(20) DEFAULT 'RAISED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE school.feedback_replies (
    id integer NOT NULL DEFAULT nextval('school.feedback_replies_id_seq'::regclass),
    feedback_id integer NOT NULL REFERENCES school.feedback(id),
    user_id uuid NOT NULL,
    reply text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE school."HomeworkSubmission" (
    id text NOT NULL PRIMARY KEY,
    "homeworkId" text NOT NULL REFERENCES school."Homework"(id),
    "studentId" text NOT NULL REFERENCES school."Student"(id),
    status school."HomeworkStatus" NOT NULL,
    "submittedAt" timestamp(3) NOT NULL
);


CREATE TABLE school."File" (
    id text NOT NULL PRIMARY KEY,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) NOT NULL,
    "schoolId" text UNIQUE REFERENCES school."School"(id),
    "homeworkId" text REFERENCES school."Homework"(id),
    "classworkId" text REFERENCES school."Classwork"(id),
    "feeId" text REFERENCES school."Fee"(id),
    "grievanceId" text REFERENCES school."Grievance"(id),
    "uploadedBy" uuid NOT NULL,
    "homeworkSubmissionId" text REFERENCES school."HomeworkSubmission"(id)
);



-- Insert Sample Attendance
INSERT INTO school."Attendance" (
    id,
    date,
    status,
    "studentId",
    "createdAt",
    "updatedAt",
    "classId"
) VALUES (
    '1',
    '2025-01-11 08:00:00',
    'PRESENT',
    '1',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898',
    '1'
);

-- Insert Sample Fee
INSERT INTO school."Fee" (
    id,
    "studentId",
    amount,
    "dueDate",
    "feeType",
    status,
    "createdAt",
    "updatedAt"
) VALUES (
    '1',
    '1',
    1000.00,
    '2025-02-01 00:00:00',
    'TUITION',
    'PENDING',
    '2025-01-11 02:56:25.898',
    '2025-01-11 02:56:25.898'
);

-- Permissions
GRANT SELECT ON TABLE school."Attendance" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Attendance" TO authenticated;

GRANT SELECT ON TABLE school."Class" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Class" TO authenticated;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Classwork" TO authenticated;

GRANT SELECT ON TABLE school."Fee" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Fee" TO authenticated;

GRANT SELECT ON TABLE school."File" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."File" TO authenticated;

GRANT SELECT ON TABLE school."Homework" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Homework" TO authenticated;

GRANT SELECT,INSERT,UPDATE ON TABLE school."Profile" TO authenticated;
GRANT SELECT ON TABLE school."Profile" TO anon;

GRANT SELECT ON TABLE school."School" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."School" TO authenticated;

GRANT SELECT ON TABLE school."Staff" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Staff" TO authenticated;

GRANT SELECT ON TABLE school."Student" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Student" TO authenticated;

GRANT SELECT ON TABLE school."Subject" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Subject" TO authenticated;

GRANT SELECT,INSERT,DELETE,TRIGGER,UPDATE ON TABLE school.feedback TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school.feedback_replies TO authenticated;


-- Additional Staff for existing school (ID: '1')
INSERT INTO school."Staff" (
    id, "employeeId", name, role, qualification, experience, 
    email, "contactNumber", address, "joiningDate", "schoolId", 
    "createdAt", "updatedAt"
) VALUES
('STF201', 'EMP201', 'Anita Desai', 'TEACHER', 'M.Sc Physics', 7, 'anita.desai@school.com', '+91-9811111111', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF202', 'EMP202', 'Suresh Kumar', 'TEACHER', 'M.A Hindi', 9, 'suresh.kumar@school.com', '+91-9811111112', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF203', 'EMP203', 'Meena Sharma', 'ADMIN', 'BBA', 4, 'meena.sharma@school.com', '+91-9811111113', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF204', 'EMP204', 'Rakesh Verma', 'TEACHER', 'M.Sc Chemistry', 6, 'rakesh.verma@school.com', '+91-9811111114', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF205', 'EMP205', 'Sunita Gupta', 'PRINCIPAL', 'Ph.D Chemistry', 12, 'sunita.gupta@school.com', '+91-9811111115', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF206', 'EMP206', 'Arvind Patel', 'TEACHER', 'M.Sc Biology', 8, 'arvind.patel@school.com', '+91-9811111116', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF207', 'EMP207', 'Kavita Singh', 'ACCOUNTANT', 'M.Com', 5, 'kavita.singh@school.com', '+91-9811111117', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF208', 'EMP208', 'Rajiv Malhotra', 'TEACHER', 'M.A English', 10, 'rajiv.malhotra@school.com', '+91-9811111118', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF209', 'EMP209', 'Shalini Kapoor', 'ADMIN', 'MBA', 7, 'shalini.kapoor@school.com', '+91-9811111119', 'Delhi', '2024-01-01', '1', NOW(), NOW()),
('STF210', 'EMP210', 'Mohit Agarwal', 'TEACHER', 'M.Sc Computer Science', 6, 'mohit.agarwal@school.com', '+91-9811111120', 'Delhi', '2024-01-01', '1', NOW(), NOW());

-- Additional Classes for existing school
INSERT INTO school."Class" (
    id, name, section, "roomNumber", capacity, "schoolId", 
    "createdAt", "updatedAt"
) VALUES
('CLS201', 'Class XI', 'A', 'R301', 35, '1', NOW(), NOW()),
('CLS202', 'Class XI', 'B', 'R302', 35, '1', NOW(), NOW()),
('CLS203', 'Class XII', 'A', 'R303', 30, '1', NOW(), NOW()),
('CLS204', 'Class XII', 'B', 'R304', 30, '1', NOW(), NOW()),
('CLS205', 'Class VIII', 'A', 'R305', 40, '1', NOW(), NOW()),
('CLS206', 'Class VIII', 'B', 'R306', 40, '1', NOW(), NOW()),
('CLS207', 'Class VII', 'A', 'R307', 38, '1', NOW(), NOW()),
('CLS208', 'Class VII', 'B', 'R308', 38, '1', NOW(), NOW()),
('CLS209', 'Class VI', 'A', 'R309', 42, '1', NOW(), NOW()),
('CLS210', 'Class VI', 'B', 'R310', 42, '1', NOW(), NOW());

-- Additional Students
INSERT INTO school."Student" (
    id, "admissionNumber", name, "dateOfBirth", gender, address,
    "contactNumber", "parentName", "parentContact", "parentEmail",
    "bloodGroup", "classId", "createdAt", "updatedAt"
) VALUES
('STU201', 'ADM2024101', 'Aarav Kumar', '2009-03-15', 'Male', 'Delhi', '+91-9822222221', 'Rajesh Kumar', '+91-9822222222', 'rajesh.k@email.com', 'B+', 'CLS201', NOW(), NOW()),
('STU202', 'ADM2024102', 'Diya Sharma', '2009-04-20', 'Female', 'Delhi', '+91-9822222223', 'Amit Sharma', '+91-9822222224', 'amit.s@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU203', 'ADM2024103', 'Arjun Singh', '2009-05-25', 'Male', 'Delhi', '+91-9822222225', 'Manish Singh', '+91-9822222226', 'manish.s@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU204', 'ADM2024104', 'Zara Patel', '2009-06-30', 'Female', 'Delhi', '+91-9822222227', 'Rajiv Patel', '+91-9822222228', 'rajiv.p@email.com', 'AB+', 'CLS202', NOW(), NOW()),
('STU205', 'ADM2024105', 'Vihan Gupta', '2009-07-05', 'Male', 'Delhi', '+91-9822222229', 'Anil Gupta', '+91-9822222230', 'anil.g@email.com', 'O-', 'CLS203', NOW(), NOW()),
('STU206', 'ADM2024106', 'Anaya Reddy', '2009-08-10', 'Female', 'Delhi', '+91-9822222231', 'Suresh Reddy', '+91-9822222232', 'suresh.r@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU207', 'ADM2024107', 'Reyansh Shah', '2009-09-15', 'Male', 'Delhi', '+91-9822222233', 'Mehul Shah', '+91-9822222234', 'mehul.s@email.com', 'A-', 'CLS204', NOW(), NOW()),
('STU208', 'ADM2024108', 'Myra Kapoor', '2009-10-20', 'Female', 'Delhi', '+91-9822222235', 'Rohit Kapoor', '+91-9822222236', 'rohit.k@email.com', 'AB-', 'CLS204', NOW(), NOW()),
('STU209', 'ADM2024109', 'Vivaan Malhotra', '2009-11-25', 'Male', 'Delhi', '+91-9822222237', 'Sanjay Malhotra', '+91-9822222238', 'sanjay.m@email.com', 'O+', 'CLS205', NOW(), NOW()),
('STU210', 'ADM2024110', 'Aisha Khan', '2009-12-30', 'Female', 'Delhi', '+91-9822222239', 'Imran Khan', '+91-9822222240', 'imran.k@email.com', 'B+', 'CLS205', NOW(), NOW());

-- Additional Subjects
INSERT INTO school."Subject" (
    id, name, code, "classId", "teacherId",
    "createdAt", "updatedAt"
) VALUES
('SUB201', 'Physics', 'PHY201', 'CLS201', 'STF201', NOW(), NOW()),
('SUB202', 'Chemistry', 'CHEM201', 'CLS201', 'STF204', NOW(), NOW()),
('SUB203', 'Biology', 'BIO201', 'CLS202', 'STF206', NOW(), NOW()),
('SUB204', 'Computer Science', 'CS201', 'CLS202', 'STF210', NOW(), NOW()),
('SUB205', 'Hindi', 'HIN201', 'CLS203', 'STF202', NOW(), NOW()),
('SUB206', 'Social Science', 'SOC201', 'CLS203', 'STF208', NOW(), NOW()),
('SUB207', 'Sanskrit', 'SAN201', 'CLS204', 'STF202', NOW(), NOW()),
('SUB208', 'Environmental Science', 'EVS201', 'CLS204', 'STF206', NOW(), NOW()),
('SUB209', 'Physical Education', 'PE201', 'CLS205', 'STF201', NOW(), NOW()),
('SUB210', 'Art Education', 'ART201', 'CLS205', 'STF204', NOW(), NOW());

-- Additional Homework
INSERT INTO school."Homework" (
    id, title, description, "dueDate", "subjectId",
    status, "createdAt", "updatedAt", "classId"
) VALUES
('HW201', 'Physics Numericals', 'Solve Chapter 5 numericals', '2025-01-25', 'SUB201', 'PENDING', NOW(), NOW(), 'CLS201'),
('HW202', 'Chemistry Practical', 'Complete practical record', '2025-01-26', 'SUB202', 'PENDING', NOW(), NOW(), 'CLS201'),
('HW203', 'Biology Diagram', 'Draw and label cell structure', '2025-01-27', 'SUB203', 'PENDING', NOW(), NOW(), 'CLS202'),
('HW204', 'Programming Exercise', 'Complete Python exercises', '2025-01-28', 'SUB204', 'PENDING', NOW(), NOW(), 'CLS202'),
('HW205', 'Hindi Essay', 'Write essay on environment', '2025-01-29', 'SUB205', 'PENDING', NOW(), NOW(), 'CLS203'),
('HW206', 'History Project', 'Complete medieval India project', '2025-01-30', 'SUB206', 'PENDING', NOW(), NOW(), 'CLS203'),
('HW207', 'Sanskrit Translation', 'Translate passage to Hindi', '2025-01-31', 'SUB207', 'PENDING', NOW(), NOW(), 'CLS204'),
('HW208', 'EVS Project', 'Make project on renewable energy', '2025-02-01', 'SUB208', 'PENDING', NOW(), NOW(), 'CLS204'),
('HW209', 'Sports Report', 'Write report on school sports day', '2025-02-02', 'SUB209', 'PENDING', NOW(), NOW(), 'CLS205'),
('HW210', 'Art Portfolio', 'Complete art portfolio', '2025-02-03', 'SUB210', 'PENDING', NOW(), NOW(), 'CLS205');

-- Additional Homework Submissions
INSERT INTO school."HomeworkSubmission" (
    id, "homeworkId", "studentId", status, "submittedAt"
) VALUES
('HS201', 'HW201', 'STU201', 'SUBMITTED', NOW()),
('HS202', 'HW201', 'STU202', 'PENDING', NOW()),
('HS203', 'HW202', 'STU203', 'COMPLETED', NOW()),
('HS204', 'HW202', 'STU204', 'OVERDUE', NOW()),
('HS205', 'HW203', 'STU205', 'SUBMITTED', NOW()),
('HS206', 'HW203', 'STU206', 'PENDING', NOW()),
('HS207', 'HW204', 'STU207', 'COMPLETED', NOW()),
('HS208', 'HW204', 'STU208', 'SUBMITTED', NOW()),
('HS209', 'HW205', 'STU209', 'PENDING', NOW()),
('HS210', 'HW205', 'STU210', 'OVERDUE', NOW());

-- Additional Attendance Records
INSERT INTO school."Attendance" (
    id, date, status, "studentId", "classId",
    "createdAt", "updatedAt"
) VALUES
('ATT201', '2025-01-12', 'PRESENT', 'STU201', 'CLS201', NOW(), NOW()),
('ATT202', '2025-01-12', 'ABSENT', 'STU202', 'CLS201', NOW(), NOW()),
('ATT203', '2025-01-12', 'PRESENT', 'STU203', 'CLS202', NOW(), NOW()),
('ATT204', '2025-01-12', 'LATE', 'STU204', 'CLS202', NOW(), NOW()),
('ATT205', '2025-01-12', 'PRESENT', 'STU205', 'CLS203', NOW(), NOW()),
('ATT206', '2025-01-12', 'HALF_DAY', 'STU206', 'CLS203', NOW(), NOW()),
('ATT207', '2025-01-12', 'PRESENT', 'STU207', 'CLS204', NOW(), NOW()),
('ATT208', '2025-01-12', 'PRESENT', 'STU208', 'CLS204', NOW(), NOW()),
('ATT209', '2025-01-12', 'ABSENT', 'STU209', 'CLS205', NOW(), NOW()),
('ATT210', '2025-01-12', 'PRESENT', 'STU210', 'CLS205', NOW(), NOW());

-- Additional Fee Records
INSERT INTO school."Fee" (
    id, "studentId", amount, "dueDate", "feeType",
    status, "createdAt", "updatedAt"
) VALUES
('FEE201', 'STU201', 15000.00, '2025-02-01', 'TUITION', 'PENDING', NOW(), NOW()),
('FEE202', 'STU202', 15000.00, '2025-02-01', 'TUITION', 'PAID', NOW(), NOW()),
('FEE203', 'STU203', 5000.00, '2025-02-01', 'LABORATORY', 'PENDING', NOW(), NOW()),
('FEE204', 'STU204', 5000.00, '2025-02-01', 'LABORATORY', 'PAID', NOW(), NOW()),
('FEE205', 'STU205', 2000.00, '2025-02-01', 'LIBRARY', 'PENDING', NOW(), NOW()),
('FEE206', 'STU206', 2000.00, '2025-02-01', 'LIBRARY', 'PAID', NOW(), NOW()),
('FEE207', 'STU207', 3000.00, '2025-02-01', 'TRANSPORT', 'PENDING', NOW(), NOW()),
('FEE208', 'STU208', 3000.00, '2025-02-01', 'TRANSPORT', 'PARTIAL', NOW(), NOW()),
('FEE209', 'STU209', 1000.00, '2025-02-01', 'EXAMINATION', 'PENDING', NOW(), NOW()),
('FEE210', 'STU210', 1000.00, '2025-02-01', 'EXAMINATION', 'PAID', NOW(), NOW());

-- Additional Notifications
INSERT INTO school."Notification" (
    id, title, message, type, "studentId", "isRead",
    "createdAt", "updatedAt"
) VALUES
('NOT201', 'Physics Test Tomorrow', 'Prepare chapters 1-3', 'EXAM', 'STU201', false, NOW(), NOW()),
('NOT202', 'Fee Due Reminder', 'Please clear pending fees', 'FEE', 'STU202', false, NOW(), NOW()),
('NOT203', 'Sports Day', 'Annual sports day next week', 'GENERAL', 'STU203', false, NOW(), NOW()),
('NOT204', 'Parent Meeting', 'Schedule for next Thursday', 'GENERAL', 'STU204', false, NOW(), NOW()),
('NOT205', 'Lab Submission Due', 'Complete all pending records', 'HOMEWORK', 'STU205', false, NOW(), NOW()),
('NOT206', 'Attendance Warning', 'Low attendance this month', 'ATTENDANCE', 'STU206', false, NOW(), NOW()),
('NOT207', 'Library Books Due', 'Return books by Friday', 'GENERAL', 'STU207', false, NOW(), NOW()),
('NOT208', 'Competition Alert', 'Science quiz next week', 'GENERAL', 'STU208', false, NOW(), NOW()),
('NOT209', 'Holiday Notice', 'School closed for Diwali', 'GENERAL', 'STU209', false, NOW(), NOW()),
('NOT210', 'Bus Route Change', 'New pickup point from Monday', 'GENERAL', 'STU210', false, NOW(), NOW());

-- Additional Timetable Entries
INSERT INTO school."TimeTable" (
    id, day, "startTime", "endTime", "classId",
    "subjectId", "createdAt", "updatedAt"
) VALUES
('TT201', 1, '2025-01-11 08:00:00', '2025-01-11 09:00:00', 'CLS201', 'SUB201', NOW(), NOW()),
('TT202', 1, '2025-01-11 09:00:00', '2025-01-11 10:00:00', 'CLS201', 'SUB202', NOW(), NOW()),
('TT203', 2, '2025-01-11 08:00:00', '2025-01-11 09:00:00', 'CLS202', 'SUB203', NOW(), NOW()),
('TT204', 2, '2025-01-11 09:00:00', '2025-01-11 10:00:00', 'CLS202', 'SUB204', NOW(), NOW()),
('TT205', 3, '2025-01-11 08:00:00', '2025-01-11 09:00:00', 'CLS203', 'SUB205', NOW(), NOW()),
('TT206', 3, '2025-01-11 09:00:00', '2025-01-11 10:00:00', 'CLS203', 'SUB206', NOW(), NOW()),
('TT207', 4, '2025-01-11 08:00:00', '2025-01-11 09:00:00', 'CLS204', 'SUB207', NOW(), NOW()),
('TT208', 4, '2025-01-11 09:00:00', '2025-01-11 10:00:00', 'CLS204', 'SUB208', NOW(), NOW()),
('TT209', 5, '2025-01-11 08:00:00', '2025-01-11 09:00:00', 'CLS205', 'SUB209', NOW(), NOW()),
('TT210', 5, '2025-01-11 09:00:00', '2025-01-11 10:00:00', 'CLS205', 'SUB210', NOW(), NOW());

-- Additional Grievances
INSERT INTO school."Grievance" (
    id, title, description, "studentId", status,
    resolution, "createdAt", "updatedAt"
) VALUES
('GR201', 'Transport Issue', 'Bus arriving late', 'STU201', 'OPEN', NULL, NOW(), NOW()),
('GR202', 'Canteen Food Quality', 'Food quality needs improvement', 'STU202', 'IN_PROGRESS', 'Under investigation', NOW(), NOW()),
('GR203', 'Library Access', 'Need extended library hours', 'STU203', 'RESOLVED', 'Library hours extended', NOW(), NOW()),
('GR204', 'Sports Equipment', 'Need new basketball', 'STU204', 'CLOSED', 'New equipment ordered', NOW(), NOW()),
('GR205', 'Classroom Ventilation', 'Poor air circulation', 'STU205', 'OPEN', NULL, NOW(), NOW()),
('GR206', 'Lab Equipment', 'Microscope not working', 'STU206', 'IN_PROGRESS', 'Under repair', NOW(), NOW()),
('GR207', 'Washroom Cleanliness', 'Regular cleaning needed', 'STU207', 'RESOLVED', 'Cleaning schedule updated', NOW(), NOW()),
('GR208', 'Internet Connectivity', 'Weak WiFi in class', 'STU208', 'OPEN', NULL, NOW(), NOW()),
('GR209', 'Drinking Water', 'Water cooler not working', 'STU209', 'IN_PROGRESS', 'Technician assigned', NOW(), NOW()),
('GR210', 'Parking Area', 'Insufficient bicycle stands', 'STU210', 'CLOSED', 'New stands installed', NOW(), NOW());