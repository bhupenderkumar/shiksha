-- Create foreign key relationship between assignments and assignment_files
ALTER TABLE assignment_files
ADD CONSTRAINT fk_assignment
FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE; 