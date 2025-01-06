-- Drop existing foreign key constraints
ALTER TABLE "school"."Homework" DROP CONSTRAINT IF EXISTS "Homework_studentId_fkey";

-- Add new columns and constraints
ALTER TABLE "school"."Homework" 
ADD COLUMN "classId" TEXT;

-- Add foreign key for classId
ALTER TABLE "school"."Homework" 
ADD CONSTRAINT "Homework_classId_fkey" 
FOREIGN KEY ("classId") REFERENCES "school"."Class"("id");

-- Create HomeworkSubmission table
CREATE TABLE "school"."HomeworkSubmission" (
    "id" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "school"."HomeworkStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for HomeworkSubmission
ALTER TABLE "school"."HomeworkSubmission" 
ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" 
FOREIGN KEY ("homeworkId") REFERENCES "school"."Homework"("id");

ALTER TABLE "school"."HomeworkSubmission" 
ADD CONSTRAINT "HomeworkSubmission_studentId_fkey" 
FOREIGN KEY ("studentId") REFERENCES "school"."Student"("id");

-- Update File table to include HomeworkSubmission relation
ALTER TABLE "school"."File" 
ADD COLUMN "homeworkSubmissionId" TEXT;

ALTER TABLE "school"."File" 
ADD CONSTRAINT "File_homeworkSubmissionId_fkey" 
FOREIGN KEY ("homeworkSubmissionId") REFERENCES "school"."HomeworkSubmission"("id");
