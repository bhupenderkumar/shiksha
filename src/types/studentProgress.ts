import { InteractiveAssignment, InteractiveResponse, SubmissionStatus } from './interactiveAssignment';

export interface StudentProgress {
  id: string;
  studentId: string;
  assignmentId: string;
  status: ProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  timeSpent?: number; // in seconds
  score?: number;
  attempts: number;
  lastAttemptAt?: Date;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
  assignment?: InteractiveAssignment;
}

export type ProgressStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'GRADED';

export interface StudentProgressSummary {
  totalAssignments: number;
  completedAssignments: number;
  averageScore?: number;
  totalTimeSpent: number; // in seconds
  assignmentsByType: {
    type: string;
    count: number;
    completed: number;
  }[];
  recentAssignments: {
    id: string;
    title: string;
    status: ProgressStatus;
    score?: number;
    completedAt?: Date;
  }[];
}

export interface CreateStudentProgressData {
  studentId: string;
  assignmentId: string;
  status: ProgressStatus;
}

export interface UpdateStudentProgressData {
  status?: ProgressStatus;
  completedAt?: Date;
  timeSpent?: number;
  score?: number;
  attempts?: number;
  lastAttemptAt?: Date;
  feedback?: string;
}

export interface StudentPerformanceAnalytics {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
  };
  overallProgress: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    averageScore?: number;
  };
  progressByType: {
    type: string;
    assigned: number;
    completed: number;
    averageScore?: number;
  }[];
  progressOverTime: {
    period: string; // e.g., "Week 1", "Week 2", etc.
    completed: number;
    averageScore?: number;
  }[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface ClassPerformanceAnalytics {
  class: {
    id: string;
    name: string;
    section: string;
  };
  overallProgress: {
    totalStudents: number;
    totalAssignments: number;
    completionRate: number; // percentage
    averageScore?: number;
  };
  assignmentCompletion: {
    assignmentId: string;
    title: string;
    type: string;
    completionRate: number; // percentage
    averageScore?: number;
  }[];
  studentPerformance: {
    studentId: string;
    name: string;
    completionRate: number; // percentage
    averageScore?: number;
  }[];
}
