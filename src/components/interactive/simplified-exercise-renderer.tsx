import React from 'react';
import {
  InteractiveQuestion,
  InteractiveResponse,
  MatchingQuestion as ApiMatchingQuestion,
  CompletionQuestion as ApiCompletionQuestion,
  OrderingQuestion as ApiOrderingQuestion,
  SortingQuestion as ApiSortingQuestion,
  DrawingQuestion as ApiDrawingQuestion,
  PuzzleQuestion as ApiPuzzleQuestion,
  IdentificationQuestion as ApiIdentificationQuestion,
  CountingQuestion as ApiCountingQuestion,
  TracingQuestion as ApiTracingQuestion,
  AudioReadingQuestion as ApiAudioReadingQuestion
} from '@/types/interactiveAssignment';
import { Card, CardContent } from '@/components/ui/card';
import { normalizeInteractiveQuestion } from '@/utils/columnNameUtils';
import QuestionDataDebugger from './QuestionDataDebugger';
import SimplifiedMatchingExercise from './simplified-matching-exercise';
import SimplifiedColoringExercise from './simplified-coloring-exercise';
import SimplifiedMultipleChoiceExercise from './simplified-multiple-choice-exercise';
import SimplifiedCompletionExercise from './simplified-completion-exercise';
import SimplifiedOrderingExercise from './simplified-ordering-exercise';
import SimplifiedDrawingExercise from './simplified-drawing-exercise';
import SimplifiedSortingExercise from './simplified-sorting-exercise';
import SimplifiedPuzzleExercise from './simplified-puzzle-exercise';
import SimplifiedIdentificationExercise from './simplified-identification-exercise';
import SimplifiedCountingExercise from './simplified-counting-exercise';
import SimplifiedTracingExercise from './simplified-tracing-exercise';
import SimplifiedAudioReadingExercise from './simplified-audio-reading-exercise';

interface SimplifiedExerciseRendererProps {
  question: InteractiveQuestion;
  readOnly?: boolean;
  initialResponse?: InteractiveResponse;
  onSave?: (response: InteractiveResponse) => void;
  showAnswers?: boolean;
}

// Adapter function to convert API matching question format to our component's format
const adaptMatchingQuestion = (apiQuestion: ApiMatchingQuestion) => {
  console.log('adaptMatchingQuestion called with:', apiQuestion);

  // Handle null or undefined input
  if (!apiQuestion) {
    console.error('apiQuestion is null or undefined');
    return {
      leftItems: [],
      rightItems: [],
      correctPairs: []
    };
  }

  // Extract pairs from the API question data
  const pairs = apiQuestion.pairs || [];
  console.log('Extracted pairs:', pairs);

  // If pairs is empty, create some sample data for testing
  if (pairs.length === 0) {
    console.log('No pairs found, creating sample data');

    // Sample data for animal sounds matching
    const samplePairs = [
      { id: '1', left: 'Dog', right: 'Woof', leftType: 'text', rightType: 'text' },
      { id: '2', left: 'Cat', right: 'Meow', leftType: 'text', rightType: 'text' },
      { id: '3', left: 'Cow', right: 'Moo', leftType: 'text', rightType: 'text' },
      { id: '4', left: 'Duck', right: 'Quack', leftType: 'text', rightType: 'text' }
    ];

    // Create left and right items arrays
    const leftItems = samplePairs.map(pair => ({
      id: pair.id,
      content: pair.left,
      type: pair.leftType || 'text'
    }));

    const rightItems = samplePairs.map(pair => ({
      id: pair.id,
      content: pair.right,
      type: pair.rightType || 'text'
    }));

    // Create correct pairs array
    const correctPairs = samplePairs.map(pair => ({
      leftId: pair.id,
      rightId: pair.id
    }));

    return {
      leftItems,
      rightItems,
      correctPairs
    };
  }

  // Create left and right items arrays
  const leftItems = pairs.map(pair => ({
    id: pair.id,
    content: pair.left,
    type: pair.leftType || 'text'
  }));

  const rightItems = pairs.map(pair => ({
    id: pair.id,
    content: pair.right,
    type: pair.rightType || 'text'
  }));

  // Create correct pairs array
  const correctPairs = pairs.map(pair => ({
    leftId: pair.id,
    rightId: pair.id
  }));

  console.log('Returning adapted data:', { leftItems, rightItems, correctPairs });

  return {
    leftItems,
    rightItems,
    correctPairs
  };
};

