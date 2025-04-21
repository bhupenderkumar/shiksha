import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CategorizationQuestion, SortingResponse } from '@/types/interactiveAssignment';

interface SortingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CategorizationQuestion;
  };
  readOnly?: boolean;
  initialResponse?: SortingResponse;
  onSave?: (response: SortingResponse) => void;
  showAnswers?: boolean;
}

interface SortableItemProps {
  id: string;
  name: string;
  imageUrl?: string;
  correctCategoryId?: string;
  currentCategoryId?: string;
  showCorrect?: boolean;
}

const SortableItem = ({ id, name, imageUrl, correctCategoryId, currentCategoryId, showCorrect }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCorrect = showCorrect && correctCategoryId === currentCategoryId;
  const isIncorrect = showCorrect && correctCategoryId !== undefined && correctCategoryId !== currentCategoryId;

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
        {imageUrl && (
          <img src={imageUrl} alt={name} className="h-12 w-12 object-cover rounded-md mr-3" />
        )}
        <div className="flex-1">
          <p>{name}</p>
        </div>
        {showCorrect && isIncorrect && (
          <div className="ml-3 text-xs text-red-600">
            Incorrect category
          </div>
        )}
      </div>
    </div>
  );
};

export function SortingExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: SortingExerciseProps) {
  const [categories, setCategories] = useState<CategorizationQuestion['categories']>([]);
  const [items, setItems] = useState<CategorizationQuestion['items']>([]);
  const [sortedItems, setSortedItems] = useState<{ itemId: string; categoryId: string }[]>([]);
  const [unsortedItems, setUnsortedItems] = useState<string[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (question.questionData) {
      setCategories(question.questionData.categories);
      setItems(question.questionData.items);
      
      // Initialize all items as unsorted
      setUnsortedItems(question.questionData.items.map(item => item.id));
      setSortedItems([]);
      
      // If there's an initial response, apply it
      if (initialResponse?.sortedItems) {
        setSortedItems(initialResponse.sortedItems);
        setUnsortedItems(prev => 
          prev.filter(itemId => 
            !initialResponse.sortedItems.some(sorted => sorted.itemId === itemId)
          )
        );
      }
    }
  }, [question, initialResponse]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const itemId = active.id as string;
    const targetId = over.id as string;
    
    // Check if target is a category
    const isTargetCategory = categories.some(cat => cat.id === targetId);
    
    if (isTargetCategory) {
      // Item is being sorted into a category
      const categoryId = targetId;
      
      // Check if item is already in a category
      const existingSortedItem = sortedItems.find(item => item.itemId === itemId);
      
      if (existingSortedItem) {
        // Update the category
        setSortedItems(prev => 
          prev.map(item => 
            item.itemId === itemId ? { ...item, categoryId } : item
          )
        );
      } else {
        // Add to sorted items
        setSortedItems(prev => [...prev, { itemId, categoryId }]);
        
        // Remove from unsorted items
        setUnsortedItems(prev => prev.filter(id => id !== itemId));
      }
    } else if (targetId === 'unsorted') {
      // Item is being moved back to unsorted
      setSortedItems(prev => prev.filter(item => item.itemId !== itemId));
      
      // Add to unsorted items if not already there
      if (!unsortedItems.includes(itemId)) {
        setUnsortedItems(prev => [...prev, itemId]);
      }
    }
  };

  const handleSave = () => {
    // Check if all items are sorted
    if (unsortedItems.length > 0) {
      toast.error('Please sort all items into categories');
      return;
    }
    
    if (onSave) {
      onSave({ sortedItems });
    }
  };

  const handleReset = () => {
    // Move all items back to unsorted
    setUnsortedItems(items.map(item => item.id));
    setSortedItems([]);
  };

  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const getItemsInCategory = (categoryId: string) => {
    return sortedItems
      .filter(item => item.categoryId === categoryId)
      .map(item => getItemById(item.itemId))
      .filter(Boolean);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <p className="mb-4 text-gray-600">{question.questionData.categorizationCriteria}</p>
        
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unsorted items */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Items to Sort</h4>
              
              <SortableContext items={unsortedItems}>
                <div id="unsorted" className="min-h-[100px]">
                  {unsortedItems.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">All items sorted</p>
                  ) : (
                    unsortedItems.map(itemId => {
                      const item = getItemById(itemId);
                      if (!item) return null;
                      
                      return (
                        <SortableItem
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          imageUrl={item.imageUrl}
                          correctCategoryId={showAnswers ? item.correctCategoryId : undefined}
                          showCorrect={false}
                        />
                      );
                    })
                  )}
                </div>
              </SortableContext>
            </div>
            
            {/* Categories */}
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    {category.imageUrl && (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="h-8 w-8 object-cover rounded-md mr-2"
                      />
                    )}
                    <h4 className="font-medium">{category.name}</h4>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                  )}
                  
                  <SortableContext items={getItemsInCategory(category.id).map(item => item?.id || '')}>
                    <div id={category.id} className="min-h-[50px]">
                      {getItemsInCategory(category.id).map(item => {
                        if (!item) return null;
                        
                        return (
                          <SortableItem
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            imageUrl={item.imageUrl}
                            correctCategoryId={showAnswers ? item.correctCategoryId : undefined}
                            currentCategoryId={category.id}
                            showCorrect={showAnswers}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
          </div>
        </DndContext>
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

export default SortingExercise;
