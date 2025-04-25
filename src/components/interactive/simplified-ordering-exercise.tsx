import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, ArrowUp, ArrowDown, CheckCircle, XCircle } from 'lucide-react';
import { OrderingQuestion, OrderingResponse } from '@/types/interactiveAssignment';

interface SimplifiedOrderingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: OrderingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: OrderingResponse;
  onSave?: (response: OrderingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedOrderingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedOrderingExerciseProps) {
  const [items, setItems] = useState<(OrderingQuestion['items'][0] & { position: number })[]>([]);
  
  // Initialize items from question data or initial response
  useEffect(() => {
    if (question.questionData) {
      if (initialResponse?.orderedItems) {
        // Initialize from response
        const responseItems = [...question.questionData.items].map(item => {
          const responseItem = initialResponse.orderedItems.find(ri => ri.id === item.id);
          return {
            ...item,
            position: responseItem?.position || 0
          };
        }).sort((a, b) => a.position - b.position);
        
        setItems(responseItems);
      } else {
        // Initialize with shuffled items
        const initialItems = [...question.questionData.items]
          .sort(() => Math.random() - 0.5) // Shuffle items
          .map((item, index) => ({
            ...item,
            position: index
          }));
        
        setItems(initialItems);
      }
    }
  }, [question.questionData, initialResponse]);

  // Move an item up in the order
  const moveItemUp = (id: string) => {
    setItems(prevItems => {
      const index = prevItems.findIndex(item => item.id === id);
      if (index <= 0) return prevItems;
      
      const newItems = [...prevItems];
      // Swap positions
      const temp = newItems[index].position;
      newItems[index].position = newItems[index - 1].position;
      newItems[index - 1].position = temp;
      
      return newItems.sort((a, b) => a.position - b.position);
    });
  };

  // Move an item down in the order
  const moveItemDown = (id: string) => {
    setItems(prevItems => {
      const index = prevItems.findIndex(item => item.id === id);
      if (index === -1 || index >= prevItems.length - 1) return prevItems;
      
      const newItems = [...prevItems];
      // Swap positions
      const temp = newItems[index].position;
      newItems[index].position = newItems[index + 1].position;
      newItems[index + 1].position = temp;
      
      return newItems.sort((a, b) => a.position - b.position);
    });
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      const orderedItems = items.map(item => ({
        id: item.id,
        position: item.position
      }));
      
      onSave({ orderedItems });
    }
  };

  // Handle reset
  const handleReset = () => {
    const shuffledItems = [...question.questionData.items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        position: index
      }));
    
    setItems(shuffledItems);
  };

  // Check if an item is in the correct position
  const isItemInCorrectPosition = (item: OrderingQuestion['items'][0] & { position: number }) => {
    return item.position === item.correctPosition;
  };

  // Calculate score
  const calculateScore = () => {
    if (items.length === 0) return 0;
    
    const correctCount = items.filter(item => isItemInCorrectPosition(item)).length;
    return Math.round((correctCount / items.length) * 100);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Arrange the items in the correct order using the up and down buttons.
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}
      
      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isCorrect = showAnswers && isItemInCorrectPosition(item);
          const isIncorrect = showAnswers && !isItemInCorrectPosition(item);
          
          return (
            <div 
              key={item.id}
              className={`
                flex items-center p-3 border rounded-md
                ${isCorrect ? 'bg-green-50 border-green-300' : ''}
                ${isIncorrect ? 'bg-red-50 border-red-300' : ''}
              `}
            >
              {!readOnly && (
                <div className="flex flex-col mr-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItemUp(item.id)}
                    disabled={index === 0}
                    className="h-6 w-6"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItemDown(item.id)}
                    disabled={index === items.length - 1}
                    className="h-6 w-6"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{item.text}</span>
                  
                  {showAnswers && (
                    <div className="ml-auto">
                      {isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {isIncorrect && (
                        <div className="flex items-center">
                          <XCircle className="h-5 w-5 text-red-500 mr-1" />
                          <span className="text-xs text-red-500">
                            (Should be position {item.correctPosition + 1})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {item.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={item.imageUrl} 
                      alt={item.text} 
                      className="max-h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

export default SimplifiedOrderingExercise;
