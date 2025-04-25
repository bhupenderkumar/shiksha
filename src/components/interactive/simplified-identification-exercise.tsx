import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { IdentificationQuestion, IdentificationResponse } from '@/types/interactiveAssignment';

interface SimplifiedIdentificationExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: IdentificationQuestion;
  };
  readOnly?: boolean;
  initialResponse?: IdentificationResponse;
  onSave?: (response: IdentificationResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedIdentificationExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedIdentificationExerciseProps) {
  const [identifiedItems, setIdentifiedItems] = useState<{ id: string; identified: boolean }[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { imageUrl, itemsToIdentify } = question.questionData;
  
  // Initialize identified items from initial response if available
  useEffect(() => {
    if (initialResponse?.identifiedItems) {
      setIdentifiedItems(initialResponse.identifiedItems);
    } else {
      // Initialize with all items not identified
      setIdentifiedItems(itemsToIdentify.map(item => ({
        id: item.id,
        identified: false
      })));
    }
  }, [initialResponse, itemsToIdentify]);
  
  // Update image size when image loads
  useEffect(() => {
    const handleImageLoad = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    };
    
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener('load', handleImageLoad);
      }
    }
    
    return () => {
      if (image) {
        image.removeEventListener('load', handleImageLoad);
      }
    };
  }, []);
  
  // Handle clicking on an item
  const handleItemClick = (id: string) => {
    if (readOnly) return;
    
    setIdentifiedItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, identified: !item.identified } : item
      )
    );
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ identifiedItems });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setIdentifiedItems(itemsToIdentify.map(item => ({
      id: item.id,
      identified: false
    })));
  };
  
  // Calculate score
  const calculateScore = () => {
    if (identifiedItems.length === 0) return 0;
    
    const correctCount = identifiedItems.filter(item => item.identified).length;
    return Math.round((correctCount / itemsToIdentify.length) * 100);
  };
  
  // Calculate position for item markers
  const calculatePosition = (coordinates: { x: number; y: number }) => {
    if (imageSize.width === 0 || imageSize.height === 0) return { left: 0, top: 0 };
    
    // Convert from 0-1 range to pixels
    const left = coordinates.x * imageSize.width;
    const top = coordinates.y * imageSize.height;
    
    return { left, top };
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Identify the items in the image by clicking on them.
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </div>
      )}
      
      {/* Items to identify */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Items to Identify:</h4>
        <div className="flex flex-wrap gap-2">
          {itemsToIdentify.map(item => {
            const isIdentified = identifiedItems.find(i => i.id === item.id)?.identified;
            
            return (
              <div
                key={item.id}
                className={`
                  px-3 py-1 border rounded-full text-sm
                  ${isIdentified ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}
                `}
              >
                {item.name}
                {isIdentified && <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-500" />}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Image with clickable areas */}
      <div className="border rounded-md overflow-hidden relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Identification exercise"
          className="w-full"
        />
        
        {/* Clickable markers */}
        {itemsToIdentify.map(item => {
          const isIdentified = identifiedItems.find(i => i.id === item.id)?.identified;
          const position = calculatePosition(item.coordinates);
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                absolute rounded-full cursor-pointer transition-all
                ${isIdentified ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600'}
                ${readOnly ? 'cursor-default' : 'hover:scale-110'}
                ${showAnswers ? 'opacity-100' : 'opacity-70'}
              `}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${item.radius * 2}px`,
                height: `${item.radius * 2}px`,
                transform: 'translate(-50%, -50%)',
                border: '2px solid'
              }}
            >
              {(isIdentified || showAnswers) && (
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {isIdentified && <CheckCircle className="h-4 w-4" />}
                </div>
              )}
            </div>
          );
        })}
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
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedIdentificationExercise;
