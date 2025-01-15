-- Insert Classes
INSERT INTO school."Class" (id, name, section, "roomNumber", capacity, "schoolId", "createdAt", "updatedAt") VALUES
('CLS001', 'LKG', 'A', '101', 30, 'SCH001', NOW(), NOW()),
('CLS002', 'Nur', 'A', '102', 30, 'SCH001', NOW(), NOW()),
('CLS003', 'Pre', 'A', '103', 30, 'SCH001', NOW(), NOW()),
('CLS004', 'UKG', 'A', '104', 30, 'SCH001', NOW(), NOW());

-- Insert Subjects
INSERT INTO school."Subject" (id, name, code, class_id, teacher_id, created_at, updated_at) VALUES
('SUB001', 'Hindi', 'HIN101', 'CLS001', 'STF201', NOW(), NOW()),
('SUB002', 'English', 'ENG101', 'CLS001', 'STF202', NOW(), NOW()),
('SUB003', 'Mathematics', 'MATH101', 'CLS001', 'STF203', NOW(), NOW()),
('SUB004', 'Environmental Science', 'EVS101', 'CLS001', 'STF204', NOW(), NOW()),
('SUB005', 'Computer', 'COMP101', 'CLS001', 'STF205', NOW(), NOW()),
('SUB006', 'Extra Curricular Activity', 'ECA101', 'CLS001', 'STF206', NOW(), NOW());

-- Insert Students
INSERT INTO school."Student" (id, name, class_id, admission_date, created_at, updated_at) VALUES
('STU001', 'Atiksh', 'CLS001', NULL, NOW(), NOW()),
('STU002', 'Diyanshi', 'CLS003', NULL, NOW(), NOW()),
('STU003', 'Shanvi Sharma', 'CLS001', '2024-03-21', NOW(), NOW()),
('STU004', 'Vanika Yadav', 'CLS002', '2024-03-22', NOW(), NOW()),
('STU005', 'Ishan Kumar', 'CLS002', '2024-03-23', NOW(), NOW());
-- Continue for other students
