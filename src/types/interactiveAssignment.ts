import type { Database } from '@/types/supabase';

export type InteractiveAssignmentType =
  | 'MATCHING'
  | 'COMPLETION'
  | 'DRAWING'
  | 'COLORING'
  | 'MULTIPLE_CHOICE'
  | 'ORDERING'
  | 'TRACING'
  | 'AUDIO_READING'
  | 'COUNTING'
  | 'IDENTIFICATION'
  | 'PUZZLE'
  | 'SORTING'
  | 'HANDWRITING'
  | 'LETTER_TRACING'
  | 'NUMBER_RECOGNITION'
  | 'PICTURE_WORD_MATCHING'
  | 'PATTERN_COMPLETION'
  | 'CATEGORIZATION';

export type InteractiveAssignmentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type SubmissionStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'GRADED';

export interface InteractiveAssignment {
  id: string;
  title: string;
  description: string;
  type: InteractiveAssignmentType;
  status: InteractiveAssignmentStatus;
  dueDate: Date;
  classId: string;
  subjectId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  audioInstructions?: string; // URL to audio file with instructions
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeMinutes?: number;
  hasAudioFeedback?: boolean;
  hasCelebration?: boolean;
  ageGroup?: 'nursery' | 'lkg' | 'ukg' | 'elementary';
  requiresParentHelp?: boolean;
  shareableLink?: string;
  shareableLinkExpiresAt?: Date;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  questions?: InteractiveQuestion[];
  attachments?: FileAttachment[];
}

export interface InteractiveQuestion {
  id: string;
  assignmentId: string;
  questionType: InteractiveAssignmentType;
  questionText: string;
  questionData: any; // JSON data specific to question type
  order: number;
  audioInstructions?: string; // URL to audio file with question-specific instructions
  hintText?: string; // Optional hint for the student
  hintImageUrl?: string; // Optional hint image
  feedbackCorrect?: string; // Feedback text for correct answers
  feedbackIncorrect?: string; // Feedback text for incorrect answers
}

export interface InteractiveSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  feedback?: string;
  responses?: InteractiveResponse[];
  attachments?: FileAttachment[];
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
  assignment?: InteractiveAssignment;
}

export interface InteractiveResponse {
  id: string;
  submissionId: string;
  questionId: string;
  responseData: any; // JSON data specific to response
  isCorrect?: boolean;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
  url?: string; // For client-side use
}

// Progress tracking interfaces

export interface StudentProgress {
  id: string;
  studentId: string;
  assignmentId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  timeSpent?: number; // in seconds
  attempts: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  feedback?: string;
}

export interface StudentProgressAnalytics {
  id: string;
  studentId: string;
  assignmentType: InteractiveAssignmentType;
  assignmentsCompleted: number;
  averageScore: number;
  averageTimeSpent: number; // in seconds
  strengths: string[];
  areasForImprovement: string[];
  lastUpdated: Date;
}

export interface CompletionMilestone {
  id: string;
  studentId: string;
  milestoneType: string; // e.g., 'first_matching', 'ten_assignments', etc.
  achievedAt: Date;
  assignmentId?: string;
  badgeAwarded?: string;
}

export interface FeedbackTemplate {
  id: string;
  teacherId: string;
  templateName: string;
  templateText: string;
  assignmentType?: InteractiveAssignmentType;
  performanceLevel?: 'excellent' | 'good' | 'average' | 'needs_improvement';
  createdAt: Date;
}

// Question type specific interfaces

export interface MatchingQuestion {
  pairs: {
    id: string;
    left: string;
    right: string;
    leftType?: 'text' | 'image';
    rightType?: 'text' | 'image';
  }[];
}

export interface CompletionQuestion {
  text: string;
  blanks: {
    id: string;
    answer: string;
    position: number;
  }[];
}

export interface MultipleChoiceQuestion {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    imageUrl?: string;
  }[];
  allowMultiple: boolean;
}

export interface OrderingQuestion {
  items: {
    id: string;
    text: string;
    correctPosition: number;
    imageUrl?: string;
  }[];
}

