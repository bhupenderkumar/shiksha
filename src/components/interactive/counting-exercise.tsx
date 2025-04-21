import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { CountingQuestion } from '@/types/interactiveAssignment';
import { Plus, Minus, Check, X } from 'lucide-react';

interface CountingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CountingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

export function CountingExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: CountingExerciseProps) {
  const [count, setCount] = useState<number>(0);
  const [markers, setMarkers] = useState<{ x: number; y: number }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { 
    imageUrl, 
    itemsToCount, 
    correctCount, 
    minCount, 
    maxCount, 
    showNumbers 
  } = question.questionData;
  
  // Initialize count from initial response if available
  useEffect(() => {
    if (initialResponse?.count !== undefined) {
      setCount(initialResponse.count);
    }
    
    if (initialResponse?.markers) {
      setMarkers(initialResponse.markers);
    }
  }, [initialResponse]);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || count >= maxCount) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Add marker and increment count
    setMarkers(prev => [...prev, { x, y }]);
    setCount(prev => prev + 1);
  };
  
  const handleIncrement = () => {
    if (count < maxCount) {
      setCount(prev => prev + 1);
    }
  };
  
  const handleDecrement = () => {
    if (count > minCount) {
      setCount(prev => prev - 1);
      
      // Remove the last marker if there are any
      if (markers.length > 0) {
        setMarkers(prev => prev.slice(0, -1));
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (isNaN(value)) {
      setCount(0);
    } else {
      const clampedValue = Math.min(Math.max(value, minCount), maxCount);
      setCount(clampedValue);
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave({
        count,
        markers,
        isCorrect: count === correctCount
      });
    }
  };
  
  const handleReset = () => {
    setCount(0);
    setMarkers([]);
  };
  
  const isCorrect = count === correctCount;
  const isIncorrect = count !== correctCount;
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <p className="mb-4 text-gray-600">
          Count the number of {itemsToCount} in the image below:
        </p>
        
        <div className="relative border rounded-md overflow-hidden mb-4">
          <div 
            className="relative cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={imageUrl}
              alt={`Count the ${itemsToCount}`}
              className="w-full h-auto"
              onLoad={handleImageLoad}
            />
            
            {/* Render markers */}
            {imageLoaded && markers.map((marker, index) => (
              <div
                key={index}
                className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 bg-opacity-70 text-white font-bold transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${marker.x * 100}%`,
                  top: `${marker.y * 100}%`
                }}
              >
                {showNumbers ? index + 1 : ''}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-6">
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
              min={minCount}
              max={maxCount}
              disabled={readOnly}
              className={`w-20 text-center text-xl font-bold ${
                showAnswers && isCorrect ? 'border-green-500 bg-green-50' : ''
              } ${
                showAnswers && isIncorrect ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            
            {showAnswers && (
              <div className="absolute right-0 top-0 transform translate-x-full ml-2 flex items-center">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      Correct: {correctCount}
                    </span>
                  </div>
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
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default CountingExercise;
