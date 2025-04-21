import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CompletionQuestion, CompletionResponse } from '@/types/interactiveAssignment';

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
}

export function CompletionExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: CompletionExerciseProps) {
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

    // Sort blanks by position to ensure correct order
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, index) => {
      // Add text before the blank
      parts.push(text.substring(lastIndex, blank.position));

      // Add the input field
      const answer = answers.find(a => a.blankId === blank.id)?.answer || '';
      const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
      const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();

      parts.push(
        <span key={blank.id} className="inline-block mx-1">
          {readOnly || showAnswers ? (
            <span 
              className={`px-2 py-1 border rounded ${
                isCorrect ? 'bg-green-100 border-green-300' : 
                isIncorrect ? 'bg-red-100 border-red-300' : 
                'bg-gray-100 border-gray-300'
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
    parts.push(text.substring(lastIndex));

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
