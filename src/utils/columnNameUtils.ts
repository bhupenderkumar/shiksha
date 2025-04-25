/**
 * Utility functions to handle both camelCase and snake_case column names
 * in database responses for interactive questions.
 */

import { InteractiveQuestion } from '@/types/interactiveAssignment';

/**
 * Normalizes an InteractiveQuestion object by ensuring all properties
 * are available in camelCase format, even if they were originally in snake_case.
 * 
 * @param question The question object from the database that might have mixed case properties
 * @returns A normalized question object with all properties in camelCase
 */
export function normalizeInteractiveQuestion(question: any): InteractiveQuestion {
  if (!question) return null;

  // Create a new object with all the properties from the original
  const normalized: any = { ...question };

  // Map snake_case to camelCase if the camelCase version is missing
  if (normalized.question_type !== undefined && normalized.questionType === undefined) {
    normalized.questionType = normalized.question_type;
  }
  
  if (normalized.question_text !== undefined && normalized.questionText === undefined) {
    normalized.questionText = normalized.question_text;
  }
  
  if (normalized.question_data !== undefined && normalized.questionData === undefined) {
    normalized.questionData = normalized.question_data;
  }
  
  if (normalized.question_order !== undefined && normalized.questionOrder === undefined) {
    normalized.questionOrder = normalized.question_order;
  }
  
  if (normalized.audio_instructions !== undefined && normalized.audioInstructions === undefined) {
    normalized.audioInstructions = normalized.audio_instructions;
  }
  
  if (normalized.hint_text !== undefined && normalized.hintText === undefined) {
    normalized.hintText = normalized.hint_text;
  }
  
  if (normalized.hint_image_url !== undefined && normalized.hintImageUrl === undefined) {
    normalized.hintImageUrl = normalized.hint_image_url;
  }
  
  if (normalized.feedback_correct !== undefined && normalized.feedbackCorrect === undefined) {
    normalized.feedbackCorrect = normalized.feedback_correct;
  }
  
  if (normalized.feedback_incorrect !== undefined && normalized.feedbackIncorrect === undefined) {
    normalized.feedbackIncorrect = normalized.feedback_incorrect;
  }

  return normalized as InteractiveQuestion;
}

/**
 * Normalizes an array of InteractiveQuestion objects
 * 
 * @param questions Array of question objects from the database
 * @returns Array of normalized question objects
 */
export function normalizeInteractiveQuestions(questions: any[]): InteractiveQuestion[] {
  if (!questions || !Array.isArray(questions)) return [];
  return questions.map(normalizeInteractiveQuestion);
}
