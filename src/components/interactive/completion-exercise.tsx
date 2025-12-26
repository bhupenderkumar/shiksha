import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CompletionQuestion, CompletionResponse } from '@/types/interactiveAssignment';
import { DraggableCompletionExercise } from './draggable-completion-exercise';

interface CompletionExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CompletionQuestion;
  };
  readOnly?: boolean;
  initialResponse?: CompletionResponse;
  onSave?: (response: CompletionResponse) => void;
  showAnswers?: boolean;
  useDragDrop?: boolean;
  enableSounds?: boolean;
  enableHints?: boolean;
  enableConfetti?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  hintText?: string;
}

export function CompletionExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false,
  useDragDrop = true,
  enableSounds = true,
  enableHints = true,
  enableConfetti = true,
  difficulty = 'medium',
  hintText
}: CompletionExerciseProps) {
  // If drag and drop mode is enabled, use the DraggableCompletionExercise component
  if (useDragDrop) {
    return (
      <DraggableCompletionExercise
        question={question}
        readOnly={readOnly}
        initialResponse={initialResponse}
        onSave={onSave}
        showAnswers={showAnswers}
        enableSounds={enableSounds}
        enableHints={enableHints}
        enableConfetti={enableConfetti}
        difficulty={difficulty}
        hintText={hintText}
      />
    );
  }

  // Otherwise, use the original implementation with text inputs
  const [answers, setAnswers] = useState<{ blankId: string; answer: string }[]>([]);
  const [textWithBlanks, setTextWithBlanks] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Initialize answers from initial response if available
    if (initialResponse?.answers) {
      setAnswers(initialResponse.answers);
    } else {
      // Initialize empty answers
      const initialAnswers = question.questionData.blanks.map(blank => ({
        blankId: blank.id,
        answer: ''
      }));
      setAnswers(initialAnswers);
    }
  }, [question, initialResponse]);

  useEffect(() => {
    // Parse the text and create elements with input fields for blanks
    const { text, blanks } = question.questionData;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Check if we're dealing with placeholder-style blanks or position-style blanks
    const hasPlaceholders = blanks.some(blank => {
      const placeholder = `[blank${blank.position}]`;
      return text.includes(placeholder);
    });

    if (hasPlaceholders) {
      // Handle placeholder-style blanks (e.g., [blank1], [blank2])
      let workingText = text;
      const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

      sortedBlanks.forEach((blank, index) => {
        const placeholder = `[blank${blank.position}]`;
        const parts = workingText.split(placeholder);

        if (parts.length > 1) {
          // Add text before the blank
          parts.push(parts[0]);

          // Add the input field
          const answer = answers.find(a => a.blankId === blank.id)?.answer || '';
          const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
          const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();

          parts.push(
            <span key={blank.id} className="inline-block mx-1">
              {readOnly || showAnswers ? (
                <span
                  className={`px-2 py-1 border rounded ${
                    isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' :
                    isIncorrect ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700' :
                    'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  {answer || '______'}
                  {showAnswers && isIncorrect && (
                    <span className="ml-2 text-xs text-green-600">({blank.answer})</span>
                  )}
                </span>
              ) : (
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                  className="w-32 inline-block px-2 py-1 h-8"
                  placeholder="______"
                />
              )}
            </span>
          );

          // Update working text to be the remainder
          workingText = parts.slice(1).join(placeholder);
        }
      });

      // Add any remaining text
      if (workingText) {
        parts.push(workingText);
      }
    } else {
      // Handle position-style blanks (using numeric indices)
      // Sort blanks by position to ensure correct order
      const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

      sortedBlanks.forEach((blank, index) => {
        // Skip blanks with invalid positions
        if (blank.position < 0 || blank.position >= text.length) {
          console.warn(`Blank at position ${blank.position} is outside the text range`);
          return;
        }

        // Add text before the blank
        if (blank.position > lastIndex) {
          parts.push(text.substring(lastIndex, blank.position));
        }

        // Add the input field
        const answer = answers.find(a => a.blankId === blank.id)?.answer || '';
        const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
        const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();

        parts.push(
          <span key={blank.id} className="inline-block mx-1">
            {readOnly || showAnswers ? (
              <span
                className={`px-2 py-1 border rounded ${
                  isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' :
                  isIncorrect ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700' :
                  'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                {answer || '______'}
                {showAnswers && isIncorrect && (
                  <span className="ml-2 text-xs text-green-600">({blank.answer})</span>
                )}
              </span>
            ) : (
              <Input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                className="w-32 inline-block px-2 py-1 h-8"
                placeholder="______"
              />
            )}
          </span>
        );

        // Update last index
        lastIndex = blank.position;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
    }

    setTextWithBlanks(parts);
  }, [question, answers, readOnly, showAnswers]);

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers(prev =>
      prev.map(answer =>
        answer.blankId === blankId ? { ...answer, answer: value } : answer
      )
    );
  };

  const handleSave = () => {
    // Check if all blanks have been filled
    const emptyAnswers = answers.filter(answer => !answer.answer.trim());
    if (emptyAnswers.length > 0) {
      toast.error('Please fill in all blanks before saving');
      return;
    }

    if (onSave) {
      onSave({ answers });
    }
  };

  const handleReset = () => {
    const resetAnswers = question.questionData.blanks.map(blank => ({
      blankId: blank.id,
      answer: ''
    }));
    setAnswers(resetAnswers);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      <div className="p-4 bg-white border rounded-md">
        <p className="text-lg leading-relaxed">{textWithBlanks}</p>
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompletionExercise;
