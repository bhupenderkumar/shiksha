import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragDropContainer, Draggable, Droppable } from '@/components/ui/drag-drop-container';
import { DragEndEvent } from '@dnd-kit/core';
import { closestCenter } from '@dnd-kit/core';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { 
  InteractiveQuestion, 
  InteractiveResponse,
  MatchingQuestion,
  MatchingResponse
} from '@/types/interactiveAssignment';

interface MatchingExerciseProps {
  question: InteractiveQuestion;
  initialResponse?: InteractiveResponse;
  onResponseChange?: (responseData: MatchingResponse) => void;
  readOnly?: boolean;
  showAnswers?: boolean;
}

export function MatchingExercise({
  question,
  initialResponse,
  onResponseChange,
  readOnly = false,
  showAnswers = false
}: MatchingExerciseProps) {
  const questionData = question.questionData as MatchingQuestion;
  const [pairs, setPairs] = useState<{ leftId: string; rightId: string }[]>([]);
  const [availableLeftItems, setAvailableLeftItems] = useState<string[]>([]);
  const [availableRightItems, setAvailableRightItems] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Initialize state from question data
  useEffect(() => {
    if (!questionData || !questionData.pairs) return;
    
    // Get all left and right item IDs
    const leftIds = questionData.pairs.map(pair => pair.id + '-left');
    const rightIds = questionData.pairs.map(pair => pair.id + '-right');
    
    setAvailableLeftItems(leftIds);
    setAvailableRightItems(rightIds);
    
    // If there's an initial response, load it
    if (initialResponse && initialResponse.responseData) {
      const responseData = initialResponse.responseData as MatchingResponse;
      setPairs(responseData.pairs || []);
      
      // Remove matched items from available lists
      const matchedLeftIds = responseData.pairs.map(p => p.leftId);
      const matchedRightIds = responseData.pairs.map(p => p.rightId);
      
      setAvailableLeftItems(leftIds.filter(id => !matchedLeftIds.includes(id)));
      setAvailableRightItems(rightIds.filter(id => !matchedRightIds.includes(id)));
    }
  }, [questionData, initialResponse]);
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if we're dragging from left to right or vice versa
    const isLeftToRight = activeId.endsWith('-left') && overId.endsWith('-right');
    const isRightToLeft = activeId.endsWith('-right') && overId.endsWith('-left');
    
    if (!isLeftToRight && !isRightToLeft) return;
    
    // Create a new pair
    const newPair = isLeftToRight
      ? { leftId: activeId, rightId: overId }
      : { leftId: overId, rightId: activeId };
    
    // Check if either item is already in a pair
    const existingPairWithLeft = pairs.find(p => p.leftId === newPair.leftId);
    const existingPairWithRight = pairs.find(p => p.rightId === newPair.rightId);
    
    if (existingPairWithLeft || existingPairWithRight) {
      // Remove existing pairs
      const filteredPairs = pairs.filter(
        p => p.leftId !== newPair.leftId && p.rightId !== newPair.rightId
      );
      
      // Add the new pair
      const updatedPairs = [...filteredPairs, newPair];
      setPairs(updatedPairs);
      
      // Update available items
      const matchedLeftIds = updatedPairs.map(p => p.leftId);
      const matchedRightIds = updatedPairs.map(p => p.rightId);
      
      const leftIds = questionData.pairs.map(pair => pair.id + '-left');
      const rightIds = questionData.pairs.map(pair => pair.id + '-right');
      
      setAvailableLeftItems(leftIds.filter(id => !matchedLeftIds.includes(id)));
      setAvailableRightItems(rightIds.filter(id => !matchedRightIds.includes(id)));
      
      // Notify parent of change
      if (onResponseChange) {
        onResponseChange({ pairs: updatedPairs });
      }
    } else {
      // Add the new pair
      const updatedPairs = [...pairs, newPair];
      setPairs(updatedPairs);
      
      // Remove items from available lists
      setAvailableLeftItems(prev => prev.filter(id => id !== newPair.leftId));
      setAvailableRightItems(prev => prev.filter(id => id !== newPair.rightId));
      
      // Notify parent of change
      if (onResponseChange) {
        onResponseChange({ pairs: updatedPairs });
      }
    }
  };
  
  // Reset all pairs
  const handleReset = () => {
    setPairs([]);
    
    // Reset available items
    const leftIds = questionData.pairs.map(pair => pair.id + '-left');
    const rightIds = questionData.pairs.map(pair => pair.id + '-right');
    
    setAvailableLeftItems(leftIds);
    setAvailableRightItems(rightIds);
    
    // Notify parent of change
    if (onResponseChange) {
      onResponseChange({ pairs: [] });
    }
    
    toast.success('Matching exercise reset');
  };
  
  // Check if a pair is correct
  const isPairCorrect = (leftId: string, rightId: string) => {
    if (!showAnswers) return undefined;
    
    const leftItemId = leftId.replace('-left', '');
    const rightItemId = rightId.replace('-right', '');
    
    return leftItemId === rightItemId;
  };
  
  // Render a left or right item
  const renderItem = (itemId: string, content: React.ReactNode, isPaired: boolean) => {
    const isLeft = itemId.endsWith('-left');
    const baseId = itemId.replace('-left', '').replace('-right', '');
    const pair = questionData.pairs.find(p => p.id === baseId);
    
    if (!pair) return null;
    
    const isCorrect = isPaired ? isPairCorrect(
      isLeft ? itemId : pairs.find(p => p.rightId === itemId)?.leftId || '',
      isLeft ? pairs.find(p => p.leftId === itemId)?.rightId || '' : itemId
    ) : undefined;
    
    return (
      <div
        className={`
          p-3 rounded-lg border-2 transition-colors
          ${isPaired ? 'bg-gray-50' : 'bg-white'}
          ${isCorrect === true ? 'border-green-300 bg-green-50' : ''}
          ${isCorrect === false ? 'border-red-300 bg-red-50' : ''}
          ${!isPaired && !isCorrect ? 'border-gray-200' : ''}
        `}
      >
        {content}
        
        {isPaired && showAnswers && (
          <div className="flex justify-end mt-1">
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render a pair
  const renderPair = (leftId: string, rightId: string) => {
    const leftBaseId = leftId.replace('-left', '');
    const rightBaseId = rightId.replace('-right', '');
    
    const leftPair = questionData.pairs.find(p => p.id === leftBaseId);
    const rightPair = questionData.pairs.find(p => p.id === rightBaseId);
    
    if (!leftPair || !rightPair) return null;
    
    const isCorrect = isPairCorrect(leftId, rightId);
    
    return (
      <div 
        key={`${leftId}-${rightId}`}
        className={`
          flex items-center gap-4 p-2 rounded-lg mb-2
          ${isCorrect === true ? 'bg-green-50' : ''}
          ${isCorrect === false ? 'bg-red-50' : ''}
          ${isCorrect === undefined ? 'bg-gray-50' : ''}
        `}
      >
        <div className="flex-1">
          {renderItem(leftId, renderItemContent(leftPair, 'left'), true)}
        </div>
        
        <div className="flex-shrink-0">
          <div className="w-8 h-0.5 bg-gray-300"></div>
        </div>
        
        <div className="flex-1">
          {renderItem(rightId, renderItemContent(rightPair, 'right'), true)}
        </div>
      </div>
    );
  };
  
  // Render item content based on type
  const renderItemContent = (
    pair: { id: string; left: string; right: string; leftType?: 'text' | 'image'; rightType?: 'text' | 'image' },
    side: 'left' | 'right'
  ) => {
    const content = side === 'left' ? pair.left : pair.right;
    const type = side === 'left' ? pair.leftType || 'text' : pair.rightType || 'text';
    
    if (type === 'image') {
      return (
        <div className="flex justify-center">
          <img
            src={content}
            alt={`Item ${pair.id}`}
            className="h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFOUVDRUYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZDNzU3RCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
      );
    }
    
    return <div className="text-center">{content}</div>;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{question.questionText}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <DragDropContainer
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {/* Matched pairs */}
          {pairs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Matched Items</h3>
              <div className="space-y-2">
                {pairs.map(pair => renderPair(pair.leftId, pair.rightId))}
              </div>
            </div>
          )}
          
          {/* Available items */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left items */}
            <div>
              <h3 className="text-lg font-medium mb-3">Items</h3>
              <div className="space-y-2">
                {availableLeftItems.map(leftId => {
                  const baseId = leftId.replace('-left', '');
                  const pair = questionData.pairs.find(p => p.id === baseId);
                  
                  if (!pair) return null;
                  
                  return (
                    <Draggable
                      key={leftId}
                      id={leftId}
                      disabled={readOnly}
                    >
                      {renderItem(leftId, renderItemContent(pair, 'left'), false)}
                    </Draggable>
                  );
                })}
              </div>
            </div>
            
            {/* Right items */}
            <div>
              <h3 className="text-lg font-medium mb-3">Matches</h3>
              <div className="space-y-2">
                {availableRightItems.map(rightId => {
                  const baseId = rightId.replace('-right', '');
                  const pair = questionData.pairs.find(p => p.id === baseId);
                  
                  if (!pair) return null;
                  
                  return (
                    <Droppable
                      key={rightId}
                      id={rightId}
                      disabled={readOnly}
                    >
                      {renderItem(rightId, renderItemContent(pair, 'right'), false)}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          </div>
        </DragDropContainer>
        
        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
