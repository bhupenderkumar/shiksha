// This file contains the complete fix for the snake_case issue
// Copy and paste these sections into your interactiveAssignmentService.ts file

// 1. Update the formattedQuestion object (around line 657)
const formattedQuestion = {
  id: existingId,
  "assignmentId": numericId, // Use the numeric ID here
  question_type: questionType, // Use snake_case for database
  "order": order, // Ensure order is sequential
  question_text: question.questionText || '', // Use snake_case for database
  question_data: question.questionData || {} // Use snake_case for database
  // Omitting potentially missing fields to avoid schema cache issues
};

// 2. Update the minimalQuestion object (around line 721)
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
