import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { CompletionQuestion, CompletionResponse } from '@/types/interactiveAssignment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { playSound } from '@/utils/soundUtils';

interface SimplifiedCompletionExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CompletionQuestion;
  };
  readOnly?: boolean;
  initialResponse?: CompletionResponse;
  onSave?: (response: CompletionResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedCompletionExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedCompletionExerciseProps) {
  const [answers, setAnswers] = useState<{ blankId: string; answer: string }[]>([]);
  const [textWithBlanks, setTextWithBlanks] = useState<React.ReactNode[]>([]);
  const [focusedBlankIndex, setFocusedBlankIndex] = useState<number | null>(null);

  // Initialize answers from initial response if available
  useEffect(() => {
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
  }, [initialResponse, question.questionData.blanks]);

  // Parse the text and create elements with input fields for blanks
  useEffect(() => {
    const { text, blanks } = question.questionData;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort blanks by position to ensure correct order
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, index) => {
      // Add text before the blank
      parts.push(<span key={`text-${index}`}>{text.substring(lastIndex, blank.position)}</span>);

      // Add the input field
      const answer = answers.find(a => a.blankId === blank.id)?.answer || '';
      const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
      const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();
      const isFocused = focusedBlankIndex === index;

      parts.push(
        <span key={`blank-${index}`} className="inline-block mx-1 align-middle">
          <div className={`
            relative inline-flex items-center
            ${isFocused ? 'z-10' : ''}
          `}>
            <Input
              type="text"
              value={answer}
              onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
              onFocus={() => setFocusedBlankIndex(index)}
              onBlur={() => setFocusedBlankIndex(null)}
              disabled={readOnly}
              placeholder="Type here"
              className={`
                min-w-[100px] w-auto inline-block px-3 py-1 text-center
                border-2 rounded-md transition-all duration-200
                ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                ${isIncorrect ? 'border-red-500 bg-red-50' : ''}
                ${!showAnswers && !readOnly ? 'border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20' : ''}
                ${isFocused ? 'shadow-md' : ''}
                ${readOnly ? 'bg-gray-100' : ''}
              `}
            />

            {showAnswers && (
              <span className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                {isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
              </span>
            )}
          </div>

          {showAnswers && isIncorrect && (
            <div className="text-xs text-red-500 mt-1 font-medium">
              Correct: {blank.answer}
            </div>
          )}
        </span>
      );

      lastIndex = blank.position;
    });

    // Add remaining text
    parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);

    setTextWithBlanks(parts);
  }, [question.questionData, answers, readOnly, showAnswers, focusedBlankIndex]);

  // Handle answer change
  const handleAnswerChange = (blankId: string, value: string) => {
    // Play a soft click sound when typing
    if (value.length === 1) {
      playSound('click', 0.2);
    }

    setAnswers(prev =>
      prev.map(answer =>
        answer.blankId === blankId ? { ...answer, answer: value } : answer
      )
    );
  };

  // Handle save
  const handleSave = () => {
    // Check if all blanks have been filled
    const emptyAnswers = answers.filter(answer => !answer.answer.trim());
    if (emptyAnswers.length > 0) {
      playSound('incorrect');
      toast.error('Please fill in all blanks before saving');
      return;
    }

    // Check if answers are correct
    const correctCount = answers.filter(answer => {
      const blank = question.questionData.blanks.find(b => b.id === answer.blankId);
      return blank && answer.answer.toLowerCase() === blank.answer.toLowerCase();
    }).length;

    // Play appropriate sound based on score
    if (correctCount === answers.length) {
      playSound('celebration');
    } else if (correctCount > answers.length / 2) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }

    if (onSave) {
      onSave({ answers });
      toast.success('Your answers have been saved!');
    }
  };

  // Handle reset
  const handleReset = () => {
    // Play click sound
    playSound('click');

    const resetAnswers = question.questionData.blanks.map(blank => ({
      blankId: blank.id,
      answer: ''
    }));
    setAnswers(resetAnswers);
    toast.success('All answers have been reset');
  };

  // Calculate score
  const calculateScore = () => {
    if (answers.length === 0) return 0;

    const correctCount = answers.filter(answer => {
      const blank = question.questionData.blanks.find(b => b.id === answer.blankId);
      return blank && answer.answer.toLowerCase() === blank.answer.toLowerCase();
    }).length;

    return Math.round((correctCount / answers.length) * 100);
  };

  // Get score message based on percentage
  const getScoreMessage = () => {
    const score = calculateScore();
    if (score >= 90) return "Excellent work!";
    if (score >= 70) return "Good job!";
    if (score >= 50) return "Nice effort!";
    return "Keep practicing!";
  };

  // Play celebration sound when showing answers with a good score
  useEffect(() => {
    if (showAnswers) {
      const score = calculateScore();
      if (score >= 70) {
        playSound('celebration');
      } else if (score > 0) {
        playSound('complete');
      }
    }
  }, [showAnswers]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white border rounded-lg shadow-sm p-6">
        {/* Header */}
        <h3 className="text-xl font-semibold mb-3">{question.questionText}</h3>

        {/* Instructions */}
        <div className="flex items-center mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
          <div className="mr-2 text-blue-500">
            <HelpCircle size={20} />
          </div>
          <p className="text-sm text-blue-700">
            Fill in each blank with the correct word to complete the text.
          </p>
        </div>

        {/* Score display when showing answers */}
        {showAnswers && (
          <div className="mb-6 p-4 rounded-md border text-center">
            <div className={`text-lg font-bold mb-1 ${calculateScore() >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
              Your score: {calculateScore()}%
            </div>
            <p className="text-sm text-gray-600">{getScoreMessage()}</p>
          </div>
        )}

        {/* Text with blanks */}
        <div className="p-5 bg-white border rounded-md mb-6 leading-relaxed text-lg">
          {textWithBlanks}
        </div>

        {/* Controls */}
        {!readOnly && (
          <div className="mt-6 flex justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    size="sm"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all your answers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={handleSave}
              size="lg"
              className="px-8"
            >
              Submit Answers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimplifiedCompletionExercise;
