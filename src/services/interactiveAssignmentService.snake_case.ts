// This is a modified version of the service that uses snake_case column names
// to match the database schema. Replace the formattedQuestion object in the original file
// with this version.

const formattedQuestion = {
  id: existingId,
  "assignmentId": numericId, // Use the numeric ID here
  question_type: questionType, // Use snake_case for database
  "order": order, // Ensure order is sequential
  question_text: question.questionText || '', // Use snake_case for database
  question_data: question.questionData || {} // Use snake_case for database
  // Omitting potentially missing fields to avoid schema cache issues
};
