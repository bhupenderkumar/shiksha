-- Delete existing data
DELETE FROM school."Homework";
DELETE FROM school."Attendance";
DELETE FROM school."Fee";
DELETE FROM school."Subject";
DELETE FROM school."Class";
DELETE FROM school."Student";
DELETE FROM school."School";

-- Insert data into the School table
INSERT INTO school."School" (id, "schoolName", "schoolAddress") VALUES
('1', 'Public School', 'Saurabh Vihar'),
('2', 'Private School', 'Green Valley'),
('3', 'International School', 'Downtown');

-- Insert data into the Student table
INSERT INTO school."Student" (id, "admissionNumber", name, "dateOfBirth", gender, address, "contactNumber", "parentName", "parentContact", "parentEmail", "bloodGroup", "classId", "createdAt", "updatedAt") VALUES
('1', 'AD123', 'John Doe', '2005-05-15 00:00:00', 'Male', '123 Main St', '1234567890', 'Jane Doe', '0987654321', 'jane@example.com', 'O+', '1', NOW(), NOW()),
('2', 'AD124', 'Alice Smith', '2006-06-20 00:00:00', 'Female', '456 Elm St', '2345678901', 'Bob Smith', '8765432109', 'bob@example.com', 'A+', '1', NOW(), NOW()),
('3', 'AD125', 'Mike Johnson', '2005-07-25 00:00:00', 'Male', '789 Pine St', '3456789012', 'Mary Johnson', '7654321098', 'mary@example.com', 'B-', '2', NOW(), NOW());

-- Insert data into the Class table
INSERT INTO school."Class" (id, name, section, "roomNumber", capacity, "schoolId", "createdAt", "updatedAt") VALUES
('1', '10th Grade', 'A', '101', 30, '1', NOW(), NOW()),
('2', '10th Grade', 'B', '102', 30, '1', NOW(), NOW()),
('3', '9th Grade', 'A', '201', 30, '2', NOW(), NOW());

-- Insert data into the Subject table
INSERT INTO school."Subject" (id, name, code, "classId", "teacherId", "createdAt", "updatedAt") VALUES
('1', 'Mathematics', 'MATH101', '1', 'T1', NOW(), NOW()),
('2', 'Science', 'SCI101', '1', 'T2', NOW(), NOW()),
('3', 'English', 'ENG101', '2', 'T3', NOW(), NOW());

-- Insert data into the Homework table
INSERT INTO school."Homework" (id, title, description, "dueDate", "subjectId", status, "createdAt", "updatedAt", "classId") VALUES
('1', 'Math Homework', 'Complete exercises 1 to 10', '2025-01-15 00:00:00', '1', 'PENDING', NOW(), NOW(), '1'),
('2', 'Science Project', 'Prepare a project on ecosystems', '2025-01-20 00:00:00', '2', 'PENDING', NOW(), NOW(), '1'),
('3', 'English Essay', 'Write an essay on your favorite book', '2025-01-25 00:00:00', '3', 'PENDING', NOW(), NOW(), '2');

-- Insert data into the Attendance table
INSERT INTO school."Attendance" (id, date, status, "studentId", "createdAt", "updatedAt", classid) VALUES
('1', '2025-01-10 00:00:00', 'PRESENT', '1', NOW(), NOW(), '1'),
('2', '2025-01-10 00:00:00', 'PRESENT', '2', NOW(), NOW(), '1'),
('3', '2025-01-10 00:00:00', 'ABSENT', '3', NOW(), NOW(), '2');

-- Insert data into the Fee table
INSERT INTO school."Fee" (id, "studentId", amount, "dueDate", "feeType", status, "paymentDate", "paymentMethod", "receiptNumber", "createdAt", "updatedAt") VALUES
('1', '1', 1000.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW()),
('2', '2', 1200.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW()),
('3', '3', 1100.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW());
