import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface MultipleChoiceQuestion {
  choices?: Choice[];
  options?: Choice[];
  allowMultiple?: boolean;
}

interface MultipleChoiceResponse {
  selectedChoices: string[];
  isCorrect?: boolean;
}

interface SimplifiedMultipleChoiceExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MultipleChoiceQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MultipleChoiceResponse;
  onSave?: (response: MultipleChoiceResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedMultipleChoiceExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedMultipleChoiceExerciseProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  // Safely extract choices and allowMultiple from questionData
  // Handle both formats: choices array or options array
  const getChoicesAndAllowMultiple = () => {
    const data = question.questionData || {};

    // Log the data structure to help with debugging
    console.log('Multiple choice question data:', data);

    // If choices is available, use it
    if (Array.isArray(data.choices)) {
      return {
        choices: data.choices,
        allowMultiple: !!data.allowMultiple
      };
    }

    // If options is available, use it instead
    if (Array.isArray(data.options)) {
      return {
        choices: data.options,
        allowMultiple: !!data.allowMultiple
      };
    }

    // If neither is available, return empty arrays
    console.error('Multiple choice question has no choices or options:', data);
    return {
      choices: [],
      allowMultiple: false
    };
  };

  const { choices, allowMultiple } = getChoicesAndAllowMultiple();

  // Initialize selected choices from initial response
  useEffect(() => {
    if (initialResponse?.selectedChoices) {
      setSelectedChoices(initialResponse.selectedChoices);
    } else {
      setSelectedChoices([]);
    }
  }, [initialResponse]);

  // Handle choice selection
  const handleChoiceSelect = (choiceId: string) => {
    if (readOnly) return;

    let newSelectedChoices: string[];

    if (allowMultiple) {
      // Toggle selection for multiple choice
      if (selectedChoices.includes(choiceId)) {
        newSelectedChoices = selectedChoices.filter(id => id !== choiceId);
      } else {
        newSelectedChoices = [...selectedChoices, choiceId];
      }
    } else {
      // Single selection for single choice
      newSelectedChoices = [choiceId];
    }

    setSelectedChoices(newSelectedChoices);

    // Save the response
    if (onSave) {
      onSave({ selectedChoices: newSelectedChoices });
    }
  };

  // Check if the answer is correct
  const checkCorrectness = () => {
    if (!choices || choices.length === 0) return false;

    // For multiple choice, all correct options must be selected and no incorrect ones
    if (allowMultiple) {
      const correctChoiceIds = choices.filter((choice: Choice) => choice.isCorrect).map((choice: Choice) => choice.id);
      const incorrectSelections = selectedChoices.filter((id: string) => !correctChoiceIds.includes(id));
      const missingCorrectSelections = correctChoiceIds.filter((id: string) => !selectedChoices.includes(id));

      return incorrectSelections.length === 0 && missingCorrectSelections.length === 0;
    }
    // For single choice, the selected option must be correct
    else {
      if (selectedChoices.length !== 1) return false;
      const selectedChoice = choices.find((choice: Choice) => choice.id === selectedChoices[0]);
      return selectedChoice?.isCorrect === true;
    }
  };

  const isCorrect = showAnswers && checkCorrectness();

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        {allowMultiple
          ? 'Select all correct answers.'
          : 'Select the correct answer.'}
      </p>

      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium flex items-center">
            {isCorrect
              ? <><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Correct!</>
              : <><XCircle className="h-5 w-5 text-red-500 mr-2" /> Incorrect</>}
          </p>
        </div>
      )}

      {/* Choices */}
      <div className="space-y-2">
        {choices.map((choice: Choice) => {
          const isSelected = selectedChoices.includes(choice.id);
          const isChoiceCorrect = showAnswers && choice.isCorrect;
          const isChoiceIncorrect = showAnswers && isSelected && !choice.isCorrect;

          return (
            <div
              key={choice.id}
              onClick={() => handleChoiceSelect(choice.id)}
              className={`
                p-4 border rounded-md cursor-pointer transition-all
                ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'}
                ${isChoiceCorrect ? 'bg-green-50 border-green-300' : ''}
                ${isChoiceIncorrect ? 'bg-red-50 border-red-300' : ''}
                ${readOnly ? 'cursor-default' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 mr-3 flex-shrink-0 border rounded-${allowMultiple ? 'sm' : 'full'}
                  ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  ${isChoiceCorrect ? 'bg-green-500 border-green-500' : ''}
                  ${isChoiceIncorrect ? 'bg-red-500 border-red-500' : ''}
                `}>
                  {isSelected && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>{choice.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SimplifiedMultipleChoiceExercise;
