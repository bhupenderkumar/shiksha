import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { CompletionQuestion, CompletionResponse } from '@/types/interactiveAssignment';

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

      parts.push(
        <span key={`blank-${index}`} className="inline-block mx-1">
          <Input
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
            disabled={readOnly}
            className={`
              w-24 inline-block px-2 py-1 text-center
              ${isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${isIncorrect ? 'border-red-500 bg-red-50' : ''}
            `}
          />
          {showAnswers && (
            <span className="ml-1">
              {isCorrect && <CheckCircle className="inline h-4 w-4 text-green-500" />}
              {isIncorrect && (
                <span className="inline-flex items-center">
                  <XCircle className="inline h-4 w-4 text-red-500 mr-1" />
                  <small className="text-xs text-red-500">({blank.answer})</small>
                </span>
              )}
            </span>
          )}
        </span>
      );

      lastIndex = blank.position;
    });

    // Add remaining text
    parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);

    setTextWithBlanks(parts);
  }, [question.questionData, answers, readOnly, showAnswers]);

  // Handle answer change
  const handleAnswerChange = (blankId: string, value: string) => {
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
      toast.error('Please fill in all blanks before saving');
      return;
    }
    
    if (onSave) {
      onSave({ answers });
    }
  };

  // Handle reset
  const handleReset = () => {
    const resetAnswers = question.questionData.blanks.map(blank => ({
      blankId: blank.id,
      answer: ''
    }));
    setAnswers(resetAnswers);
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

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Fill in the blanks to complete the text.
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}
      
      {/* Text with blanks */}
      <div className="p-4 bg-white border rounded-md mb-4 leading-relaxed">
        {textWithBlanks}
      </div>
      
      {/* Controls */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedCompletionExercise;
