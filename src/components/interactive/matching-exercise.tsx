import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { MatchingQuestion, MatchingResponse } from '@/types/interactiveAssignment';

interface MatchingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MatchingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MatchingResponse;
  onSave?: (response: MatchingResponse) => void;
}

interface DraggableItemProps {
  id: string;
  content: string;
  isImage?: boolean;
}

const DraggableItem = ({ id, content, isImage = false }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-md p-3 mb-2 cursor-grab shadow-sm hover:shadow-md transition-shadow"
    >
      {isImage ? (
        <img src={content} alt="Matching item" className="h-16 w-auto mx-auto object-contain" />
      ) : (
        <p className="text-center">{content}</p>
      )}
    </div>
  );
};

export function MatchingExercise({ question, readOnly = false, initialResponse, onSave }: MatchingExerciseProps) {
  const [leftItems, setLeftItems] = useState<{ id: string; content: string; type?: 'text' | 'image' }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; content: string; type?: 'text' | 'image' }[]>([]);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [activeColumn, setActiveColumn] = useState<'left' | 'right' | null>(null);
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);

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
    if (question.questionData) {
      // Initialize left and right items from question data
      const left = question.questionData.pairs.map(pair => ({
        id: pair.id,
        content: pair.left,
        type: pair.leftType || 'text'
      }));

      const right = question.questionData.pairs.map(pair => ({
        id: pair.id,
        content: pair.right,
        type: pair.rightType || 'text'
      }));

      // Shuffle the right items
      const shuffledRight = [...right].sort(() => Math.random() - 0.5);

      setLeftItems(left);
      setRightItems(shuffledRight);
    }

    // Initialize matches from initial response if available
    if (initialResponse?.pairs) {
      setMatches(initialResponse.pairs);
    }
  }, [question, initialResponse]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (activeColumn === 'left') {
        setLeftItems(items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else if (activeColumn === 'right') {
        setRightItems(items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleItemClick = (id: string, column: 'left' | 'right') => {
    if (readOnly) return;

    if (column === 'left') {
      setSelectedLeftItem(id === selectedLeftItem ? null : id);
    } else if (column === 'right' && selectedLeftItem) {
      // Create a match
      const existingMatchIndex = matches.findIndex(match => match.leftId === selectedLeftItem);
      const newMatches = [...matches];

      if (existingMatchIndex >= 0) {
        // Update existing match
        newMatches[existingMatchIndex] = { leftId: selectedLeftItem, rightId: id };
      } else {
        // Add new match
        newMatches.push({ leftId: selectedLeftItem, rightId: id });
      }

      setMatches(newMatches);
      setSelectedLeftItem(null);
    }
  };

  const handleSave = () => {
    if (matches.length !== leftItems.length) {
      toast.error('Please match all items before saving');
      return;
    }

    if (onSave) {
      onSave({ pairs: matches });
    }
  };

  const handleReset = () => {
    setMatches([]);
    setSelectedLeftItem(null);
  };

  const isItemMatched = (id: string, column: 'left' | 'right') => {
    if (column === 'left') {
      return matches.some(match => match.leftId === id);
    } else {
      return matches.some(match => match.rightId === id);
    }
  };

  const getMatchedPair = (id: string, column: 'left' | 'right') => {
    if (column === 'left') {
      const match = matches.find(match => match.leftId === id);
      return match ? match.rightId : null;
    } else {
      const match = matches.find(match => match.rightId === id);
      return match ? match.leftId : null;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <h4 className="text-md font-medium mb-2">Items</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => setActiveColumn('left')}
          >
            <SortableContext items={leftItems.map(item => item.id)}>
              <div className="space-y-2">
                {leftItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, 'left')}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all
                      ${isItemMatched(item.id, 'left') ? 'bg-green-50 border-green-300' : 'bg-white'}
                      ${selectedLeftItem === item.id ? 'ring-2 ring-blue-500' : ''}
                      ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                    `}
                  >
                    {item.type === 'image' ? (
                      <img src={item.content} alt="Item" className="h-16 w-auto mx-auto object-contain" />
                    ) : (
                      <p className="text-center">{item.content}</p>
                    )}

                    {isItemMatched(item.id, 'left') && (
                      <div className="mt-2 text-xs text-center text-green-600">
                        Matched
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Right column */}
        <div>
          <h4 className="text-md font-medium mb-2">Matches</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => setActiveColumn('right')}
          >
            <SortableContext items={rightItems.map(item => item.id)}>
              <div className="space-y-2">
                {rightItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, 'right')}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all
                      ${isItemMatched(item.id, 'right') ? 'bg-green-50 border-green-300' : 'bg-white'}
                      ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                    `}
                  >
                    {item.type === 'image' ? (
                      <img src={item.content} alt="Match" className="h-16 w-auto mx-auto object-contain" />
                    ) : (
                      <p className="text-center">{item.content}</p>
                    )}

                    {isItemMatched(item.id, 'right') && (
                      <div className="mt-2 text-xs text-center text-green-600">
                        Matched with {
                          leftItems.find(left => left.id === getMatchedPair(item.id, 'right'))?.content
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
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

export default MatchingExercise;
