import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragDropContainer, Draggable, Droppable } from '@/components/ui/drag-drop-container';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { closestCenter } from '@dnd-kit/core';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnswerFeedback } from '@/components/ui/answer-feedback';
import { ExerciseScoreCard } from '@/components/ui/exercise-scorecard';
import { playSound } from '@/utils/soundUtils';
import { MatchingQuestion, MatchingResponse } from '@/types/interactiveAssignment';

interface EnhancedMatchingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MatchingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MatchingResponse;
  onSave?: (response: MatchingResponse) => void;
  showAnswers?: boolean;
  enableSounds?: boolean;
  childFriendly?: boolean;
}

export function EnhancedMatchingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false,
  enableSounds = true,
  childFriendly = true
}: EnhancedMatchingExerciseProps) {
  // Extract pairs from question data
  const { pairs } = question.questionData;
  
  // State for left and right items
  const [leftItems, setLeftItems] = useState<{ id: string; content: string; type?: 'text' | 'image' }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; content: string; type?: 'text' | 'image' }[]>([]);
  
  // State for matched pairs
  const [matchedPairs, setMatchedPairs] = useState<{ leftId: string; rightId: string; isCorrect?: boolean }[]>([]);
  
  // State for active drag item
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  // State for feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ isCorrect: boolean; message: string } | null>(null);
  
  // State for score card
  const [showScoreCard, setShowScoreCard] = useState(false);
  
  // Refs for drawing connection lines
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Initialize items from question data
  useEffect(() => {
    const left = pairs.map(pair => ({
      id: `${pair.id}-left`,
      content: pair.left,
      type: pair.leftType || 'text'
    }));
    
    const right = pairs.map(pair => ({
      id: `${pair.id}-right`,
      content: pair.right,
      type: pair.rightType || 'text'
    }));
    
    // Shuffle the arrays
    setLeftItems(shuffleArray([...left]));
    setRightItems(shuffleArray([...right]));
    
    // Initialize from response if available
    if (initialResponse && initialResponse.pairs) {
      setMatchedPairs(initialResponse.pairs.map(pair => ({
        leftId: pair.leftId,
        rightId: pair.rightId,
        isCorrect: isPairCorrect(pair.leftId, pair.rightId)
      })));
    }
  }, [question, initialResponse]);
  
  // Function to shuffle array
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    if (readOnly) return array; // Don't shuffle in readonly mode
    
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Check if a pair is correct
  const isPairCorrect = (leftId: string, rightId: string): boolean => {
    const leftBaseId = leftId.replace('-left', '');
    const rightBaseId = rightId.replace('-right', '');
    return leftBaseId === rightBaseId;
  };
  
  // Check if an item is already matched
  const isItemMatched = (itemId: string): boolean => {
    return matchedPairs.some(pair => pair.leftId === itemId || pair.rightId === itemId);
  };
  
  // Get the matched pair for an item
  const getMatchedPair = (itemId: string): { leftId: string; rightId: string; isCorrect?: boolean } | undefined => {
    return matchedPairs.find(pair => pair.leftId === itemId || pair.rightId === itemId);
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveDragId(id);
    
    if (enableSounds) {
      playSound('drag');
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDragId(null);
    setDragOverId(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if we're dragging from left to right or vice versa
    const isLeftItem = activeId.endsWith('-left');
    const isRightItem = activeId.endsWith('-right');
    const isOverLeftItem = overId.endsWith('-left');
    const isOverRightItem = overId.endsWith('-right');
    
    // Only allow left-to-right or right-to-left matches
    if ((isLeftItem && isOverRightItem) || (isRightItem && isOverLeftItem)) {
      // Determine left and right IDs
      const leftId = isLeftItem ? activeId : overId;
      const rightId = isRightItem ? activeId : overId;
      
      // Check if either item is already matched
      if (isItemMatched(leftId) || isItemMatched(rightId)) {
        // Remove existing matches for these items
        setMatchedPairs(prev => prev.filter(pair => 
          pair.leftId !== leftId && pair.rightId !== rightId
        ));
      }
      
      // Create new pair
      const isCorrect = isPairCorrect(leftId, rightId);
      const newPair = { leftId, rightId, isCorrect };
      
      // Add to matched pairs
      setMatchedPairs(prev => [...prev, newPair]);
      
      // Show feedback
      setFeedbackData({
        isCorrect,
        message: isCorrect ? 'Great match!' : 'Try again!'
      });
      setShowFeedback(true);
      
      // Play sound
      if (enableSounds) {
        playSound(isCorrect ? 'correct' : 'incorrect');
      }
      
      // Hide feedback after delay
      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
      
      // Save response if all pairs are matched correctly
      if (onSave && matchedPairs.length === pairs.length - 1 && isCorrect) {
        const allPairs = [...matchedPairs, newPair];
        if (allPairs.every(p => p.isCorrect)) {
          onSave({ pairs: allPairs.map(({ leftId, rightId }) => ({ leftId, rightId })) });
          setShowScoreCard(true);
        }
      }
    }
  };
  
  // Handle drag over
  const handleDragOver = (id: string | null) => {
    setDragOverId(id);
  };
  
  // Handle reset
  const handleReset = () => {
    setMatchedPairs([]);
    setShowScoreCard(false);
    
    // Re-shuffle items
    setLeftItems(shuffleArray([...leftItems]));
    setRightItems(shuffleArray([...rightItems]));
    
    toast.success('Exercise reset!');
  };
  
  // Calculate score
  const calculateScore = (): number => {
    if (matchedPairs.length === 0) return 0;
    
    const correctPairs = matchedPairs.filter(pair => pair.isCorrect);
    return Math.round((correctPairs.length / pairs.length) * 100);
  };
  
  // Register ref for an item
  const registerItemRef = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      itemRefs.current.set(id, ref);
    } else {
      itemRefs.current.delete(id);
    }
  };
  
  // Render connection lines between matched pairs
  const renderConnectionLines = () => {
    return matchedPairs.map(pair => {
      const leftElement = itemRefs.current.get(pair.leftId);
      const rightElement = itemRefs.current.get(pair.rightId);
      
      if (!leftElement || !rightElement || !containerRef.current) return null;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const leftRect = leftElement.getBoundingClientRect();
      const rightRect = rightElement.getBoundingClientRect();
      
      // Calculate positions relative to container
      const x1 = leftRect.right - containerRect.left;
      const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
      const x2 = rightRect.left - containerRect.left;
      const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
      
      return (
        <svg
          key={`${pair.leftId}-${pair.rightId}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={pair.isCorrect ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            strokeDasharray={pair.isCorrect ? '0' : '5,5'}
          />
          {pair.isCorrect && (
            <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={4} fill="#10b981" />
          )}
        </svg>
      );
    });
  };
  
  // Render item content
  const renderItemContent = (item: { id: string; content: string; type?: 'text' | 'image' }) => {
    if (item.type === 'image') {
      return (
        <div className="flex justify-center items-center h-full">
          <img 
            src={item.content} 
            alt="Item" 
            className="max-h-16 max-w-full object-contain"
          />
        </div>
      );
    }
    
    return (
      <p className="text-center">{item.content}</p>
    );
  };
  
  // Render a draggable or droppable item
  const renderItem = (
    item: { id: string; content: string; type?: 'text' | 'image' },
    isDraggable: boolean
  ) => {
    const isMatched = isItemMatched(item.id);
    const matchedPair = isMatched ? getMatchedPair(item.id) : undefined;
    const isCorrect = matchedPair?.isCorrect;
    
    const isLeftItem = item.id.endsWith('-left');
    const isActive = activeDragId === item.id;
    const isOver = dragOverId === item.id;
    
    // Determine if this item can be a valid drop target for the currently dragged item
    const isValidDropTarget = activeDragId 
      ? (isLeftItem && activeDragId.endsWith('-right')) || (!isLeftItem && activeDragId.endsWith('-left'))
      : false;
    
    return (
      <div
        ref={el => registerItemRef(item.id, el)}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200
          ${isMatched 
            ? isCorrect 
              ? 'border-green-300 bg-green-50' 
              : 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white hover:border-blue-300'
          }
          ${isActive ? 'scale-105 shadow-md z-10' : ''}
          ${isOver && isValidDropTarget ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
          ${readOnly ? 'cursor-default' : isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
      >
        {renderItemContent(item)}
        
        {isMatched && (
          <div className="absolute -top-2 -right-2">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 bg-white rounded-full" />
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-medium mb-4">{question.questionText}</h3>
          
          <div 
            ref={containerRef}
            className="relative"
          >
            <DragDropContainer
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div>
                  <h4 className={`text-lg font-medium mb-3 ${childFriendly ? 'text-blue-600' : ''}`}>
                    {childFriendly ? 'Things to Match' : 'Items'}
                  </h4>
                  <div className="space-y-3">
                    {leftItems.map(item => {
                      const isMatched = isItemMatched(item.id);
                      
                      return (
                        <Draggable
                          key={item.id}
                          id={item.id}
                          disabled={readOnly || isMatched}
                          className="transition-transform"
                        >
                          {renderItem(item, true)}
                        </Draggable>
                      );
                    })}
                  </div>
                </div>
                
                {/* Right column */}
                <div>
                  <h4 className={`text-lg font-medium mb-3 ${childFriendly ? 'text-green-600' : ''}`}>
                    {childFriendly ? 'Where They Go' : 'Matches'}
                  </h4>
                  <div className="space-y-3">
                    {rightItems.map(item => {
                      const isMatched = isItemMatched(item.id);
                      
                      return (
                        <Droppable
                          key={item.id}
                          id={item.id}
                          disabled={readOnly || isMatched}
                          isOver={dragOverId === item.id}
                          className="transition-transform"
                        >
                          {renderItem(item, true)}
                        </Droppable>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Connection lines */}
              {renderConnectionLines()}
            </DragDropContainer>
          </div>
          
          {!readOnly && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {childFriendly ? 'Start Over' : 'Reset'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Feedback toast */}
      <AnimatePresence>
        {showFeedback && feedbackData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <AnswerFeedback
              isCorrect={feedbackData.isCorrect}
              message={feedbackData.message}
              size="lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Score card overlay */}
      {showScoreCard && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <ExerciseScoreCard
              score={calculateScore()}
              totalQuestions={pairs.length}
              correctAnswers={matchedPairs.filter(pair => pair.isCorrect).length}
              incorrectAnswers={matchedPairs.filter(pair => !pair.isCorrect).length}
              onContinue={() => setShowScoreCard(false)}
              onTryAgain={handleReset}
              childFriendly={childFriendly}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedMatchingExercise;
