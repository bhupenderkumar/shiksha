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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type school."NotificationType" NOT NULL,
  "studentId" TEXT REFERENCES school."Student"(id),
  "classId" TEXT REFERENCES school."Class"(id),
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alter Notification table to make studentId optional
ALTER TABLE school."Notification"
ALTER COLUMN "studentId" DROP NOT NULL;




GRANT SELECT ON TABLE school."Notification" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Notification" TO authenticated;

-- Insert sample notifications
INSERT INTO school."Notification" (title, message, type, "studentId", "classId", "isRead") VALUES ('Welcome to the platform!', 'This is a welcome message.', 'GENERAL', '1', NULL, FALSE);
INSERT INTO school."Notification" (title, message, type, "studentId", "classId", "isRead") VALUES ('Profile Updated', 'Your profile has been updated.', 'GENERAL', '1', NULL, FALSE);

-- Create NotificationStudents table to link notifications with students
CREATE TABLE school."NotificationStudents" (
    notificationId UUID NOT NULL REFERENCES school."Notification"(id),
    studentId TEXT NOT NULL REFERENCES school."Student"(id),
    PRIMARY KEY (notificationId, studentId)
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

GRANT ALL ON SEQUENCE school.feedback_id_seq TO authenticated;

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




-- Delete existing records from the tables
DELETE FROM school."File";
DELETE FROM school."TimeTable";
DELETE FROM school."Notification";
DELETE FROM school."Grievance";
DELETE FROM school."Attendance";
DELETE FROM school."HomeworkSubmission";
DELETE FROM school."Homework";
DELETE FROM school."Fee";
DELETE FROM school."Classwork";
DELETE FROM school."Subject";
DELETE FROM school."Student";
DELETE FROM school."Class";

-- Delete existing records from the tables
DELETE FROM school."HomeworkSubmission";
DELETE FROM school."Homework";
DELETE FROM school."Fee";
DELETE FROM school."Classwork";
DELETE FROM school."Subject";
DELETE FROM school."Student";
DELETE FROM school."Class";

-- Insert new classes
INSERT INTO school."Class" (
    id, name, section, "roomNumber", capacity, "schoolId", 
    "createdAt", "updatedAt"
) VALUES
('CLS201', 'Pre Nursery', 'A', 'R101', 30, '1', NOW(), NOW()),
('CLS202', 'Nursery', 'A', 'R102', 30, '1', NOW(), NOW()),
('CLS203', 'LKG', 'A', 'R103', 30, '1', NOW(), NOW()),
('CLS204', 'UKG', 'A', 'R104', 30, '1', NOW(), NOW());

-- Insert subjects for each class
INSERT INTO school."Subject" (
    id, name, code, "classId", "teacherId",
    "createdAt", "updatedAt"
) VALUES
('SUB201', 'English', 'ENG101', 'CLS201', 'STF201', NOW(), NOW()),
('SUB202', 'Hindi', 'HIN101', 'CLS201', 'STF202', NOW(), NOW()),
('SUB203', 'Maths', 'MATH101', 'CLS201', 'STF203', NOW(), NOW()),
('SUB204', 'EVS', 'EVS101', 'CLS201', 'STF204', NOW(), NOW()),
('SUB205', 'Extra Curricular', 'EC101', 'CLS201', 'STF205', NOW(), NOW()),
('SUB206', 'Computer', 'COMP101', 'CLS201', 'STF206', NOW(), NOW()),
('SUB207', 'English', 'ENG102', 'CLS202', 'STF201', NOW(), NOW()),
('SUB208', 'Hindi', 'HIN102', 'CLS202', 'STF202', NOW(), NOW()),
('SUB209', 'Maths', 'MATH102', 'CLS202', 'STF203', NOW(), NOW()),
('SUB210', 'EVS', 'EVS102', 'CLS202', 'STF204', NOW(), NOW()),
('SUB211', 'Extra Curricular', 'EC102', 'CLS202', 'STF205', NOW(), NOW()),
('SUB212', 'Computer', 'COMP102', 'CLS202', 'STF206', NOW(), NOW()),
('SUB213', 'English', 'ENG103', 'CLS203', 'STF201', NOW(), NOW()),
('SUB214', 'Hindi', 'HIN103', 'CLS203', 'STF202', NOW(), NOW()),
('SUB215', 'Maths', 'MATH103', 'CLS203', 'STF203', NOW(), NOW()),
('SUB216', 'EVS', 'EVS103', 'CLS203', 'STF204', NOW(), NOW()),
('SUB217', 'Extra Curricular', 'EC103', 'CLS203', 'STF205', NOW(), NOW()),
('SUB218', 'Computer', 'COMP103', 'CLS203', 'STF206', NOW(), NOW()),
('SUB219', 'English', 'ENG104', 'CLS204', 'STF201', NOW(), NOW()),
('SUB220', 'Hindi', 'HIN104', 'CLS204', 'STF202', NOW(), NOW()),
('SUB221', 'Maths', 'MATH104', 'CLS204', 'STF203', NOW(), NOW()),
('SUB222', 'EVS', 'EVS104', 'CLS204', 'STF204', NOW(), NOW()),
('SUB223', 'Extra Curricular', 'EC104', 'CLS204', 'STF205', NOW(), NOW());

-- Insert Student Records
INSERT INTO school."Student" (
    id, "admissionNumber", name, "dateOfBirth", gender, address,
    "contactNumber", "parentName", "parentContact", "parentEmail",
    "bloodGroup", "classId", "createdAt", "updatedAt"
) VALUES
('STU301', 'ADM2024101', 'Atiksh', '2024-01-01', 'Male', 'Address 1', '+91-1234567890', 'Parent 1', '+91-1234567891', 'parent1@email.com', 'O+', 'CLS203', NOW(), NOW()),
('STU302', 'ADM2024102', 'Diyanshi', '2024-01-01', 'Female', 'Address 2', '+91-1234567892', 'Parent 2', '+91-1234567893', 'parent2@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU303', 'ADM2024103', 'Shanvi Sharma', '2024-03-21', 'Female', 'Address 3', '+91-1234567894', 'Parent 3', '+91-1234567895', 'parent3@email.com', 'B+', 'CLS203', NOW(), NOW()),
('STU304', 'ADM2024104', 'Vanika Yadav', '2024-03-22', 'Female', 'Address 4', '+91-1234567896', 'Parent 4', '+91-1234567897', 'parent4@email.com', 'AB+', 'CLS202', NOW(), NOW()),
('STU305', 'ADM2024105', 'Ishan Kumar', '2024-03-23', 'Male', 'Address 5', '+91-1234567898', 'Parent 5', '+91-1234567899', 'parent5@email.com', 'O-', 'CLS202', NOW(), NOW()),
('STU306', 'ADM2024106', 'Niharika', '2024-01-01', 'Female', 'Address 6', '+91-1234567800', 'Parent 6', '+91-1234567801', 'parent6@email.com', 'A-', 'CLS203', NOW(), NOW()),
('STU307', 'ADM2024107', 'Maadhav Chauhan', '2024-01-01', 'Male', 'Address 7', '+91-1234567802', 'Parent 7', '+91-1234567803', 'parent7@email.com', 'B+', 'CLS202', NOW(), NOW()),
('STU308', 'ADM2024108', 'Shivansh Thakur', '2024-03-27', 'Male', 'Address 8', '+91-1234567804', 'Parent 8', '+91-1234567805', 'parent8@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU309', 'ADM2024109', 'Akshit Rathor', '2024-03-27', 'Male', 'Address 9', '+91-1234567806', 'Parent 9', '+91-1234567807', 'parent9@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU310', 'ADM2024110', 'Sargun Kaur', '2024-03-27', 'Female', 'Address 10', '+91-1234567808', 'Parent 10', '+91-1234567809', 'parent10@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU311', 'ADM2024111', 'Ayush Raj Soni', '2024-03-28', 'Male', 'Address 11', '+91-1234567810', 'Parent 11', '+91-1234567811', 'parent11@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU312', 'ADM2024112', 'Kartik', '2024-03-29', 'Male', 'Address 12', '+91-1234567812', 'Parent 12', '+91-1234567813', 'parent12@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU313', 'ADM2024113', 'Ishank Saini', '2024-03-30', 'Male', 'Address 13', '+91-1234567814', 'Parent 13', '+91-1234567815', 'parent13@email.com', 'B+', 'CLS201', NOW(), NOW()),
('STU314', 'ADM2024114', 'Aniket Jaiswal', '2024-04-01', 'Male', 'Address 14', '+91-1234567816', 'Parent 14', '+91-1234567817', 'parent14@email.com', 'O-', 'CLS202', NOW(), NOW()),
('STU315', 'ADM2024115', 'Vivaan Singh', '2024-04-01', 'Male', 'Address 15', '+91-1234567818', 'Parent 15', '+91-1234567819', 'parent15@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU316', 'ADM2024116', 'Ahvan', '2024-04-01', 'Male', 'Address 16', '+91-1234567820', 'Parent 16', '+91-1234567821', 'parent16@email.com', 'B+', 'CLS202', NOW(), NOW()),
('STU317', 'ADM2024117', 'Abdul', '2024-04-01', 'Male', 'Address 17', '+91-1234567822', 'Parent 17', '+91-1234567823', 'parent17@email.com', 'O+', 'CLS203', NOW(), NOW()),
('STU318', 'ADM2024118', 'Aayesha', '2024-04-02', 'Female', 'Address 18', '+91-1234567824', 'Parent 18', '+91-1234567825', 'parent18@email.com', 'A-', 'CLS202', NOW(), NOW()),
('STU319', 'ADM2024119', 'Satvik Kumar', '2024-04-02', 'Male', 'Address 19', '+91-1234567826', 'Parent 19', '+91-1234567827', 'parent19@email.com', 'B-', 'CLS204', NOW(), NOW()),
('STU320', 'ADM2024120', 'Atharav', '2024-04-02', 'Male', 'Address 20', '+91-1234567828', 'Parent 20', '+91-1234567829', 'parent20@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU321', 'ADM2024121', 'Vedank Pandit', '2024-04-02', 'Male', 'Address 21', '+91-1234567830', 'Parent 21', '+91-1234567831', 'parent21@email.com', 'A+', 'CLS203', NOW(), NOW()),
('STU322', 'ADM2024122', 'Shivnash', '2024-04-02', 'Male', 'Address 22', '+91-1234567832', 'Parent 22', '+91-1234567833', 'parent22@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU323', 'ADM2024123', 'Raj Sharma', '2024-04-03', 'Male', 'Address 23', '+91-1234567834', 'Parent 23', '+91-1234567835', 'parent23@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU324', 'ADM2024124', 'Demira', '2024-04-03', 'Female', 'Address 24', '+91-1234567836', 'Parent 24', '+91-1234567837', 'parent24@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU325', 'ADM2024125', 'Jatin Rawat', '2024-04-03', 'Male', 'Address 25', '+91-1234567838', 'Parent 25', '+91-1234567839', 'parent25@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU326', 'ADM2024126', 'Ronit', '2024-04-03', 'Male', 'Address 26', '+91-1234567840', 'Parent 26', '+91-1234567841', 'parent26@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU327', 'ADM2024127', 'Aditya', '2024-04-04', 'Male', 'Address 27', '+91-1234567842', 'Parent 27', '+91-1234567843', 'parent27@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU328', 'ADM2024128', 'Divyanshi Das', '2024-04-04', 'Female', 'Address 28', '+91-1234567844', 'Parent 28', '+91-1234567845', 'parent28@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU329', 'ADM2024129', 'Pranav Vashith', '2024-04-04', 'Male', 'Address 29', '+91-1234567846', 'Parent 29', '+91-1234567847', 'parent29@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU330', 'ADM2024130', 'Riyanshi', '2024-04-04', 'Female', 'Address 30', '+91-1234567848', 'Parent 30', '+91-1234567849', 'parent30@email.com', 'A+', 'CLS203', NOW(), NOW()),
('STU331', 'ADM2024131', 'Anvika', '2024-04-05', 'Female', 'Address 31', '+91-1234567850', 'Parent 31', '+91-1234567851', 'parent31@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU332', 'ADM2024132', 'Bhuvika', '2024-04-05', 'Female', 'Address 32', '+91-1234567852', 'Parent 32', '+91-1234567853', 'parent32@email.com', 'O+', 'CLS203', NOW(), NOW()),
('STU333', 'ADM2024133', 'Inayat Praveen', '2024-04-06', 'Male', 'Address 33', '+91-1234567854', 'Parent 33', '+91-1234567855', 'parent33@email.com', 'A+', 'CLS203', NOW(), NOW()),
('STU334', 'ADM2024134', 'Emica', '2024-04-06', 'Female', 'Address 34', '+91-1234567856', 'Parent 34', '+91-1234567857', 'parent34@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU335', 'ADM2024135', 'Shavni Sharma', '2024-04-05', 'Female', 'Address 35', '+91-1234567858', 'Parent 35', '+91-1234567859', 'parent35@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU336', 'ADM2024136', 'Raunak Kumar Thakur', '2024-04-08', 'Male', 'Address 36', '+91-1234567860', 'Parent 36', '+91-1234567861', 'parent36@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU337', 'ADM2024137', 'Anaya Yadav', '2024-04-07', 'Female', 'Address 37', '+91-1234567862', 'Parent 37', '+91-1234567863', 'parent37@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU338', 'ADM2024138', 'Lakshya Parashar', '2024-04-08', 'Male', 'Address 38', '+91-1234567864', 'Parent 38', '+91-1234567865', 'parent38@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU339', 'ADM2024139', 'Atiksha', '2024-04-08', 'Female', 'Address 39', '+91-1234567866', 'Parent 39', '+91-1234567867', 'parent39@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU340', 'ADM2024140', 'Shivansh Kaushik', '2024-04-09', 'Male', 'Address 40', '+91-1234567868', 'Parent 40', '+91-1234567869', 'parent40@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU341', 'ADM2024141', 'Harshita', '2024-04-10', 'Female', 'Address 41', '+91-1234567870', 'Parent 41', '+91-1234567871', 'parent41@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU342', 'ADM2024142', 'Kairav Tomar', '2024-04-10', 'Male', 'Address 42', '+91-1234567872', 'Parent 42', '+91-1234567873', 'parent42@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU343', 'ADM2024143', 'Aarohi Gupta', '2024-04-10', 'Female', 'Address 43', '+91-1234567874', 'Parent 43', '+91-1234567875', 'parent43@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU344', 'ADM2024144', 'Bhumi', '2024-04-10', 'Female', 'Address 44', '+91-1234567876', 'Parent 44', '+91-1234567877', 'parent44@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU345', 'ADM2024145', 'Daisy', '2024-04-10', 'Female', 'Address 45', '+91-1234567878', 'Parent 45', '+91-1234567879', 'parent45@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU346', 'ADM2024146', 'Dhairya', '2024-04-10', 'Male', 'Address 46', '+91-1234567880', 'Parent 46', '+91-1234567881', 'parent46@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU347', 'ADM2024147', 'Kartik', '2024-04-10', 'Male', 'Address 47', '+91-1234567882', 'Parent 47', '+91-1234567883', 'parent47@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU348', 'ADM2024148', 'Akshay Pal', '2024-04-10', 'Male', 'Address 48', '+91-1234567884', 'Parent 48', '+91-1234567885', 'parent48@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU349', 'ADM2024149', 'Kartik Rathor', '2024-04-10', 'Male', 'Address 49', '+91-1234567886', 'Parent 49', '+91-1234567887', 'parent49@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU350', 'ADM2024150', 'Yashika', '2024-04-10', 'Female', 'Address 50', '+91-1234567888', 'Parent 50', '+91-1234567889', 'parent50@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU351', 'ADM2024151', 'Advait', '2024-04-10', 'Male', 'Address 51', '+91-1234567890', 'Parent 51', '+91-1234567891', 'parent51@email.com', 'A+', 'CLS203', NOW(), NOW()),
('STU352', 'ADM2024152', 'Bhavya', '2024-04-11', 'Female', 'Address 52', '+91-1234567892', 'Parent 52', '+91-1234567893', 'parent52@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU353', 'ADM2024153', 'Prisha', '2024-04-15', 'Female', 'Address 53', '+91-1234567894', 'Parent 53', '+91-1234567895', 'parent53@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU354', 'ADM2024154', 'Ansh Kumar', '2024-04-15', 'Male', 'Address 54', '+91-1234567896', 'Parent 54', '+91-1234567897', 'parent54@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU355', 'ADM2024155', 'Nischay', '2024-04-15', 'Male', 'Address 55', '+91-1234567898', 'Parent 55', '+91-1234567899', 'parent55@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU356', 'ADM2024156', 'Prince Nagyan', '2024-04-21', 'Male', 'Address 56', '+91-1234567800', 'Parent 56', '+91-1234567801', 'parent56@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU357', 'ADM2024157', 'Ankur Kumar Singh', '2024-04-21', 'Male', 'Address 57', '+91-1234567802', 'Parent 57', '+91-1234567803', 'parent57@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU358', 'ADM2024158', 'Avan', '2024-04-23', 'Male', 'Address 58', '+91-1234567804', 'Parent 58', '+91-1234567805', 'parent58@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU359', 'ADM2024159', 'Garima', '2024-04-23', 'Female', 'Address 59', '+91-1234567806', 'Parent 59', '+91-1234567807', 'parent59@email.com', 'O+', 'CLS203', NOW(), NOW()),
('STU360', 'ADM2024160', 'Yashi', '2024-04-23', 'Female', 'Address 60', '+91-1234567808', 'Parent 60', '+91-1234567809', 'parent60@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU361', 'ADM2024161', 'Harshit Raj', '2024-04-24', 'Male', 'Address 61', '+91-1234567810', 'Parent 61', '+91-1234567811', 'parent61@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU362', 'ADM2024162', 'Priyansh Thapa', '2024-04-24', 'Male', 'Address 62', '+91-1234567812', 'Parent 62', '+91-1234567813', 'parent62@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU363', 'ADM2024163', 'Ansh Rawat', '2024-04-29', 'Male', 'Address 63', '+91-1234567814', 'Parent 63', '+91-1234567815', 'parent63@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU364', 'ADM2024164', 'Keerti Kumari', '2024-05-01', 'Female', 'Address 64', '+91-1234567816', 'Parent 64', '+91-1234567817', 'parent64@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU365', 'ADM2024165', 'Amit Singh', '2024-05-02', 'Male', 'Address 65', '+91-1234567818', 'Parent 65', '+91-1234567819', 'parent65@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU366', 'ADM2024166', 'Virasat Singh', '2024-05-03', 'Male', 'Address 66', '+91-1234567820', 'Parent 66', '+91-1234567821', 'parent66@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU367', 'ADM2024167', 'Radha(Bani)', '2024-05-03', 'Female', 'Address 67', '+91-1234567822', 'Parent 67', '+91-1234567823', 'parent67@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU368', 'ADM2024168', 'Kanav', '2024-05-06', 'Male', 'Address 68', '+91-1234567824', 'Parent 68', '+91-1234567825', 'parent68@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU369', 'ADM2024169', 'Hitesh Kunwar', '2024-05-06', 'Male', 'Address 69', '+91-1234567826', 'Parent 69', '+91-1234567827', 'parent69@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU370', 'ADM2024170', 'Prateek', '2024-05-06', 'Male', 'Address 70', '+91-1234567828', 'Parent 70', '+91-1234567829', 'parent70@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU371', 'ADM2024171', 'Neeshika', '2024-05-09', 'Female', 'Address 71', '+91-1234567830', 'Parent 71', '+91-1234567831', 'parent71@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU372', 'ADM2024172', 'Ansh Thapriyal', '2024-05-10', 'Male', 'Address 72', '+91-1234567832', 'Parent 72', '+91-1234567833', 'parent72@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU373', 'ADM2024173', 'Saanvi', '2024-05-10', 'Female', 'Address 73', '+91-1234567834', 'Parent 73', '+91-1234567835', 'parent73@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU374', 'ADM2024174', 'Viraj Singh', '2024-05-13', 'Male', 'Address 74', '+91-1234567836', 'Parent 74', '+91-1234567837', 'parent74@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU375', 'ADM2024175', 'Aarohi Saini', '2024-05-14', 'Female', 'Address 75', '+91-1234567840', 'Parent 75', '+91-1234567841', 'parent75@email.com', 'A+', 'CLS203', NOW(), NOW()),
('STU376', 'ADM2024176', 'Ranjana Kumari', '2024-05-15', 'Female', 'Address 76', '+91-1234567842', 'Parent 76', '+91-1234567843', 'parent76@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU377', 'ADM2024177', 'Abhinay Gupta', '2024-05-15', 'Male', 'Address 77', '+91-1234567844', 'Parent 77', '+91-1234567845', 'parent77@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU378', 'ADM2024178', 'Naman Singh', '2024-06-29', 'Male', 'Address 78', '+91-1234567846', 'Parent 78', '+91-1234567847', 'parent78@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU379', 'ADM2024179', 'Nayan Singh', '2024-06-29', 'Male', 'Address 79', '+91-1234567848', 'Parent 79', '+91-1234567849', 'parent79@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU380', 'ADM2024180', 'Kiyansh Mandal', '2024-07-01', 'Male', 'Address 80', '+91-1234567848', 'Parent 80', '+91-1234567849', 'parent80@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU381', 'ADM2024181', 'Dhruv Pawar', '2024-07-03', 'Male', 'Address 81', '+91-1234567850', 'Parent 81', '+91-1234567851', 'parent81@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU382', 'ADM2024182', 'Athrav Kashyap', '2024-07-03', 'Male', 'Address 82', '+91-1234567852', 'Parent 82', '+91-1234567853', 'parent82@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU383', 'ADM2024183', 'Shivaay Rawat', '2024-07-06', 'Male', 'Address 83', '+91-1234567854', 'Parent 83', '+91-1234567855', 'parent83@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU384', 'ADM2024184', 'Abhinav', '2024-07-13', 'Male', 'Address 84', '+91-1234567856', 'Parent 84', '+91-1234567857', 'parent84@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU385', 'ADM2024185', 'Shivansh', '2024-06-27', 'Male', 'Address 85', '+91-1234567858', 'Parent 85', '+91-1234567859', 'parent85@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU386', 'ADM2024186', 'Aniket Bhakta', '2024-07-09', 'Male', 'Address 86', '+91-1234567860', 'Parent 86', '+91-1234567861', 'parent86@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU387', 'ADM2024187', 'Harnaaz', '2024-07-10', 'Male', 'Address 87', '+91-1234567862', 'Parent 87', '+91-1234567863', 'parent87@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU388', 'ADM2024188', 'Ritika Kumari', '2024-07-11', 'Female', 'Address 88', '+91-1234567864', 'Parent 88', '+91-1234567865', 'parent88@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU389', 'ADM2024189', 'Rudra Sagar', '2024-01-01', 'Male', 'Address 89', '+91-1234567866', 'Parent 89', '+91-1234567867', 'parent89@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU390', 'ADM2024190', 'Garvik', '2024-01-01', 'Male', 'Address 90', '+91-1234567868', 'Parent 90', '+91-1234567869', 'parent90@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU391', 'ADM2024191', 'Vedank Verma', '2024-01-01', 'Male', 'Address 91', '+91-1234567870', 'Parent 91', '+91-1234567871', 'parent91@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU392', 'ADM2024192', 'Rudransh Kumar Singh', '2024-01-01', 'Male', 'Address 92', '+91-1234567872', 'Parent 92', '+91-1234567873', 'parent92@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU393', 'ADM2024193', 'Nayra', '2024-01-01', 'Female', 'Address 93', '+91-1234567874', 'Parent 93', '+91-1234567875', 'parent93@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU394', 'ADM2024194', 'Maanvi', '2024-01-01', 'Female', 'Address 94', '+91-1234567876', 'Parent 94', '+91-1234567877', 'parent94@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU395', 'ADM2024195', 'Aarav Bansal', '2024-01-01', 'Male', 'Address 95', '+91-1234567878', 'Parent 95', '+91-1234567879', 'parent95@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU396', 'ADM2024196', 'Avni', '2024-01-01', 'Female', 'Address 96', '+91-1234567880', 'Parent 96', '+91-1234567881', 'parent96@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU397', 'ADM2024197', 'Viraj Kumar', '2024-01-01', 'Male', 'Address 97', '+91-1234567882', 'Parent 97', '+91-1234567883', 'parent97@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU398', 'ADM2024198', 'Shivansh Jha', '2024-01-01', 'Male', 'Address 98', '+91-1234567884', 'Parent 98', '+91-1234567885', 'parent98@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU399', 'ADM2024199', 'Ayansh', '2024-01-01', 'Male', 'Address 99', '+91-1234567886', 'Parent 99', '+91-1234567887', 'parent99@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU400', 'ADM2024200', 'Drona', '2024-01-01', 'Male', 'Address 100', '+91-1234567888', 'Parent 100', '+91-1234567889', 'parent100@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU401', 'ADM2024201', 'Nitya', '2024-01-01', 'Female', 'Address 101', '+91-1234567890', 'Parent 101', '+91-1234567891', 'parent101@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU402', 'ADM2024202', 'Anvi Upadhay', '2024-07-24', 'Female', 'Address 102', '+91-1234567892', 'Parent 102', '+91-1234567893', 'parent102@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU403', 'ADM2024203', 'Ayushman', '2024-07-24', 'Male', 'Address 103', '+91-1234567894', 'Parent 103', '+91-1234567895', 'parent103@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU404', 'ADM2024204', 'Rudransh Kumar Gargi', '2024-01-01', 'Male', 'Address 104', '+91-1234567896', 'Parent 104', '+91-1234567897', 'parent104@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU405', 'ADM2024205', 'Aaliya', '2024-01-01', 'Female', 'Address 105', '+91-1234567898', 'Parent 105', '+91-1234567899', 'parent105@email.com', 'A+', 'CLS204', NOW(), NOW()),
('STU406', 'ADM2024206', 'Gurnoor', '2024-07-30', 'Male', 'Address 106', '+91-1234567800', 'Parent 106', '+91-1234567801', 'parent106@email.com', 'B-', 'CLS201', NOW(), NOW()),
('STU407', 'ADM2024207', 'Prisha Chaudhary', '2024-08-03', 'Female', 'Address 107', '+91-1234567802', 'Parent 107', '+91-1234567803', 'parent107@email.com', 'O+', 'CLS202', NOW(), NOW()),
('STU408', 'ADM2024208', 'Aviraj', '2024-08-06', 'Male', 'Address 108', '+91-1234567804', 'Parent 108', '+91-1234567805', 'parent108@email.com', 'A+', 'CLS202', NOW(), NOW()),
('STU409', 'ADM2024209', 'Vishal', '2024-08-09', 'Male', 'Address 109', '+91-1234567806', 'Parent 109', '+91-1234567807', 'parent109@email.com', 'B-', 'CLS203', NOW(), NOW()),
('STU410', 'ADM2024210', 'Pratyaksh Patel', '2024-08-12', 'Male', 'Address 110', '+91-1234567808', 'Parent 110', '+91-1234567809', 'parent110@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU411', 'ADM2024211', 'Avyaan Yadav', '2024-07-24', 'Male', 'Address 111', '+91-1234567810', 'Parent 111', '+91-1234567811', 'parent111@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU412', 'ADM2024212', 'Deepanshu', '2024-01-01', 'Male', 'Address 112', '+91-1234567812', 'Parent 112', '+91-1234567813', 'parent112@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU413', 'ADM2024213', 'Dharvi(Pragya)', '2024-09-04', 'Female', 'Address 113', '+91-1234567814', 'Parent 113', '+91-1234567815', 'parent113@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU414', 'ADM2024214', 'Farhaan', '2024-08-28', 'Male', 'Address 114', '+91-1234567816', 'Parent 114', '+91-1234567817', 'parent114@email.com', 'A+', 'CLS201', NOW(), NOW()),
('STU415', 'ADM2024215', 'Myra Jindal', '2024-01-01', 'Female', 'Address 115', '+91-1234567818', 'Parent 115', '+91-1234567819', 'parent115@email.com', 'B-', 'CLS202', NOW(), NOW()),
('STU416', 'ADM2024216', 'Kanha', '2024-0   1-01', 'Male', 'Address 116', '+91-1234567820', 'Parent 116', '+91-1234567821', 'parent116@email.com', 'O+', 'CLS201', NOW(), NOW()),
('STU417', 'ADM2024217', 'Aaliya', '2024-01-01', 'Female', 'Address 117', '+91-1234567822', 'Parent 117', '+91-1234567823', 'parent117@email.com', 'A+', 'CLS204', NOW(), NOW());




-- Recreate the UserSettings table with a UNIQUE constraint on user_id
CREATE TABLE IF NOT EXISTS school."UserSettings" (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL, -- This will be the UID from Supabase authentication
notifications JSONB NOT NULL,
theme JSONB NOT NULL,
security JSONB NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id) -- Ensure each user has only one settings entry
);


grant select on school."UserSettings" to anon;
grant select, insert on school."UserSettings" to authenticated;

