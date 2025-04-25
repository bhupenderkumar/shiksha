import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface MatchingItem {
  id: string;
  content: string;
  type?: 'text' | 'image';
}

interface MatchingQuestion {
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  correctPairs: { leftId: string; rightId: string }[];
}

interface MatchingResponse {
  pairs: { leftId: string; rightId: string }[];
  isCorrect?: boolean;
}

interface SimplifiedMatchingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MatchingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MatchingResponse;
  onSave?: (response: MatchingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedMatchingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedMatchingExerciseProps) {
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);
  const [selectedRightItem, setSelectedRightItem] = useState<string | null>(null);
  const [pairs, setPairs] = useState<{ leftId: string; rightId: string }[]>([]);
  const [availableLeftItems, setAvailableLeftItems] = useState<string[]>([]);
  const [availableRightItems, setAvailableRightItems] = useState<string[]>([]);

  const { leftItems = [], rightItems = [], correctPairs = [] } = question.questionData || {};

  // Initialize available items and pairs
  useEffect(() => {
    if (initialResponse?.pairs) {
      setPairs(initialResponse.pairs);
      
      // Set available items based on what's not already paired
      const pairedLeftIds = initialResponse.pairs.map(p => p.leftId);
      const pairedRightIds = initialResponse.pairs.map(p => p.rightId);
      
      setAvailableLeftItems(leftItems.map(item => item.id).filter(id => !pairedLeftIds.includes(id)));
      setAvailableRightItems(rightItems.map(item => item.id).filter(id => !pairedRightIds.includes(id)));
    } else {
      // Start with all items available
      setAvailableLeftItems(leftItems.map(item => item.id));
      setAvailableRightItems(rightItems.map(item => item.id));
      setPairs([]);
    }
  }, [initialResponse, leftItems, rightItems]);

  // Handle item selection
  const handleItemClick = (id: string, side: 'left' | 'right') => {
    if (readOnly) return;
    
    if (side === 'left') {
      setSelectedLeftItem(id === selectedLeftItem ? null : id);
    } else {
      setSelectedRightItem(id === selectedRightItem ? null : id);
    }
  };

  // Create a pair when both left and right items are selected
  useEffect(() => {
    if (selectedLeftItem && selectedRightItem) {
      // Create a new pair
      const newPair = { leftId: selectedLeftItem, rightId: selectedRightItem };
      setPairs([...pairs, newPair]);
      
      // Remove the paired items from available items
      setAvailableLeftItems(availableLeftItems.filter(id => id !== selectedLeftItem));
      setAvailableRightItems(availableRightItems.filter(id => id !== selectedRightItem));
      
      // Clear selections
      setSelectedLeftItem(null);
      setSelectedRightItem(null);
      
      // Save the response
      if (onSave) {
        onSave({
          pairs: [...pairs, newPair]
        });
      }
    }
  }, [selectedLeftItem, selectedRightItem]);

  // Reset the exercise
  const handleReset = () => {
    setPairs([]);
    setAvailableLeftItems(leftItems.map(item => item.id));
    setAvailableRightItems(rightItems.map(item => item.id));
    setSelectedLeftItem(null);
    setSelectedRightItem(null);
    
    if (onSave) {
      onSave({ pairs: [] });
    }
  };

  // Check if a pair is correct
  const isPairCorrect = (pair: { leftId: string; rightId: string }) => {
    return correctPairs.some(
      correctPair => 
        correctPair.leftId === pair.leftId && 
        correctPair.rightId === pair.rightId
    );
  };

  // Get item by ID
  const getItemById = (id: string, side: 'left' | 'right') => {
    const items = side === 'left' ? leftItems : rightItems;
    return items.find(item => item.id === id);
  };

  // Render item content
  const renderItemContent = (item?: MatchingItem) => {
    if (!item) return null;
    
    if (item.type === 'image') {
      return (
        <div className="flex justify-center">
          <img 
            src={item.content} 
            alt="Matching item" 
            className="max-h-16 object-contain"
          />
        </div>
      );
    }
    
    return <p className="text-center">{item.content}</p>;
  };

  // Calculate score
  const calculateScore = () => {
    if (pairs.length === 0) return 0;
    
    const correctCount = pairs.filter(pair => isPairCorrect(pair)).length;
    return Math.round((correctCount / correctPairs.length) * 100);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Match items from the left column with their corresponding items in the right column.
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Left column */}
        <div>
          <h4 className="text-md font-medium mb-2">Items</h4>
          <div className="space-y-2">
            {availableLeftItems.map(itemId => {
              const item = getItemById(itemId, 'left');
              return (
                <div 
                  key={itemId}
                  onClick={() => handleItemClick(itemId, 'left')}
                  className={`
                    p-3 border rounded-md cursor-pointer transition-all
                    ${selectedLeftItem === itemId ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}
                    ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                  `}
                >
                  {renderItemContent(item)}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right column */}
        <div>
          <h4 className="text-md font-medium mb-2">Matches</h4>
          <div className="space-y-2">
            {availableRightItems.map(itemId => {
              const item = getItemById(itemId, 'right');
              return (
                <div 
                  key={itemId}
                  onClick={() => handleItemClick(itemId, 'right')}
                  className={`
                    p-3 border rounded-md cursor-pointer transition-all
                    ${selectedRightItem === itemId ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}
                    ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                  `}
                >
                  {renderItemContent(item)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Matched pairs */}
      {pairs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Matched Pairs</h4>
          <div className="space-y-2">
            {pairs.map((pair, index) => {
              const leftItem = getItemById(pair.leftId, 'left');
              const rightItem = getItemById(pair.rightId, 'right');
              const isCorrect = showAnswers ? isPairCorrect(pair) : undefined;
              
              return (
                <div 
                  key={index}
                  className={`
                    flex items-center gap-4 p-3 rounded-md border
                    ${isCorrect === true ? 'bg-green-50 border-green-300' : ''}
                    ${isCorrect === false ? 'bg-red-50 border-red-300' : ''}
                    ${isCorrect === undefined ? 'bg-gray-50 border-gray-300' : ''}
                  `}
                >
                  <div className="flex-1">
                    {renderItemContent(leftItem)}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isCorrect === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {isCorrect === false && <XCircle className="h-5 w-5 text-red-500" />}
                    {isCorrect === undefined && <div className="w-5 h-0.5 bg-gray-300"></div>}
                  </div>
                  
                  <div className="flex-1">
                    {renderItemContent(rightItem)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Controls */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-2"
            disabled={pairs.length === 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedMatchingExercise;
