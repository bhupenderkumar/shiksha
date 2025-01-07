export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  subjectId: string;
  classId: string;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHomeworkDto {
  title: string;
  description: string;
  dueDate: Date;
  subjectId: string;
  classId: string;
}

export interface UpdateHomeworkDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: HomeworkStatus;
} 