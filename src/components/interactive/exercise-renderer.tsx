import React from 'react';
import { InteractiveQuestion, InteractiveResponse } from '@/types/interactiveAssignment';
import MatchingExercise from './matching-exercise';
import CompletionExercise from './completion-exercise';
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
  const handleSave = (responseData: any) => {
    if (onSave) {
      onSave({
        id: '',
        submissionId: '',
        questionId: question.id,
        responseData,
        isCorrect: undefined
      });
    }
  };

  const renderExercise = () => {
    switch (question.questionType) {
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
          <CompletionExercise
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
            <p>Unsupported question type: {question.questionType}</p>
          </div>
        );
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {renderExercise()}
      </CardContent>
    </Card>
  );
}

export default ExerciseRenderer;