export interface DrawingQuestion {
  instructions: string;
  backgroundImageUrl?: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ColoringQuestion {
  imageUrl: string;
  regions?: {
    id: string;
    name: string;
    expectedColor?: string;
  }[];
}

export interface TracingQuestion {
  letterOrShape: string;
  backgroundImageUrl?: string;
  guidePoints?: { x: number; y: number }[];
  canvasWidth: number;
  canvasHeight: number;
  strokeWidth: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AudioReadingQuestion {
  text: string;
  audioUrl: string;
  highlightWords: boolean;
  comprehensionQuestions?: {
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string;
  }[];
}

export interface CountingQuestion {
  imageUrl: string;
  itemsToCount: string;
  correctCount: number;
  minCount: number;
  maxCount: number;
  showNumbers: boolean;
}

export interface IdentificationQuestion {
  imageUrl: string;
  itemsToIdentify: {
    id: string;
    name: string;
    coordinates: { x: number; y: number };
    radius: number;
  }[];
}

export interface PuzzleQuestion {
  imageUrl: string;
  pieces: number;
  difficulty: 'easy' | 'medium' | 'hard';
  previewEnabled: boolean;
}

export interface SortingQuestion {
  categories: {
    id: string;
    name: string;
    imageUrl?: string;
  }[];
  items: {
    id: string;
    name: string;
    imageUrl?: string;
    correctCategoryId: string;
  }[];
  sortingCriteria: string; // e.g., "Sort by color", "Sort by size", etc.
}

export interface HandwritingQuestion {
  letter: string;
  word?: string;
  sentence?: string;
  guidelineType: 'dotted' | 'solid' | 'none';
  canvasWidth: number;
  canvasHeight: number;
  strokeWidth: number;
  showExample: boolean;
  exampleImageUrl?: string;
}

export interface LetterTracingQuestion {
  letter: string;
  uppercase: boolean;
  guidePoints: { x: number; y: number }[];
  canvasWidth: number;
  canvasHeight: number;
  strokeWidth: number;
  backgroundColor?: string;
  strokeColor?: string;
}

export interface NumberRecognitionQuestion {
  numbers: {
    id: string;
    value: number;
    imageUrl?: string;
    audioPrompt?: string;
  }[];
  questionType: 'identify' | 'match' | 'count';
  shuffleOptions: boolean;
}

export interface PictureWordMatchingQuestion {
  pairs: {
    id: string;
    word: string;
    pictureUrl: string;
    audioPrompt?: string;
  }[];
  showWordAudio: boolean;
}

export interface PatternCompletionQuestion {
  pattern: {
    items: {
      id: string;
      value: string;
      imageUrl?: string;
    }[];
    missingPositions: number[];
  };
  options: {
    id: string;
    value: string;
    imageUrl?: string;
    isCorrect: boolean;
  }[];
}

export interface CategorizationQuestion {
  categories: {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
  }[];
  items: {
    id: string;
    name: string;
    imageUrl?: string;
    correctCategoryId: string;
  }[];
  categorizationCriteria: string; // e.g., "Group by animal type", "Group by color", etc.
}

// Response type specific interfaces

export interface MatchingResponse {
  pairs: {
    leftId: string;
    rightId: string;
  }[];
}

export interface CompletionResponse {
  answers: {
    blankId: string;
    answer: string;
  }[];
}

export interface MultipleChoiceResponse {
  selectedOptions: string[]; // Array of option IDs
}

export interface OrderingResponse {
  orderedItems: {
    id: string;
    position: number;
  }[];
}

export interface DrawingResponse {
  drawingData: string; // Base64 encoded image data
  completionPercentage?: number; // Percentage of completion (0-100)
}

export interface ColoringResponse {
  regions: {
    id: string;
    color: string;
  }[];
}

export interface TracingResponse {
  tracingData: string; // Base64 encoded image data
  completionPercentage: number;
}

export interface AudioReadingResponse {
  listenedComplete: boolean;
  comprehensionAnswers?: {
    questionId: string;
    answer: string;
  }[];
}

export interface CountingResponse {
  count: number;
}

export interface IdentificationResponse {
  identifiedItems: {
    id: string;
    identified: boolean;
  }[];
}

export interface PuzzleResponse {
  completed: boolean;
  piecesPlaced: number;
  timeSpent: number; // in seconds
}

export interface SortingResponse {
  sortedItems: {
    itemId: string;
    categoryId: string;
  }[];
}

export interface HandwritingResponse {
  handwritingData: string; // Base64 encoded image data
  completionPercentage: number;
}

export interface LetterTracingResponse {
  tracingData: string; // Base64 encoded image data
  completionPercentage: number;
  accuracy: number; // 0-100 percentage of how well the tracing follows the guide
}

export interface NumberRecognitionResponse {
  selectedNumbers: {
    id: string;
    value: number;
  }[];
}

export interface PictureWordMatchingResponse {
  matches: {
    wordId: string;
    pictureId: string;
  }[];
}

export interface PatternCompletionResponse {
  filledPositions: {
    position: number;
    optionId: string;
  }[];
}

export interface CategorizationResponse {
  categorizedItems: {
    itemId: string;
    categoryId: string;
  }[];
}

// Create/Update data interfaces

export interface CreateInteractiveAssignmentData {
  title: string;
  description: string;
  type: InteractiveAssignmentType;
  dueDate: Date;
  classId: string;
  subjectId: string;
  status?: InteractiveAssignmentStatus;
  audioInstructions?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeMinutes?: number;
  hasAudioFeedback?: boolean;
  hasCelebration?: boolean;
  ageGroup?: 'nursery' | 'lkg' | 'ukg' | 'elementary';
  requiresParentHelp?: boolean;
  questions?: Omit<InteractiveQuestion, 'id' | 'assignmentId'>[];
  files?: File[];
}

export interface UpdateInteractiveAssignmentData {
  title?: string;
  description?: string;
  type?: InteractiveAssignmentType;
  dueDate?: Date;
  classId?: string;
  subjectId?: string;
  status?: InteractiveAssignmentStatus;
  audioInstructions?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeMinutes?: number;
  hasAudioFeedback?: boolean;
  hasCelebration?: boolean;
  ageGroup?: 'nursery' | 'lkg' | 'ukg' | 'elementary';
  requiresParentHelp?: boolean;
  shareableLink?: string;
  shareableLinkExpiresAt?: Date;
}

export interface CreateInteractiveSubmissionData {
  assignmentId: string;
  studentId: string;
  responses?: Omit<InteractiveResponse, 'id' | 'submissionId'>[];
  files?: File[];
}

export interface UpdateInteractiveSubmissionData {
  status?: SubmissionStatus;
  score?: number;
  feedback?: string;
  responses?: Omit<InteractiveResponse, 'id' | 'submissionId'>[];
}
