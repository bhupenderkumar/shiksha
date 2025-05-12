import React from 'react';
import { InteractiveQuestion, InteractiveResponse } from '@/types/interactiveAssignment';
import MatchingExercise from './matching-exercise';
import SimplifiedCompletionExercise from './simplified-completion-exercise';
import DrawingExercise from './drawing-exercise';
import MultipleChoiceExercise from './multiple-choice-exercise';
import OrderingExercise from './ordering-exercise';
import SortingExercise from './sorting-exercise';
import PuzzleExercise from './puzzle-exercise';
import IdentificationExercise from './identification-exercise';
import CountingExercise from './counting-exercise';
import TracingExercise from './tracing-exercise';
import TracingExerciseKonva from './tracing-exercise-konva';
import CountingExerciseKonva from './counting-exercise-konva';
import ColoringExerciseKonva from './coloring-exercise-konva';
import AudioReadingExercise from './audio-reading-exercise';
import { Card, CardContent } from '@/components/ui/card';
import { normalizeInteractiveQuestion } from '@/utils/columnNameUtils';
import QuestionDataDebugger from './QuestionDataDebugger';

interface ExerciseRendererProps {
  question: InteractiveQuestion;
  readOnly?: boolean;
  initialResponse?: InteractiveResponse;
  onSave?: (response: InteractiveResponse) => void;
  showAnswers?: boolean;
}

export function ExerciseRenderer({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: ExerciseRendererProps) {
  // Normalize the question to ensure all properties are available in camelCase
  const normalizedQuestion = normalizeInteractiveQuestion(question);

  const handleSave = (responseData: any) => {
    if (onSave) {
      onSave({
        id: '',
        submissionId: '',
        questionId: normalizedQuestion.id,
        responseData,
        isCorrect: undefined
      });
    }
  };

  const renderExercise = () => {
    switch (normalizedQuestion.questionType) {
      case 'MATCHING':
        return (
          <MatchingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
          />
        );

      case 'COMPLETION':
        return (
          <SimplifiedCompletionExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'DRAWING':
        return (
          <DrawingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
          />
        );

      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'ORDERING':
        return (
          <OrderingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'SORTING':
      case 'CATEGORIZATION':
        return (
          <SortingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'PUZZLE':
        return (
          <PuzzleExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'IDENTIFICATION':
        return (
          <IdentificationExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'COUNTING':
        return (
          <CountingExerciseKonva
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'TRACING':
      case 'LETTER_TRACING':
        return (
          <TracingExerciseKonva
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'COLORING':
        return (
          <ColoringExerciseKonva
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'AUDIO_READING':
        return (
          <AudioReadingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: question.questionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p>Unsupported question type: {normalizedQuestion.questionType}</p>

            {/* Use our QuestionDataDebugger component in non-production environments */}
            <QuestionDataDebugger
              question={question}
              showDebug={process.env.NODE_ENV !== 'production'}
            />
          </div>
        );
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {renderExercise()}

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

export default ExerciseRenderer;
