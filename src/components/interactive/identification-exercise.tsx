import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { IdentificationQuestion } from '@/types/interactiveAssignment';

interface IdentificationExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: IdentificationQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

interface IdentifiedItem {
  id: string;
  name: string;
  isIdentified: boolean;
}

export function IdentificationExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: IdentificationExerciseProps) {
  const [items, setItems] = useState<IdentifiedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize items from question data
  useEffect(() => {
    if (question.questionData) {
      const initialItems = question.questionData.itemsToIdentify.map(item => ({
        id: item.id,
        name: item.name,
        isIdentified: false
      }));
      
      setItems(initialItems);
      
      // Apply initial response if available
      if (initialResponse?.identifiedItems) {
        const identifiedItemIds = initialResponse.identifiedItems.map((item: any) => item.id);
        
        setItems(initialItems.map(item => ({
          ...item,
          isIdentified: identifiedItemIds.includes(item.id)
        })));
      }
    }
  }, [question, initialResponse]);
  
  // Handle image loading
  useEffect(() => {
    const img = new Image();
    img.src = question.questionData.imageUrl;
    img.onload = () => {
      setImageLoaded(true);
      if (imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const aspectRatio = img.height / img.width;
        
        setImageSize({
          width: containerWidth,
          height: containerWidth * aspectRatio
        });
      }
    };
  }, [question]);
  
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !selectedItem || !imageRef.current || !containerRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Find the item in the question data
    const itemData = question.questionData.itemsToIdentify.find(item => item.id === selectedItem);
    
    if (!itemData) return;
    
    // Check if click is within the correct area
    const itemX = itemData.coordinates.x;
    const itemY = itemData.coordinates.y;
    const radius = itemData.radius;
    
    const distance = Math.sqrt(Math.pow(x - itemX, 2) + Math.pow(y - itemY, 2));
    
    if (distance <= radius) {
      // Correct identification
      setItems(prev => 
        prev.map(item => 
          item.id === selectedItem ? { ...item, isIdentified: true } : item
        )
      );
      
      toast.success(`Correctly identified: ${itemData.name}`);
      setSelectedItem(null);
    } else {
      // Incorrect identification
      toast.error('Try again! Click closer to the item.');
    }
  };
  
  const handleItemSelect = (itemId: string) => {
    if (readOnly) return;
    
    const item = items.find(i => i.id === itemId);
    
    if (item?.isIdentified) {
      toast.info(`${item.name} is already identified`);
      return;
    }
    
    setSelectedItem(itemId === selectedItem ? null : itemId);
  };
  
  const handleSave = () => {
    const unidentifiedItems = items.filter(item => !item.isIdentified);
    
    if (unidentifiedItems.length > 0 && !showAnswers) {
      toast.error(`Please identify all items before saving`);
      return;
    }
    
    if (onSave) {
      onSave({
        identifiedItems: items
          .filter(item => item.isIdentified)
          .map(item => ({ id: item.id }))
      });
    }
  };
  
  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, isIdentified: false })));
    setSelectedItem(null);
  };
  
  const handleShowAnswers = () => {
    // Mark all items as identified
    setItems(prev => prev.map(item => ({ ...item, isIdentified: true })));
    setSelectedItem(null);
  };
  
  // Render hotspots for identified items or all items in showAnswers mode
  const renderHotspots = () => {
    if (!imageLoaded || !imageRef.current) return null;
    
    const imageRect = imageRef.current.getBoundingClientRect();
    
    return question.questionData.itemsToIdentify.map(item => {
      const isIdentified = items.find(i => i.id === item.id)?.isIdentified;
      
      // Only show hotspots for identified items or all items in showAnswers mode
      if (!isIdentified && !showAnswers) return null;
      
      const x = item.coordinates.x * imageRect.width;
      const y = item.coordinates.y * imageRect.height;
      const radius = item.radius * Math.min(imageRect.width, imageRect.height);
      
      return (
        <div
          key={item.id}
          className="absolute rounded-full border-2 border-green-500 bg-green-200 bg-opacity-50 flex items-center justify-center"
          style={{
            left: `${x - radius}px`,
            top: `${y - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="text-xs font-bold text-green-800">{item.name}</span>
        </div>
      );
    });
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <div className="mb-4">
          <p className="text-gray-600">Click on an item from the list, then find and click on it in the image:</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {items.map(item => (
              <Button
                key={item.id}
                variant={item.isIdentified ? "default" : (selectedItem === item.id ? "secondary" : "outline")}
                size="sm"
                onClick={() => handleItemSelect(item.id)}
                disabled={readOnly || item.isIdentified}
                className={`
                  ${item.isIdentified ? 'bg-green-500 hover:bg-green-600' : ''}
                  ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="relative border rounded-md overflow-hidden"
        >
          <div 
            className="relative cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              ref={imageRef}
              src={question.questionData.imageUrl}
              alt={question.questionText}
              className="w-full h-auto"
              style={{
                width: imageSize.width > 0 ? `${imageSize.width}px` : '100%',
                height: imageSize.height > 0 ? `${imageSize.height}px` : 'auto'
              }}
            />
            
            {/* Render hotspots */}
            {renderHotspots()}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm">
            Items identified: <span className="font-medium">{items.filter(i => i.isIdentified).length}</span> of <span className="font-medium">{items.length}</span>
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            {showAnswers && (
              <Button variant="outline" onClick={handleShowAnswers}>
                Show Answers
              </Button>
            )}
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default IdentificationExercise;
