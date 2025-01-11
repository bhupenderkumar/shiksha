-- Drop existing schema
DROP SCHEMA IF EXISTS school CASCADE;

-- Create new schema
CREATE SCHEMA school;

-- Create the School table
CREATE TABLE school."School" (
    id text NOT NULL,
    "schoolName" text NOT NULL,
    "schoolAddress" text NOT NULL,
    PRIMARY KEY (id)
);

-- Create the Student table
CREATE TABLE school."Student" (
    id text NOT NULL,
    "admissionNumber" text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    address text NOT NULL,
    "contactNumber" text NOT NULL,
    "parentName" text NOT NULL,
    "parentContact" text NOT NULL,
    "parentEmail" text NOT NULL,
    "bloodGroup" text,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("classId") REFERENCES school."Class"(id)
);

-- Create the Class table
CREATE TABLE school."Class" (
    id text NOT NULL,
    name text NOT NULL,
    section text NOT NULL,
    "roomNumber" text,
    capacity integer NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("schoolId") REFERENCES school."School"(id)
);

-- Create the Subject table
CREATE TABLE school."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("classId") REFERENCES school."Class"(id)
);

-- Create the Homework table
CREATE TABLE school."Homework" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "subjectId" text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("subjectId") REFERENCES school."Subject"(id),
    FOREIGN KEY ("classId") REFERENCES school."Class"(id)
);

-- Create the Attendance table
CREATE TABLE school."Attendance" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "studentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    classid text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("studentId") REFERENCES school."Student"(id),
    FOREIGN KEY (classid) REFERENCES school."Class"(id)
);

-- Create the Fee table
CREATE TABLE school."Fee" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "feeType" text NOT NULL,
    status text NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "receiptNumber" text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("studentId") REFERENCES school."Student"(id)
);

-- Insert bulk data into the School table
INSERT INTO school."School" (id, "schoolName", "schoolAddress") VALUES
('1', 'Public School', 'Saurabh Vihar'),
('2', 'Private School', 'Green Valley'),
('3', 'International School', 'Downtown');

-- Insert bulk data into the Student table
INSERT INTO school."Student" (id, "admissionNumber", name, "dateOfBirth", gender, address, "contactNumber", "parentName", "parentContact", "parentEmail", "bloodGroup", "classId", "createdAt", "updatedAt") VALUES
('1', 'AD123', 'John Doe', '2005-05-15 00:00:00', 'Male', '123 Main St', '1234567890', 'Jane Doe', '0987654321', 'jane@example.com', 'O+', '1', NOW(), NOW()),
('2', 'AD124', 'Alice Smith', '2006-06-20 00:00:00', 'Female', '456 Elm St', '2345678901', 'Bob Smith', '8765432109', 'bob@example.com', 'A+', '1', NOW(), NOW()),
('3', 'AD125', 'Mike Johnson', '2005-07-25 00:00:00', 'Male', '789 Pine St', '3456789012', 'Mary Johnson', '7654321098', 'mary@example.com', 'B-', '2', NOW(), NOW());

-- Insert bulk data into the Class table
INSERT INTO school."Class" (id, name, section, "roomNumber", capacity, "schoolId", "createdAt", "updatedAt") VALUES
('1', '10th Grade', 'A', '101', 30, '1', NOW(), NOW()),
('2', '10th Grade', 'B', '102', 30, '1', NOW(), NOW()),
('3', '9th Grade', 'A', '201', 30, '2', NOW(), NOW());

-- Insert bulk data into the Subject table
INSERT INTO school."Subject" (id, name, code, "classId", "teacherId", "createdAt", "updatedAt") VALUES
('1', 'Mathematics', 'MATH101', '1', 'T1', NOW(), NOW()),
('2', 'Science', 'SCI101', '1', 'T2', NOW(), NOW()),
('3', 'English', 'ENG101', '2', 'T3', NOW(), NOW());

-- Insert bulk data into the Homework table
INSERT INTO school."Homework" (id, title, description, "dueDate", "subjectId", status, "createdAt", "updatedAt", "classId") VALUES
('1', 'Math Homework', 'Complete exercises 1 to 10', '2025-01-15 00:00:00', '1', 'PENDING', NOW(), NOW(), '1'),
('2', 'Science Project', 'Prepare a project on ecosystems', '2025-01-20 00:00:00', '2', 'PENDING', NOW(), NOW(), '1'),
('3', 'English Essay', 'Write an essay on your favorite book', '2025-01-25 00:00:00', '3', 'PENDING', NOW(), NOW(), '2');

-- Insert bulk data into the Attendance table
INSERT INTO school."Attendance" (id, date, status, "studentId", "createdAt", "updatedAt", classid) VALUES
('1', '2025-01-10 00:00:00', 'PRESENT', '1', NOW(), NOW(), '1'),
('2', '2025-01-10 00:00:00', 'PRESENT', '2', NOW(), NOW(), '1'),
('3', '2025-01-10 00:00:00', 'ABSENT', '3', NOW(), NOW(), '2');

-- Insert bulk data into the Fee table
INSERT INTO school."Fee" (id, "studentId", amount, "dueDate", "feeType", status, "paymentDate", "paymentMethod", "receiptNumber", "createdAt", "updatedAt") VALUES
('1', '1', 1000.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW()),
('2', '2', 1200.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW()),
('3', '3', 1100.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW());
