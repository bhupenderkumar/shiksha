import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ArrowUp, ArrowDown, GripVertical, X, Eye, AlertCircle } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimplifiedOrderingExercise } from "../simplified-ordering-exercise";

interface OrderingQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
  imageUrl?: string;
}

// Sortable item component - defined outside the parent component to prevent recreation on every render
interface SortableItemProps {
  item: OrderingItem;
  index: number;
  hasError: boolean;
  errorMessage?: string;
  itemsLength: number;
  updateItemText: (index: number, text: string) => void;
  updateItemImage: (index: number, imageUrl: string) => void;
  removeItem: (index: number) => void;
  moveItemUp: (index: number) => void;
  moveItemDown: (index: number) => void;
}

// Use React.memo to prevent unnecessary re-renders
const SortableItem = React.memo(({
  item,
  index,
  hasError,
  errorMessage,
  itemsLength,
  updateItemText,
  updateItemImage,
  removeItem,
  moveItemUp,
  moveItemDown
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Create local handlers to ensure proper index is used
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateItemText(index, e.target.value);
  };

  const handleImageUpload = (url: string) => {
    updateItemImage(index, url);
  };

  const handleRemoveImage = () => {
    updateItemImage(index, "");
  };

  const handleRemoveItem = () => {
    removeItem(index);
  };

  const handleMoveUp = () => {
    moveItemUp(index);
  };

  const handleMoveDown = () => {
    moveItemDown(index);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 border ${hasError ? 'border-red-300' : 'border-gray-200'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {/* Drag handle - only this part should trigger dragging */}
          <div
            className="cursor-move"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                {/* Input field - explicitly prevent drag events from affecting this */}
                <Input
                  placeholder={`Item ${index + 1}`}
                  value={item.text}
                  onChange={handleTextChange}
                  className={hasError ? 'border-red-300' : ''}
                  // Prevent drag events from affecting input focus
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                />
                {hasError && errorMessage && (
                  <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveItem}
                disabled={itemsLength <= 2}
                // Prevent drag events from affecting button clicks
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-24">
                {item.imageUrl ? (
                  <div
                    className="relative w-20 h-20 border rounded"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <img
                      src={item.imageUrl}
                      alt={`Item ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                      onClick={handleRemoveImage}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                    <ImageUploader
                      onImageUploaded={handleImageUpload}
                      placeholder="Add Image"
                      className="w-20 h-20"
                    />
                  </div>
                )}
              </div>
              <div
                className="flex-1"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <FormLabel className="text-xs text-gray-500 mb-1 block">
                  Correct Position: {item.correctPosition + 1}
                </FormLabel>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMoveUp}
                    disabled={index === 0}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMoveDown}
                    disabled={index === itemsLength - 1}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function OrderingQuestionForm({
  value,
  onChange,
  error
}: OrderingQuestionFormProps) {
  const [items, setItems] = useState<OrderingItem[]>(
    value?.items || [
      { id: uuidv4(), text: "", correctPosition: 0, imageUrl: undefined },
      { id: uuidv4(), text: "", correctPosition: 1, imageUrl: undefined }
    ]
  );
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Validate items
  const validateItems = () => {
    const errors: {[key: string]: string} = {};

    items.forEach((item, index) => {
      if (!item.text.trim()) {
        errors[`item-${index}`] = "Item text is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update parent component when items change
  useEffect(() => {
    // Validate items
    validateItems();

    // Debounce the onChange call to prevent excessive updates
    const timer = setTimeout(() => {
      onChange({
        items
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [items, onChange]);

  // Add a new item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        text: "",
        correctPosition: items.length,
        imageUrl: undefined
      }
    ]);
  };

  // Remove an item
  const removeItem = (index: number) => {
    if (items.length <= 2) {
      return; // Maintain at least 2 items
    }

    const newItems = [...items];
    newItems.splice(index, 1);

    // Update correctPosition values to maintain sequence
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      correctPosition: idx
    }));

    setItems(updatedItems);
  };

  // Update item text
  const updateItemText = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    setItems(newItems);
  };

  // Update item image
  const updateItemImage = (index: number, imageUrl: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], imageUrl };
    setItems(newItems);
  };

  // Move item up in the correct order
  const moveItemUp = (index: number) => {
    if (index === 0) return;

    const newItems = [...items];
    const itemToMove = newItems[index];
    const itemAbove = newItems[index - 1];

    // Swap correctPosition values
    newItems[index] = { ...itemToMove, correctPosition: itemAbove.correctPosition };
    newItems[index - 1] = { ...itemAbove, correctPosition: itemToMove.correctPosition };

    setItems(newItems);
  };

  // Move item down in the correct order
  const moveItemDown = (index: number) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    const itemToMove = newItems[index];
    const itemBelow = newItems[index + 1];

    // Swap correctPosition values
    newItems[index] = { ...itemToMove, correctPosition: itemBelow.correctPosition };
    newItems[index + 1] = { ...itemBelow, correctPosition: itemToMove.correctPosition };

    setItems(newItems);
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Only activate when dragging from the handle, not the entire item
      activationConstraint: {
        distance: 8, // Minimum distance required before activating
        tolerance: 5, // Tolerance for movement before activation
        delay: 150, // Delay before activation to allow for clicking
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update correctPosition values to maintain sequence
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        correctPosition: idx
      }));

      setItems(updatedItems);
    }
  };

  // Memoized callback functions with proper dependencies
  const updateItemTextCallback = useCallback((index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    setItems(newItems);
  }, [items]);

  const updateItemImageCallback = useCallback((index: number, imageUrl: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], imageUrl };
    setItems(newItems);
  }, [items]);

  const removeItemCallback = useCallback((index: number) => {
    if (items.length <= 2) {
      return; // Maintain at least 2 items
    }

    const newItems = [...items];
    newItems.splice(index, 1);

    // Update correctPosition values to maintain sequence
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      correctPosition: idx
    }));

    setItems(updatedItems);
  }, [items]);

  const moveItemUpCallback = useCallback((index: number) => {
    if (index === 0) return;

    const newItems = [...items];
    const itemToMove = newItems[index];
    const itemAbove = newItems[index - 1];

    // Swap correctPosition values
    newItems[index] = { ...itemToMove, correctPosition: itemAbove.correctPosition };
    newItems[index - 1] = { ...itemAbove, correctPosition: itemToMove.correctPosition };

    setItems(newItems);
  }, [items]);

  const moveItemDownCallback = useCallback((index: number) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    const itemToMove = newItems[index];
    const itemBelow = newItems[index + 1];

    // Swap correctPosition values
    newItems[index] = { ...itemToMove, correctPosition: itemBelow.correctPosition };
    newItems[index + 1] = { ...itemBelow, correctPosition: itemToMove.correctPosition };

    setItems(newItems);
  }, [items]);

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="space-y-4">
      {hasValidationErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors before saving.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="edit" className="flex items-center gap-1">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <div>
            <FormLabel>Ordering Items</FormLabel>
            <p className="text-sm text-gray-500 mb-2">
              Add items for students to arrange in the correct order. Drag to reorder the correct sequence.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              // Prevent auto-scrolling which can cause issues
              autoScroll={{
                enabled: true,
                speed: 5,
                threshold: {
                  x: 0.1,
                  y: 0.1
                }
              }}
              // Prevent drag operations from starting on interactive elements
              modifiers={[]}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      index={index}
                      hasError={!!validationErrors[`item-${index}`]}
                      errorMessage={validationErrors[`item-${index}`]}
                      itemsLength={items.length}
                      updateItemText={updateItemTextCallback}
                      updateItemImage={updateItemImageCallback}
                      removeItem={removeItemCallback}
                      moveItemUp={moveItemUpCallback}
                      moveItemDown={moveItemDownCallback}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-2"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {items.some(item => !item.text.trim()) ? (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fill in all item texts to see an accurate preview.
                  </AlertDescription>
                </Alert>
              ) : (
                <SimplifiedOrderingExercise
                  question={{
                    id: "preview",
                    questionText: "Arrange the items in the correct order",
                    questionData: {
                      items: items.map(item => ({
                        ...item,
                        // For preview, we'll shuffle the items
                        correctPosition: item.correctPosition
                      }))
                    }
                  }}
                  showAnswers={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
