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
('1', 'Public School', 'Saurabh Vihar');

-- Insert data into the Student table
INSERT INTO school."Student" (id, "admissionNumber", name, "dateOfBirth", gender, address, "contactNumber", "parentName", "parentContact", "parentEmail", "bloodGroup", "classId", "createdAt", "updatedAt") VALUES
('1', 'AD123', 'John Doe', '2005-05-15 00:00:00', 'Male', '123 Main St', '1234567890', 'Jane Doe', '0987654321', 'jane@example.com', 'O+', '1', NOW(), NOW());

-- Insert data into the Class table
INSERT INTO school."Class" (id, name, section, "roomNumber", capacity, "schoolId", "createdAt", "updatedAt") VALUES
('1', '10th Grade', 'A', '101', 30, '1', NOW(), NOW());

-- Insert data into the Subject table
INSERT INTO school."Subject" (id, name, code, "classId", "teacherId", "createdAt", "updatedAt") 
VALUES
('1', 'Mathematics', 'MATH101', '1', 'T1', NOW(), NOW());

-- Insert data into the Homework table
INSERT INTO school."Homework" (id, title, description, "dueDate", "subjectId", status, "createdAt", "updatedAt", "classId") 
VALUES
('1', 'Math Homework', 'Complete exercises 1 to 10', '2025-01-15 00:00:00', '1', 'PENDING', NOW(), NOW(), '1');

-- Insert data into the Attendance table
INSERT INTO school."Attendance" (id, date, status, "studentId", "createdAt", "updatedAt", classid) 
VALUES
('1', '2025-01-10 00:00:00', 'PRESENT', '1', NOW(), NOW(), '1');

-- Insert data into the Fee table
INSERT INTO school."Fee" (id, "studentId", amount, "dueDate", "feeType", status, "paymentDate", "paymentMethod", "receiptNumber", "createdAt", "updatedAt") VALUES
('1', '1', 1000.00, '2025-01-30 00:00:00', 'Tuition', 'UNPAID', NULL, NULL, NULL, NOW(), NOW());