// Adapter function for completion questions
const adaptCompletionQuestion = (apiQuestion: ApiCompletionQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for ordering questions
const adaptOrderingQuestion = (apiQuestion: ApiOrderingQuestion) => {
  console.log('adaptOrderingQuestion called with:', apiQuestion);

  // Handle null or undefined input
  if (!apiQuestion) {
    console.error('apiQuestion is null or undefined');
    return {
      items: []
    };
  }

  // Ensure items is an array
  if (!apiQuestion.items || !Array.isArray(apiQuestion.items)) {
    console.error('apiQuestion.items is not an array:', apiQuestion.items);
    return {
      items: []
    };
  }

  // Ensure each item has the required properties
  const validItems = apiQuestion.items.map(item => ({
    id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
    text: item.text || '',
    correctPosition: typeof item.correctPosition === 'number' ? item.correctPosition : 0,
    imageUrl: item.imageUrl
  }));

  return {
    items: validItems
  };
};

// Adapter function for drawing questions
const adaptDrawingQuestion = (apiQuestion: ApiDrawingQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for sorting questions
const adaptSortingQuestion = (apiQuestion: ApiSortingQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for puzzle questions
const adaptPuzzleQuestion = (apiQuestion: ApiPuzzleQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for identification questions
const adaptIdentificationQuestion = (apiQuestion: ApiIdentificationQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for counting questions
const adaptCountingQuestion = (apiQuestion: ApiCountingQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for tracing questions
const adaptTracingQuestion = (apiQuestion: ApiTracingQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for audio reading questions
const adaptAudioReadingQuestion = (apiQuestion: ApiAudioReadingQuestion) => {
  return apiQuestion; // No adaptation needed
};

// Adapter function for multiple choice questions
const adaptMultipleChoiceQuestion = (apiQuestion: any) => {
  console.log('adaptMultipleChoiceQuestion called with:', apiQuestion);

  // Handle null or undefined input
  if (!apiQuestion) {
    console.error('apiQuestion is null or undefined');
    return {
      choices: [],
      allowMultiple: false
    };
  }

  // If the data already has choices, return it as is
  if (apiQuestion.choices) {
    return apiQuestion;
  }

  // If the data has options instead of choices, convert it
  if (apiQuestion.options) {
    return {
      choices: apiQuestion.options,
      allowMultiple: apiQuestion.allowMultiple || false
    };
  }

  // If we can't find either choices or options, return empty data
  console.error('Multiple choice question data has neither choices nor options:', apiQuestion);
  return {
    choices: [],
    allowMultiple: false
  };
};

export function SimplifiedExerciseRenderer({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedExerciseRendererProps) {

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

  // Normalize the question to ensure all properties are available in camelCase
  const normalizedQuestion = normalizeInteractiveQuestion(question);

  // Log the question data to help with debugging
  console.log('Original question data:', question);
  console.log('Normalized question data:', normalizedQuestion);

  // Use the normalized question type
  const questionType = normalizedQuestion.questionType;
  console.log('Question type:', questionType);
  console.log('Question data type:', typeof normalizedQuestion.questionData);

  const renderExercise = () => {
    switch (questionType) {
      case 'MATCHING':
        console.log('Rendering MATCHING exercise');
        console.log('Original question data:', question.questionData);

        // Adapt the API question data to our component's expected format
        const adaptedMatchingData = adaptMatchingQuestion(question.questionData as ApiMatchingQuestion);
        console.log('Adapted matching data:', adaptedMatchingData);

        // Check if the adapted data has the required properties
        console.log('Has leftItems:', Array.isArray(adaptedMatchingData.leftItems));
        console.log('Has rightItems:', Array.isArray(adaptedMatchingData.rightItems));
        console.log('Has correctPairs:', Array.isArray(adaptedMatchingData.correctPairs));

        return (
          <SimplifiedMatchingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedMatchingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'COLORING':
        return (
          <SimplifiedColoringExercise
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

      case 'MULTIPLE_CHOICE':
        console.log('Rendering MULTIPLE_CHOICE exercise');
        console.log('Original question data:', normalizedQuestion.questionData);

        // Adapt the API question data to our component's expected format
        const adaptedMultipleChoiceData = adaptMultipleChoiceQuestion(normalizedQuestion.questionData);
        console.log('Adapted multiple choice data:', adaptedMultipleChoiceData);

        return (
          <SimplifiedMultipleChoiceExercise
            question={{
              id: normalizedQuestion.id,
              questionText: normalizedQuestion.questionText,
              questionData: adaptedMultipleChoiceData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'COMPLETION':
        const adaptedCompletionData = adaptCompletionQuestion(question.questionData as ApiCompletionQuestion);
        return (
          <SimplifiedCompletionExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedCompletionData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'ORDERING':
        const adaptedOrderingData = adaptOrderingQuestion(question.questionData as ApiOrderingQuestion);
        return (
          <SimplifiedOrderingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedOrderingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'DRAWING':
        const adaptedDrawingData = adaptDrawingQuestion(question.questionData as ApiDrawingQuestion);
        return (
          <SimplifiedDrawingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedDrawingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'SORTING':
        const adaptedSortingData = adaptSortingQuestion(question.questionData as ApiSortingQuestion);
        return (
          <SimplifiedSortingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedSortingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'PUZZLE':
        const adaptedPuzzleData = adaptPuzzleQuestion(question.questionData as ApiPuzzleQuestion);
        return (
          <SimplifiedPuzzleExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedPuzzleData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'IDENTIFICATION':
        const adaptedIdentificationData = adaptIdentificationQuestion(question.questionData as ApiIdentificationQuestion);
        return (
          <SimplifiedIdentificationExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedIdentificationData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'COUNTING':
        const adaptedCountingData = adaptCountingQuestion(question.questionData as ApiCountingQuestion);
        return (
          <SimplifiedCountingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedCountingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'TRACING':
        const adaptedTracingData = adaptTracingQuestion(question.questionData as ApiTracingQuestion);
        return (
          <SimplifiedTracingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedTracingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      case 'AUDIO_READING':
        const adaptedAudioReadingData = adaptAudioReadingQuestion(question.questionData as ApiAudioReadingQuestion);
        return (
          <SimplifiedAudioReadingExercise
            question={{
              id: question.id,
              questionText: question.questionText,
              questionData: adaptedAudioReadingData
            }}
            readOnly={readOnly}
            initialResponse={initialResponse?.responseData}
            onSave={handleSave}
            showAnswers={showAnswers}
          />
        );

      default:
        console.log('Falling back to default case. Question type not recognized:', questionType);
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2">{normalizedQuestion.questionText}</h3>
            <p className="text-gray-500">
              This exercise type ({questionType || 'unknown'}) is coming soon!
            </p>
            <div className="mt-4 bg-blue-50 p-3 rounded-md">
              <p className="text-blue-700">
                In the full implementation, you would be able to interact with this exercise.
              </p>
            </div>

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
    <Card className="w-full">
      <CardContent className="p-6">
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

export default SimplifiedExerciseRenderer;
