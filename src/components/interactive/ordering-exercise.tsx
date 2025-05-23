import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { OrderingQuestion, OrderingResponse } from '@/types/interactiveAssignment';

interface OrderingExerciseProps {
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

interface SortableItemProps {
  id: string;
  text: string;
  imageUrl?: string;
  position: number;
  correctPosition?: number;
  showCorrect?: boolean;
}

const SortableItem = ({ id, text, imageUrl, position, correctPosition, showCorrect }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCorrect = showCorrect && correctPosition === position;
  const isIncorrect = showCorrect && correctPosition !== undefined && correctPosition !== position;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white border rounded-md p-3 mb-2 cursor-grab shadow-sm hover:shadow-md transition-shadow
        ${isCorrect ? 'bg-green-50 border-green-300' : ''}
        ${isIncorrect ? 'bg-red-50 border-red-300' : ''}
      `}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          {position + 1}
        </div>
        <div className="flex-1">
          {imageUrl && (
            <img src={imageUrl} alt={text} className="h-16 w-auto mb-2 object-contain" />
          )}
          <p>{text}</p>
        </div>
        {showCorrect && correctPosition !== undefined && (
          <div className="ml-3 text-xs">
            {isCorrect ? (
              <span className="text-green-600">Correct</span>
            ) : (
              <span className="text-red-600">Should be position {correctPosition + 1}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export function OrderingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: OrderingExerciseProps) {
  const [items, setItems] = useState<(OrderingQuestion['items'][0] & { position: number })[]>([]);

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

      // Initialize items from initial response if available
      if (initialResponse?.orderedItems) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index
        }));
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      const orderedItems = items.map(item => ({
        id: item.id,
        position: item.position
      }));

      onSave({ orderedItems });
    }
  };

  const handleReset = () => {
    // Shuffle items
    const shuffledItems = [...question.questionData.items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        position: index
      }));

    setItems(shuffledItems);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      <div className="p-4 bg-white border rounded-md">
        <p className="mb-4 text-gray-600">Arrange the items in the correct order:</p>

        {items.length === 0 ? (
          <div className="p-4 bg-gray-50 border rounded-md text-center">
            <p className="text-gray-500">No items available for this ordering exercise.</p>
          </div>
        ) : readOnly ? (
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                text={item.text}
                imageUrl={item.imageUrl}
                position={item.position}
                correctPosition={showAnswers ? item.correctPosition : undefined}
                showCorrect={showAnswers}
              />
            ))}
          </div>
        ) : (
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
                    imageUrl={item.imageUrl}
                    position={item.position}
                    correctPosition={showAnswers ? item.correctPosition : undefined}
                    showCorrect={showAnswers}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {!readOnly && items.length > 0 && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Shuffle
          </Button>
          <Button onClick={handleSave}>
            Save Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderingExercise;
