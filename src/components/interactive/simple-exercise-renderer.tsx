import React from 'react';
import { InteractiveQuestion, InteractiveResponse } from '@/types/interactiveAssignment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { normalizeInteractiveQuestion } from '@/utils/columnNameUtils';
import QuestionDataDebugger from './QuestionDataDebugger';

interface SimpleExerciseRendererProps {
  question: InteractiveQuestion;
  readOnly?: boolean;
  initialResponse?: InteractiveResponse;
  onSave?: (response: InteractiveResponse) => void;
  showAnswers?: boolean;
}

export function SimpleExerciseRenderer({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimpleExerciseRendererProps) {
  // Normalize the question to ensure all properties are available in camelCase
  const normalizedQuestion = normalizeInteractiveQuestion(question);

  const handleSave = () => {
    if (onSave) {
      onSave({
        id: '',
        submissionId: '',
        questionId: normalizedQuestion.id,
        responseData: { completed: true },
        isCorrect: true
      });
    }
  };

  // Format the question type for display
  const formatQuestionType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Get an emoji for the question type
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'MATCHING':
        return '🔄';
      case 'COMPLETION':
        return '✏️';
      case 'DRAWING':
        return '🎨';
      case 'COLORING':
        return '🖌️';
      case 'MULTIPLE_CHOICE':
        return '☑️';
      case 'ORDERING':
        return '🔢';
      case 'TRACING':
        return '✍️';
      case 'AUDIO_READING':
        return '🔊';
      case 'COUNTING':
        return '🔢';
      case 'IDENTIFICATION':
        return '🔍';
      case 'PUZZLE':
        return '🧩';
      case 'SORTING':
        return '📊';
      case 'HANDWRITING':
        return '✍️';
      case 'LETTER_TRACING':
        return '🔤';
      case 'NUMBER_RECOGNITION':
        return '🔢';
      case 'PICTURE_WORD_MATCHING':
        return '🖼️';
      case 'PATTERN_COMPLETION':
        return '🔄';
      case 'CATEGORIZATION':
        return '📋';
      default:
        return '📝';
    }
  };

  return (
    <Card className="p-6 border-2 border-blue-100">
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTypeEmoji(normalizedQuestion.questionType)}</span>
            <h3 className="text-lg font-medium">{formatQuestionType(normalizedQuestion.questionType)} Exercise</h3>
          </div>
          <p className="text-gray-700">{normalizedQuestion.questionText}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-blue-700">
            This is a simplified version of the {formatQuestionType(normalizedQuestion.questionType)} exercise.
            In the full version, you would be able to interact with the exercise.
          </p>

          {showAnswers && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-700 font-medium">
                ✓ Correct! You've completed this exercise.
              </p>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave}>
              Complete Exercise
            </Button>
          </div>
        )}

        {/* Add a debug button that shows the QuestionDataDebugger when clicked */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-4 text-right">
            <details className="inline-block text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-blue-500">Debug Question Data</summary>
              <QuestionDataDebugger question={question} showDebug={true} />
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SimpleExerciseRenderer;
