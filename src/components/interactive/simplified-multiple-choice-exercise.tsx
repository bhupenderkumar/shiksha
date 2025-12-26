import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { playSound } from '@/utils/soundUtils';
import { ExerciseScoreCard } from '@/components/ui/exercise-scorecard';
import { AnswerFeedback } from '@/components/ui/answer-feedback';
import confetti from 'canvas-confetti';

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
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean | null, message: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

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

  // Calculate score as a percentage
  const calculateScore = () => {
    if (!choices || choices.length === 0) return 0;

    const correctChoices = choices.filter((choice: Choice) => choice.isCorrect);
    const totalCorrectChoices = correctChoices.length;

    if (totalCorrectChoices === 0) return 0;

    let score = 0;

    if (allowMultiple) {
      // For multiple choice, calculate partial credit
      const correctlySelected = selectedChoices.filter(id =>
        correctChoices.some(choice => choice.id === id)
      ).length;

      const incorrectlySelected = selectedChoices.filter(id =>
        !correctChoices.some(choice => choice.id === id)
      ).length;

      // Calculate score based on correct selections minus incorrect selections
      score = Math.max(0, (correctlySelected / totalCorrectChoices) * 100 - (incorrectlySelected * 20));
    } else {
      // For single choice, it's all or nothing
      score = checkCorrectness() ? 100 : 0;
    }

    return Math.round(score);
  };

  // Trigger confetti celebration
  const triggerCelebration = () => {
    // Play celebration sound
    playSound('celebration');

    // Launch confetti
    const end = Date.now() + 2000;
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#1E90FF'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Handle choice selection
  const handleChoiceSelect = (choiceId: string) => {
    if (readOnly) return;

    // Play click sound for better feedback
    playSound('click', 0.3);

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

    // Check if the choice is correct and provide feedback
    const selectedChoice = choices.find((choice: Choice) => choice.id === choiceId);
    const isChoiceCorrect = selectedChoice?.isCorrect === true;

    if (!allowMultiple) {
      // For single choice, provide immediate feedback
      if (isChoiceCorrect) {
        playSound('correct');
        setLastFeedback({
          isCorrect: true,
          message: 'Correct! Great job!'
        });

        // Show score card after a delay
        setTimeout(() => {
          triggerCelebration();
          setShowScoreCard(true);
        }, 1000);
      } else {
        playSound('incorrect');
        setLastFeedback({
          isCorrect: false,
          message: 'Not quite right. Try again!'
        });
      }

      setShowFeedback(true);

      // Hide feedback after a delay
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }

    // Save the response
    if (onSave) {
      onSave({ selectedChoices: newSelectedChoices });
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedChoices([]);
    setShowFeedback(false);
    setLastFeedback(null);
    playSound('click');
    toast.success('Choices reset. Try again!');
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

  // Play celebration and show score card when answers are shown and correct
  useEffect(() => {
    if (showAnswers && isCorrect && !showScoreCard) {
      triggerCelebration();

      // Show score card after a short delay
      setTimeout(() => {
        setShowScoreCard(true);
      }, 500);
    }
  }, [showAnswers, isCorrect, showScoreCard]);

  return (
    <div className="w-full">
      {/* Score card overlay */}
      {showScoreCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ExerciseScoreCard
            score={calculateScore()}
            totalQuestions={1}
            correctAnswers={isCorrect ? 1 : 0}
            incorrectAnswers={isCorrect ? 0 : 1}
            onContinue={() => setShowScoreCard(false)}
            onTryAgain={() => {
              setShowScoreCard(false);
              handleReset();
            }}
            showConfetti={true}
            childFriendly={true}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        {allowMultiple
          ? 'Select all correct answers.'
          : 'Select the correct answer.'}
      </p>

      {/* Feedback message */}
      {showFeedback && lastFeedback && (
        <div className="mb-4">
          <AnswerFeedback
            isCorrect={lastFeedback.isCorrect}
            message={lastFeedback.message}
            autoHide={true}
            hideDelay={2000}
            onHide={() => setShowFeedback(false)}
            playSound={false} // We're already playing sounds in the handler
          />
        </div>
      )}

      {/* Score display when showing answers */}
      {showAnswers && !showScoreCard && (
        <Alert variant={isCorrect ? "success" : "info"} className="mb-4">
          <p className="font-medium flex items-center">
            {isCorrect
              ? <><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Correct!</>
              : <><XCircle className="h-5 w-5 text-red-500 mr-2" /> Incorrect</>}
          </p>
          <p className="text-sm mt-1">Your score: {calculateScore()}%</p>
        </Alert>
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

      {/* Controls */}
      {!readOnly && allowMultiple && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={() => {
              // For multiple choice, check correctness and show feedback
              const isAllCorrect = checkCorrectness();

              if (isAllCorrect) {
                triggerCelebration();
                setShowScoreCard(true);
              } else {
                playSound('incorrect');
                setLastFeedback({
                  isCorrect: false,
                  message: 'Not quite right. Try again!'
                });
                setShowFeedback(true);

                // Hide feedback after a delay
                setTimeout(() => {
                  setShowFeedback(false);
                }, 2000);
              }

              // Save the response
              if (onSave) {
                onSave({ selectedChoices });
              }
            }}
          >
            Check Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedMultipleChoiceExercise;
