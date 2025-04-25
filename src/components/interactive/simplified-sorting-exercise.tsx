import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { SortingQuestion, SortingResponse } from '@/types/interactiveAssignment';

interface SimplifiedSortingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: SortingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: SortingResponse;
  onSave?: (response: SortingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedSortingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedSortingExerciseProps) {
  const [unsortedItems, setUnsortedItems] = useState<string[]>([]);
  const [sortedItems, setSortedItems] = useState<{ itemId: string; categoryId: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const { categories = [], items = [], sortingCriteria } = question.questionData;
  
  // Initialize items from initial response if available
  useEffect(() => {
    if (initialResponse?.sortedItems) {
      setSortedItems(initialResponse.sortedItems);
      
      // Set unsorted items (items not in the sorted list)
      const sortedItemIds = initialResponse.sortedItems.map(item => item.itemId);
      setUnsortedItems(items.map(item => item.id).filter(id => !sortedItemIds.includes(id)));
    } else {
      // Start with all items unsorted
      setUnsortedItems(items.map(item => item.id));
      setSortedItems([]);
    }
  }, [initialResponse, items]);
  
  // Handle item selection
  const handleItemClick = (itemId: string) => {
    if (readOnly) return;
    setSelectedItem(itemId === selectedItem ? null : itemId);
  };
  
  // Handle category selection (to sort an item into)
  const handleCategoryClick = (categoryId: string) => {
    if (readOnly || !selectedItem) return;
    
    // Add item to the category
    setSortedItems([...sortedItems, { itemId: selectedItem, categoryId }]);
    
    // Remove from unsorted items
    setUnsortedItems(unsortedItems.filter(id => id !== selectedItem));
    
    // Clear selection
    setSelectedItem(null);
  };
  
  // Handle removing an item from a category (back to unsorted)
  const handleRemoveFromCategory = (itemId: string) => {
    if (readOnly) return;
    
    // Remove from sorted items
    setSortedItems(sortedItems.filter(item => item.itemId !== itemId));
    
    // Add back to unsorted items
    setUnsortedItems([...unsortedItems, itemId]);
  };
  
  // Handle save
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
  
  // Handle reset
  const handleReset = () => {
    // Move all items back to unsorted
    setUnsortedItems(items.map(item => item.id));
    setSortedItems([]);
    setSelectedItem(null);
  };
  
  // Get item by ID
  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };
  
  // Get category by ID
  const getCategoryById = (categoryId: string) => {
    return categories.find(category => category.id === categoryId);
  };
  
  // Check if an item is correctly sorted
  const isItemCorrectlySorted = (itemId: string, categoryId: string) => {
    const item = getItemById(itemId);
    return item?.correctCategoryId === categoryId;
  };
  
  // Calculate score
  const calculateScore = () => {
    if (sortedItems.length === 0) return 0;
    
    const correctCount = sortedItems.filter(item => 
      isItemCorrectlySorted(item.itemId, item.categoryId)
    ).length;
    
    return Math.round((correctCount / items.length) * 100);
  };
  
  // Render item content
  const renderItemContent = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return null;
    
    return (
      <div className="flex flex-col items-center">
        {item.imageUrl && (
          <div className="mb-2">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="max-h-16 object-contain"
            />
          </div>
        )}
        <p className="text-center">{item.name}</p>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        {sortingCriteria || 'Sort the items into the correct categories.'}
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unsorted items */}
        <div>
          <h4 className="text-md font-medium mb-2">Items to Sort</h4>
          <div className="p-4 bg-gray-50 border rounded-md min-h-[200px]">
            {unsortedItems.length === 0 ? (
              <p className="text-gray-400 text-center">All items sorted</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {unsortedItems.map(itemId => (
                  <div
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all
                      ${selectedItem === itemId ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}
                      ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                    `}
                  >
                    {renderItemContent(itemId)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Categories */}
        <div>
          <h4 className="text-md font-medium mb-2">Categories</h4>
          <div className="space-y-4">
            {categories.map(category => {
              // Get items in this category
              const categoryItems = sortedItems
                .filter(item => item.categoryId === category.id)
                .map(item => item.itemId);
              
              return (
                <div key={category.id} className="border rounded-md overflow-hidden">
                  {/* Category header */}
                  <div
                    className={`p-3 ${selectedItem ? 'bg-blue-50 cursor-pointer' : 'bg-gray-50'}`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center">
                      {category.imageUrl && (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name} 
                          className="w-8 h-8 object-contain mr-2"
                        />
                      )}
                      <h5 className="font-medium">{category.name}</h5>
                    </div>
                  </div>
                  
                  {/* Category items */}
                  <div className="p-3 bg-white">
                    {categoryItems.length === 0 ? (
                      <p className="text-gray-400 text-center py-2">No items</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {categoryItems.map(itemId => {
                          const isCorrect = showAnswers && isItemCorrectlySorted(itemId, category.id);
                          const isIncorrect = showAnswers && !isItemCorrectlySorted(itemId, category.id);
                          
                          return (
                            <div
                              key={itemId}
                              className={`
                                p-2 border rounded-md relative
                                ${isCorrect ? 'bg-green-50 border-green-300' : ''}
                                ${isIncorrect ? 'bg-red-50 border-red-300' : ''}
                              `}
                            >
                              {renderItemContent(itemId)}
                              
                              {!readOnly && (
                                <button
                                  onClick={() => handleRemoveFromCategory(itemId)}
                                  className="absolute top-1 right-1 text-gray-500 hover:text-red-500"
                                >
                                  &times;
                                </button>
                              )}
                              
                              {showAnswers && (
                                <div className="absolute top-1 right-1">
                                  {isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                  {isIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            disabled={unsortedItems.length > 0}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedSortingExercise;
