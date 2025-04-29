import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { RefreshCw, ArrowUp, ArrowDown, CheckCircle, XCircle, GripVertical, Award } from 'lucide-react';
import { OrderingQuestion, OrderingResponse } from '@/types/interactiveAssignment';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseScoreCard } from '@/components/ui/exercise-scorecard';
import { AnswerFeedback } from '@/components/ui/answer-feedback';
import { playSound, preloadSounds } from '@/utils/soundUtils';
import confetti from 'canvas-confetti';

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

// Sortable item component
interface SortableItemProps {
  id: string;
  text: string;
  position: number;
  imageUrl?: string;
  correctPosition?: number;
  showCorrect?: boolean;
}

const SortableItem = React.memo(({
  id,
  text,
  position,
  imageUrl,
  correctPosition,
  showCorrect
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Determine if the item is in the correct position
  const isCorrect = showCorrect && correctPosition !== undefined && position === correctPosition;
  const isIncorrect = showCorrect && correctPosition !== undefined && position !== correctPosition;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 border ${isCorrect ? 'border-green-300 bg-green-50' : isIncorrect ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div
            className="cursor-move"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm">
                {position + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{text}</p>
              </div>
              {showCorrect && (
                <div className="ml-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt={text}
                  className="w-20 h-20 object-cover rounded border border-gray-200"
                />
              </div>
            )}

            {showCorrect && correctPosition !== undefined && position !== correctPosition && (
              <div className="mt-2 text-sm text-red-500">
                Correct position: {correctPosition + 1}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function SimplifiedOrderingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedOrderingExerciseProps) {
  const [items, setItems] = useState<(OrderingQuestion['items'][0] & { position: number })[]>([]);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [lastMoveCorrect, setLastMoveCorrect] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
        delay: 150, // 150ms delay before activation to prevent interference with text inputs
        tolerance: 5, // 5px of movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Preload sounds when component mounts
  useEffect(() => {
    preloadSounds();
  }, []);

  // Initialize items from question data or initial response
  useEffect(() => {
    try {
      // Validate question data
      if (!question?.questionData) {
        console.error('Question data is missing');
        setItems([]);
        return;
      }

      // Ensure items array exists
      const questionItems = question.questionData.items || [];
      if (!Array.isArray(questionItems)) {
        console.error('Question items is not an array:', questionItems);
        setItems([]);
        return;
      }

      // If no items, set empty array
      if (questionItems.length === 0) {
        console.warn('No items found in question data');
        setItems([]);
        return;
      }

      if (initialResponse?.orderedItems) {
        // Initialize from response
        try {
          const responseItems = [...questionItems].map(item => {
            const responseItem = initialResponse.orderedItems.find(ri => ri.id === item.id);
            return {
              ...item,
              position: responseItem?.position || 0
            };
          }).sort((a, b) => a.position - b.position);

          setItems(responseItems);
        } catch (error) {
          console.error('Error initializing from response:', error);
          // Fallback to default initialization
          const fallbackItems = [...questionItems].map((item, index) => ({
            ...item,
            position: index
          }));
          setItems(fallbackItems);
        }
      } else {
        // Initialize with shuffled items
        try {
          const initialItems = [...questionItems]
            .sort(() => Math.random() - 0.5) // Shuffle items
            .map((item, index) => ({
              ...item,
              position: index
            }));

          setItems(initialItems);
        } catch (error) {
          console.error('Error initializing shuffled items:', error);
          // Fallback to ordered initialization
          const fallbackItems = [...questionItems].map((item, index) => ({
            ...item,
            position: index
          }));
          setItems(fallbackItems);
        }
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setItems([]);
    }
  }, [question, initialResponse]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems(prevItems => {
      const oldIndex = prevItems.findIndex(item => item.id === active.id);
      const newIndex = prevItems.findIndex(item => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prevItems;
      }

      // Create a new array with the items in the new order
      const newItems = arrayMove(prevItems, oldIndex, newIndex);

      // Update positions to match the new order
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index
      }));

      // Check if the moved item is now in the correct position
      const movedItem = updatedItems[newIndex];
      const isCorrect = movedItem.position === movedItem.correctPosition;

      // Set feedback state
      setLastMoveCorrect(isCorrect);
      setFeedbackMessage(isCorrect ?
        'Great job! That item is in the correct position!' :
        'Keep trying! That\'s not quite right.'
      );
      setShowFeedback(true);

      // Play appropriate sound
      if (isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }

      // Hide feedback after a delay
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);

      // Check if all items are in correct positions
      const allCorrect = updatedItems.every(item => item.position === item.correctPosition);
      if (allCorrect && !readOnly && !showAnswers) {
        // Play celebration sound and show score card
        setTimeout(() => {
          playSound('celebration');
          setShowScoreCard(true);

          // Launch confetti
          const end = Date.now() + 2000;
          const colors = ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#1E90FF'];

          (function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors
            });

            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
        }, 500);
      }

      return updatedItems;
    });
  };

  // Legacy methods for compatibility - these can be used as fallbacks
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

      // Check if all items are in correct positions
      const allCorrect = items.every(item => item.position === item.correctPosition);

      if (allCorrect && !showScoreCard) {
        // Play celebration sound and show score card
        playSound('celebration');
        setShowScoreCard(true);

        // Launch confetti
        const end = Date.now() + 2000;
        const colors = ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#1E90FF'];

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });

          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      } else {
        toast.success('Answer saved!');
      }
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

    // Play sound and show toast
    playSound('click');
    toast.success('Items shuffled! Try again.', {
      icon: '🔄',
      duration: 2000
    });

    // Clear any feedback
    setShowFeedback(false);
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
      {/* Score card overlay */}
      {showScoreCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ExerciseScoreCard
            score={calculateScore()}
            totalQuestions={items.length}
            correctAnswers={items.filter(item => item.position === item.correctPosition).length}
            incorrectAnswers={items.filter(item => item.position !== item.correctPosition).length}
            onContinue={() => setShowScoreCard(false)}
            onTryAgain={() => {
              setShowScoreCard(false);
              handleReset();
            }}
            showConfetti={true}
            childFriendly={true}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop the items to arrange them in the correct order.
      </p>

      {/* Feedback message */}
      {showFeedback && (
        <div className="mb-4">
          <AnswerFeedback
            isCorrect={lastMoveCorrect}
            message={feedbackMessage}
            autoHide={true}
            hideDelay={2000}
            onHide={() => setShowFeedback(false)}
            playSound={false} // We're already playing sounds in the drag end handler
          />
        </div>
      )}

      {/* Score display when showing answers */}
      {showAnswers && items.length > 0 && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}

      {/* No items message */}
      {items.length === 0 ? (
        <div className="p-4 bg-gray-50 border rounded-md text-center">
          <p className="text-gray-500">No items available for this ordering exercise.</p>
        </div>
      ) : readOnly ? (
        /* Read-only items list */
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              text={item.text}
              position={item.position}
              imageUrl={item.imageUrl}
              correctPosition={showAnswers ? item.correctPosition : undefined}
              showCorrect={showAnswers}
            />
          ))}
        </div>
      ) : (
        /* Draggable items list */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(item => item.id)}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  position={item.position}
                  imageUrl={item.imageUrl}
                  correctPosition={showAnswers ? item.correctPosition : undefined}
                  showCorrect={showAnswers}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Controls */}
      {!readOnly && items.length > 0 && (
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
