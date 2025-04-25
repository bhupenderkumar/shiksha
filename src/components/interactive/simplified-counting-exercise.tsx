import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { RefreshCw, Plus, Minus, CheckCircle, XCircle } from 'lucide-react';
import { CountingQuestion, CountingResponse } from '@/types/interactiveAssignment';

interface SimplifiedCountingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CountingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: CountingResponse;
  onSave?: (response: CountingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedCountingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedCountingExerciseProps) {
  const [count, setCount] = useState(0);
  
  const { imageUrl, itemsToCount, correctCount, minCount = 0, maxCount = 20, showNumbers } = question.questionData;
  
  // Initialize count from initial response if available
  useEffect(() => {
    if (initialResponse?.count !== undefined) {
      setCount(initialResponse.count);
    }
  }, [initialResponse]);
  
  // Handle count change
  const handleCountChange = (newCount: number) => {
    if (readOnly) return;
    
    // Ensure count is within bounds
    if (newCount < minCount) newCount = minCount;
    if (newCount > maxCount) newCount = maxCount;
    
    setCount(newCount);
  };
  
  // Handle increment
  const handleIncrement = () => {
    handleCountChange(count + 1);
  };
  
  // Handle decrement
  const handleDecrement = () => {
    handleCountChange(count - 1);
  };
  
  // Handle direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      handleCountChange(value);
    }
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ count });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setCount(0);
  };
  
  // Check if answer is correct
  const isCorrect = count === correctCount;
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Count the number of {itemsToCount} in the image.
      </p>
      
      {/* Image */}
      <div className="mb-6 border rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={`Count the ${itemsToCount}`}
          className="w-full"
        />
      </div>
      
      {/* Counting interface */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={readOnly || count <= minCount}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Input
              type="number"
              value={count}
              onChange={handleInputChange}
              disabled={readOnly}
              min={minCount}
              max={maxCount}
              className="w-20 text-center text-xl font-bold"
            />
            
            {showAnswers && (
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={readOnly || count >= maxCount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Number display */}
        {showNumbers && (
          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {Array.from({ length: count }).map((_, index) => (
                <div
                  key={index}
                  className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full font-bold text-blue-800"
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Show correct answer */}
        {showAnswers && !isCorrect && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-700">
              The correct answer is: {correctCount}
            </p>
          </div>
        )}
        
        {/* Controls */}
        {!readOnly && (
          <div className="mt-6 flex justify-center">
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
    </div>
  );
}

export default SimplifiedCountingExercise;
