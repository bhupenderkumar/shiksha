export type ClassLevel = 'pre-nursery' | 'nursery' | 'kg' | 'class-1';

export interface TestQuestion {
  id: number;
  type: string;
}

export interface TestResult {
  classLevel: ClassLevel;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // seconds
  answers: { questionId: number; correct: boolean }[];
}

export interface TestComponentProps {
  onComplete: (result: TestResult) => void;
  studentName: string;
}

export const CLASS_LEVEL_LABELS: Record<ClassLevel, string> = {
  'pre-nursery': 'Pre Nursery',
  'nursery': 'Nursery',
  'kg': 'KG',
  'class-1': 'Class 1',
};

export const CLASS_LEVEL_DESCRIPTIONS: Record<ClassLevel, string> = {
  'pre-nursery': 'Color Identification',
  'nursery': 'Matching Objects',
  'kg': 'Advanced Matching',
  'class-1': 'Basic Mathematics',
};
