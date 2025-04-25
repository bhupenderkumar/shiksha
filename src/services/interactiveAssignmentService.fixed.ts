// This is a fixed version of the service that uses snake_case column names
// Copy the relevant parts into your original file

import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { SCHEMA } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { progressTrackingService } from './progressTrackingService';
import type {
  InteractiveAssignment,
  InteractiveQuestion,
  InteractiveSubmission,
  InteractiveResponse,
  CreateInteractiveAssignmentData,
  UpdateInteractiveAssignmentData,
  CreateInteractiveSubmissionData,
  UpdateInteractiveSubmissionData,
  InteractiveAssignmentType,
  InteractiveAssignmentStatus,
  SubmissionStatus
} from '@/types/interactiveAssignment';

const INTERACTIVE_ASSIGNMENT_TABLE = 'InteractiveAssignment';
const INTERACTIVE_QUESTION_TABLE = 'InteractiveQuestion';
const INTERACTIVE_SUBMISSION_TABLE = 'InteractiveSubmission';
const INTERACTIVE_RESPONSE_TABLE = 'InteractiveResponse';
const FILE_TABLE = 'File';

// This is the part that needs to be updated in your original file
// Inside the updateQuestions method

// Create a properly formatted question object with snake_case column names
// to match the database schema
const formattedQuestion = {
  id: existingId,
  "assignmentId": numericId, // Use the numeric ID here
  question_type: questionType, // Use snake_case for database
  "order": order, // Ensure order is sequential
  question_text: question.questionText || '', // Use snake_case for database
  question_data: question.questionData || {} // Use snake_case for database
  // Omitting potentially missing fields to avoid schema cache issues
};

// And this is the part that needs to be updated for the minimal question object
// Inside the essentialQuestions.map callback

// Create a new object with only the fields we know exist
const minimalQuestion: Record<string, any> = {};

// Add each field individually to avoid any potential issues
minimalQuestion.id = question.id;
minimalQuestion.assignmentId = question.assignmentId;

// Ensure question_type is never null (critical for not-null constraint)
// Use snake_case for database columns
const questionTypeStr = String(question.questionType || '');
if (!questionTypeStr || questionTypeStr === 'null' || questionTypeStr === 'undefined') {
  minimalQuestion.question_type = 'MATCHING';
} else {
  minimalQuestion.question_type = question.questionType;
}

minimalQuestion.order = question.order;
minimalQuestion.question_text = question.questionText || '';

// Only add question_data if it's not empty
if (question.questionData && Object.keys(question.questionData).length > 0) {
  minimalQuestion.question_data = question.questionData;
}
