import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { MatchingQuestion, MatchingResponse } from '@/types/interactiveAssignment';
import { playSound } from '@/lib/sound-effects';
import { triggerConfetti } from '@/lib/confetti';
import { RefreshCw, Volume2, VolumeX, HelpCircle, Play, ArrowRight } from 'lucide-react';

interface ChildFriendlyMatchingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MatchingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MatchingResponse;
  onSave?: (response: MatchingResponse) => void;
  onNext?: () => void;
  showAnswers?: boolean;
  enableSounds?: boolean;
  enableAnimations?: boolean;
  showPlayButton?: boolean;
}

interface MatchingItem {
  id: string;
  content: string;
  type?: 'text' | 'image';
  isMatched?: boolean;
  matchedWithId?: string;
}

interface MatchingPair {
  leftId: string;
  rightId: string;
  isCorrect?: boolean;
}

interface ConnectionLine {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  isCorrect?: boolean;
  isAnimating?: boolean;
}

export function ChildFriendlyMatchingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  onNext,
  showAnswers = false,
  enableSounds = true,
  enableAnimations = true,
  showPlayButton = false
}: ChildFriendlyMatchingExerciseProps) {
  // State for source and target items
  const [sourceItems, setSourceItems] = useState<MatchingItem[]>([]);
  const [targetItems, setTargetItems] = useState<MatchingItem[]>([]);

  // State for tracking matches
  const [matchedPairs, setMatchedPairs] = useState<MatchingPair[]>([]);

  // State for tracking connection lines
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);

  // State for tracking active drag item
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // State for tracking if sounds are muted
  const [soundsMuted, setSoundsMuted] = useState<boolean>(!enableSounds);

  // State for tracking if all matches are correct
  const [allCorrect, setAllCorrect] = useState<boolean>(false);

  // State for tracking if celebration has been shown
  const [celebrationShown, setCelebrationShown] = useState<boolean>(false);

  // Refs for tracking item positions
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Configure sensors for keyboard and pointer events
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for easier activation for children
        delay: 100, // Shorter delay for more immediate response
        tolerance: 10, // More tolerance for imprecise movements
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Initialize items from question data
  useEffect(() => {
    if (question.questionData) {
      // Create source items from the left side of pairs
      const sources = question.questionData.pairs.map(pair => ({
        id: `source-${pair.id}`,
        content: pair.left,
        type: pair.leftType || 'text',
        isMatched: false
      }));

      // Create target items from the right side of pairs
      const targets = question.questionData.pairs.map(pair => ({
        id: `target-${pair.id}`,
        content: pair.right,
        type: pair.rightType || 'text',
        isMatched: false
      }));

      // Shuffle the source and target items
      setSourceItems(shuffleArray([...sources]));
      setTargetItems(shuffleArray([...targets]));
    }

    // Initialize matches from initial response if available
    if (initialResponse?.pairs) {
      const initialPairs: MatchingPair[] = initialResponse.pairs.map(pair => ({
        leftId: `source-${pair.leftId}`,
        rightId: `target-${pair.rightId}`,
        isCorrect: isMatchCorrect(`source-${pair.leftId}`, `target-${pair.rightId}`)
      }));

      setMatchedPairs(initialPairs);

      // Mark matched items
      updateMatchedItems(initialPairs);
    }
  }, [question, initialResponse]);

  // Update connection lines when matched pairs change
  useEffect(() => {
    updateConnectionLines();
  }, [matchedPairs]);

  // Check if all matches are correct when matched pairs change
  useEffect(() => {
    if (matchedPairs.length === question.questionData.pairs.length) {
      const allMatchesCorrect = matchedPairs.every(pair => isMatchCorrect(pair.leftId, pair.rightId));
      setAllCorrect(allMatchesCorrect);

      // Show celebration if all matches are correct and celebration hasn't been shown yet
      if (allMatchesCorrect && !celebrationShown && enableAnimations) {
        triggerConfetti();
        setCelebrationShown(true);

        if (!soundsMuted) {
          playSound('complete');
        }

        toast.success('Great job! All matches are correct!', {
          icon: '🎉',
          duration: 3000,
        });
      }
    }
  }, [matchedPairs]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);

    // Play sound effect
    if (!soundsMuted) {
      playSound('click');
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Highlight potential match
    const sourceId = active.id as string;
    const targetId = over.id as string;

    // Check if this would be a correct match
    const wouldBeCorrect = isMatchCorrect(sourceId, targetId);

    // Visual feedback could be added here
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

    // Check if source is already matched
    const existingPairWithSource = matchedPairs.find(pair => pair.leftId === sourceId);
    if (existingPairWithSource) {
      // Remove existing pair
      setMatchedPairs(prev => prev.filter(pair => pair.leftId !== sourceId));
    }

    // Check if target is already matched
    const existingPairWithTarget = matchedPairs.find(pair => pair.rightId === targetId);
    if (existingPairWithTarget) {
      // Remove existing pair
      setMatchedPairs(prev => prev.filter(pair => pair.rightId !== targetId));
    }

    // Create new pair
    const isCorrect = isMatchCorrect(sourceId, targetId);
    const newPair: MatchingPair = {
      leftId: sourceId,
      rightId: targetId,
      isCorrect
    };

    // Add new pair
    setMatchedPairs(prev => [...prev, newPair]);

    // Update matched items
    updateMatchedItems([...matchedPairs.filter(p =>
      p.leftId !== sourceId && p.rightId !== targetId), newPair]);

    // Play appropriate sound
    if (!soundsMuted) {
      playSound(isCorrect ? 'correct' : 'incorrect');
    }

    // Show toast for feedback
    if (isCorrect) {
      toast.success('Correct match!', { duration: 1500 });
    } else {
      toast.error('Try again!', { duration: 1500 });
    }

    // Save response
    if (onSave) {
      const updatedPairs = [...matchedPairs.filter(p =>
        p.leftId !== sourceId && p.rightId !== targetId), newPair];

      onSave({
        pairs: updatedPairs.map(pair => ({
          leftId: pair.leftId.replace('source-', ''),
          rightId: pair.rightId.replace('target-', '')
        }))
      });
    }
  };

  // Check if a match is correct
  const isMatchCorrect = (sourceId: string, targetId: string): boolean => {
    const sourceOriginalId = sourceId.replace('source-', '');
    const targetOriginalId = targetId.replace('target-', '');

    return sourceOriginalId === targetOriginalId;
  };

  // Update matched items
  const updateMatchedItems = (pairs: MatchingPair[]) => {
    // Reset all items to unmatched
    setSourceItems(prev => prev.map(item => ({ ...item, isMatched: false, matchedWithId: undefined })));
    setTargetItems(prev => prev.map(item => ({ ...item, isMatched: false, matchedWithId: undefined })));

    // Update matched items
    setSourceItems(prev => prev.map(item => {
      const matchingPair = pairs.find(pair => pair.leftId === item.id);
      if (matchingPair) {
        return {
          ...item,
          isMatched: true,
          matchedWithId: matchingPair.rightId
        };
      }
      return item;
    }));

    setTargetItems(prev => prev.map(item => {
      const matchingPair = pairs.find(pair => pair.rightId === item.id);
      if (matchingPair) {
        return {
          ...item,
          isMatched: true,
          matchedWithId: matchingPair.leftId
        };
      }
      return item;
    }));
  };

  // Update connection lines
  const updateConnectionLines = () => {
    const lines: ConnectionLine[] = [];

    matchedPairs.forEach(pair => {
      const sourceElement = itemRefs.current.get(pair.leftId);
      const targetElement = itemRefs.current.get(pair.rightId);

      if (sourceElement && targetElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        // Calculate center points
        const startPoint = {
          x: sourceRect.left + sourceRect.width / 2,
          y: sourceRect.top + sourceRect.height / 2
        };

        const endPoint = {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2
        };

        lines.push({
          startPoint,
          endPoint,
          isCorrect: pair.isCorrect,
          isAnimating: true
        });
      }
    });

    setConnectionLines(lines);
  };

  // Handle reset
  const handleReset = () => {
    // Reset all state
    setMatchedPairs([]);
    updateMatchedItems([]);
    setCelebrationShown(false);
    setAllCorrect(false);

    // Play sound effect
    if (!soundsMuted) {
      playSound('click');
    }

    // Show toast
    toast.success('Exercise reset!', { duration: 1500 });

    // Save empty response
    if (onSave) {
      onSave({ pairs: [] });
    }
  };

  // Toggle sound mute
  const toggleSound = () => {
    setSoundsMuted(!soundsMuted);
    if (soundsMuted) {
      // If we're unmuting, play a sound to confirm
      playSound('click');
    }
  };

  // Utility function to shuffle an array
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Render item content
  const renderItemContent = (item: MatchingItem) => {
    if (item.type === 'image') {
      return (
        <div className="flex justify-center items-center h-full">
          <img
            src={item.content}
            alt="Matching item"
            className="max-h-16 max-w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-lg font-comic">{item.content}</p>
      </div>
    );
  };

  // Draggable item component
  const DraggableItem = ({ item }: { item: MatchingItem }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: item.id,
      disabled: item.isMatched || readOnly
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <motion.div
        ref={(node) => {
          setNodeRef(node);
          if (node) itemRefs.current.set(item.id, node);
        }}
        style={style}
        {...attributes}
        {...listeners}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isDragging ? 1.05 : 1,
          opacity: 1,
          backgroundColor: item.isMatched
            ? (isMatchCorrect(item.id, item.matchedWithId || '') ? '#e6f7e6' : '#fff0f0')
            : 'white'
        }}
        whileHover={{ scale: item.isMatched ? 1 : 1.05 }}
        whileTap={{ scale: item.isMatched ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`
          p-4 rounded-lg border-2 shadow-md cursor-grab active:cursor-grabbing
          ${item.isMatched
            ? (isMatchCorrect(item.id, item.matchedWithId || '')
              ? 'border-green-400'
              : 'border-red-300')
            : 'border-blue-300'}
          ${isDragging ? 'z-50' : 'z-10'}
          ${readOnly || item.isMatched ? 'cursor-default' : ''}
          min-h-[80px] min-w-[120px] flex items-center justify-center
        `}
      >
        {renderItemContent(item)}
      </motion.div>
    );
  };

  // Droppable item component
  const DroppableItem = ({ item }: { item: MatchingItem }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: item.id,
      disabled: item.isMatched || readOnly
    });

    return (
      <motion.div
        ref={(node) => {
          setNodeRef(node);
          if (node) itemRefs.current.set(item.id, node);
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          backgroundColor: item.isMatched
            ? (isMatchCorrect(item.matchedWithId || '', item.id) ? '#e6f7e6' : '#fff0f0')
            : isOver ? '#f0f9ff' : 'white'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`
          p-4 rounded-lg border-2 shadow-md
          ${item.isMatched
            ? (isMatchCorrect(item.matchedWithId || '', item.id)
              ? 'border-green-400'
              : 'border-red-300')
            : isOver ? 'border-blue-500' : 'border-dashed border-blue-300'}
          min-h-[80px] min-w-[120px] flex items-center justify-center
        `}
      >
        {renderItemContent(item)}
      </motion.div>
    );
  };

  // Connection lines component
  const ConnectionLines = () => {
    return (
      <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full">
        {connectionLines.map((line, index) => (
          <motion.line
            key={index}
            x1={line.startPoint.x}
            y1={line.startPoint.y}
            x2={line.endPoint.x}
            y2={line.endPoint.y}
            stroke={line.isCorrect ? "#4CAF50" : "#FF9800"}
            strokeWidth={3}
            strokeDasharray={line.isAnimating ? "5,5" : "none"}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{question.questionText}</h3>

        <div className="flex items-center space-x-2">
          {/* Sound toggle button */}
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="text-gray-500 hover:text-primary"
              title={soundsMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {soundsMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Help button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.success('Match the items by dragging from left to right!', { duration: 3000 })}
            className="text-gray-500 hover:text-primary"
            title="Show help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Simple instructions */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-700 text-center">
          Drag the items on the left to their matching items on the right!
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative">
          {/* Connection lines */}
          <ConnectionLines />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Source items column */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-center mb-2">Items</h4>
              <div className="space-y-4">
                <AnimatePresence>
                  {sourceItems.map(item => (
                    <DraggableItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Target items column */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-center mb-2">Matches</h4>
              <div className="space-y-4">
                <AnimatePresence>
                  {targetItems.map(item => (
                    <DroppableItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Controls */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center"
            disabled={matchedPairs.length === 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChildFriendlyMatchingExercise;