import React from 'react';
import { normalizeInteractiveQuestion } from '@/utils/columnNameUtils';
import { Alert } from '@/components/ui/alert';

interface QuestionDataDebuggerProps {
  question: any;
  showDebug?: boolean;
}

/**
 * A component that displays debug information about a question's data structure
 * Helps identify issues with camelCase vs snake_case properties
 */
export function QuestionDataDebugger({ question, showDebug = false }: QuestionDataDebuggerProps) {
  if (!showDebug) return null;
  
  // Normalize the question to ensure all properties are available in camelCase
  const normalizedQuestion = normalizeInteractiveQuestion(question);
  
  return (
    <Alert variant="warning" className="mt-2 text-xs">
      <h4 className="font-semibold mb-1">Question Data Structure:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>ID: {question.id}</li>
        <li>
          Question Type: 
          <span className="ml-1 font-mono">
            {normalizedQuestion.questionType || 'null'} 
            {question.question_type && question.question_type !== normalizedQuestion.questionType && 
              <span className="text-red-500 ml-1">(snake_case: {question.question_type})</span>
            }
          </span>
        </li>
        <li>
          Question Text: 
          <span className="ml-1 font-mono">
            {normalizedQuestion.questionText ? `"${normalizedQuestion.questionText.substring(0, 20)}${normalizedQuestion.questionText.length > 20 ? '...' : ''}"` : 'null'}
            {question.question_text && question.question_text !== normalizedQuestion.questionText && 
              <span className="text-red-500 ml-1">(snake_case differs)</span>
            }
          </span>
        </li>
        <li>
          Has Question Data: 
          <span className="ml-1 font-mono">
            {normalizedQuestion.questionData ? 'Yes' : 'No'}
            {question.question_data && JSON.stringify(question.question_data) !== JSON.stringify(normalizedQuestion.questionData) && 
              <span className="text-red-500 ml-1">(snake_case differs)</span>
            }
          </span>
        </li>
      </ul>
      
      {/* Show raw data in collapsed details section */}
      <details className="mt-2">
        <summary className="cursor-pointer text-blue-600">Show Raw Data</summary>
        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-xs">
          {JSON.stringify(question, null, 2)}
        </pre>
      </details>
    </Alert>
  );
}

export default QuestionDataDebugger;
