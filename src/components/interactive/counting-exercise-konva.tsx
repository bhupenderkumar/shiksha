import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { CountingQuestion } from '@/types/interactiveAssignment';
import { Plus, Minus, Check, X } from 'lucide-react';
import { useKonvaCanvas } from '@/hooks/useKonvaCanvas';
import Konva from 'konva';

interface CountingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CountingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

export function CountingExerciseKonva({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: CountingExerciseProps) {
  const [count, setCount] = useState<number>(0);
  const [markers, setMarkers] = useState<{ x: number; y: number }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const { 
    imageUrl, 
    itemsToCount, 
    correctCount, 
    minCount, 
    maxCount, 
    showNumbers = true,
    canvasWidth = 800,
    canvasHeight = 600
  } = question.questionData;
  
  // Initialize Konva canvas
  const {
    containerRef,
    stage,
    layer,
    clear,
    getImage,
    addCircle,
    addText,
    addImage
  } = useKonvaCanvas({
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: '#ffffff'
  });
  
  // Initialize count and markers from initial response if available
  useEffect(() => {
    if (initialResponse?.count !== undefined) {
      setCount(initialResponse.count);
    }
    
    if (initialResponse?.markers) {
      setMarkers(initialResponse.markers);
    }
  }, [initialResponse]);
  
  // Load background image
  useEffect(() => {
    if (!imageUrl || !layer) return;
    
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      setBackgroundImage(image);
      setImageLoaded(true);
      
      // Calculate aspect ratio to fit the image properly
      const aspectRatio = image.width / image.height;
      let imgWidth = canvasWidth;
      let imgHeight = canvasWidth / aspectRatio;
      
      if (imgHeight > canvasHeight) {
        imgHeight = canvasHeight;
        imgWidth = canvasHeight * aspectRatio;
      }
      
      // Add image to layer
      const konvaImage = new Konva.Image({
        x: (canvasWidth - imgWidth) / 2,
        y: (canvasHeight - imgHeight) / 2,
        image: image,
        width: imgWidth,
        height: imgHeight,
      });
      
      layer.add(konvaImage);
      
      // Make sure the image is at the bottom
      konvaImage.moveToBottom();
      layer.draw();
    };
  }, [imageUrl, layer, canvasWidth, canvasHeight]);
  
  // Render markers when they change
  useEffect(() => {
    if (!layer || !backgroundImage || !imageLoaded) return;
    
    // Clear existing markers
    layer.find('.marker').forEach(node => node.destroy());
    
    // Add new markers
    markers.forEach((marker, index) => {
      // Calculate actual position based on image dimensions
      const aspectRatio = backgroundImage.width / backgroundImage.height;
      let imgWidth = canvasWidth;
      let imgHeight = canvasWidth / aspectRatio;
      
      if (imgHeight > canvasHeight) {
        imgHeight = canvasHeight;
        imgWidth = canvasHeight * aspectRatio;
      }
      
      const imgX = (canvasWidth - imgWidth) / 2;
      const imgY = (canvasHeight - imgHeight) / 2;
      
      const x = imgX + marker.x * imgWidth;
      const y = imgY + marker.y * imgHeight;
      
      // Add circle marker
      const circle = new Konva.Circle({
        x,
        y,
        radius: 16,
        fill: 'rgba(59, 130, 246, 0.7)',
        name: 'marker',
      });
      
      layer.add(circle);
      
      // Add number text if showNumbers is true
      if (showNumbers) {
        const text = new Konva.Text({
          x: x - 5,
          y: y - 6,
          text: (index + 1).toString(),
          fontSize: 12,
          fontFamily: 'Arial',
          fill: 'white',
          name: 'marker',
        });
        
        layer.add(text);
      }
    });
    
    layer.draw();
  }, [markers, layer, backgroundImage, imageLoaded, canvasWidth, canvasHeight, showNumbers]);
  
  // Handle stage click to add markers
  useEffect(() => {
    if (!stage || !layer || !backgroundImage || readOnly) return;
    
    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (count >= maxCount) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      // Calculate relative position within the image
      const aspectRatio = backgroundImage.width / backgroundImage.height;
      let imgWidth = canvasWidth;
      let imgHeight = canvasWidth / aspectRatio;
      
      if (imgHeight > canvasHeight) {
        imgHeight = canvasHeight;
        imgWidth = canvasHeight * aspectRatio;
      }
      
      const imgX = (canvasWidth - imgWidth) / 2;
      const imgY = (canvasHeight - imgHeight) / 2;
      
      // Check if click is within the image bounds
      if (
        pos.x < imgX || 
        pos.x > imgX + imgWidth || 
        pos.y < imgY || 
        pos.y > imgY + imgHeight
      ) {
        return;
      }
      
      // Calculate relative position (0-1)
      const relativeX = (pos.x - imgX) / imgWidth;
      const relativeY = (pos.y - imgY) / imgHeight;
      
      // Add marker and increment count
      setMarkers(prev => [...prev, { x: relativeX, y: relativeY }]);
      setCount(prev => prev + 1);
    };
    
    stage.on('click tap', handleClick);
    
    return () => {
      stage.off('click tap');
    };
  }, [stage, layer, backgroundImage, count, maxCount, readOnly, canvasWidth, canvasHeight]);
  
  const handleIncrement = () => {
    if (count < maxCount) {
      setCount(prev => prev + 1);
    }
  };
  
  const handleDecrement = () => {
    if (count > minCount) {
      setCount(prev => prev - 1);
      
      // Remove the last marker if there are any
      if (markers.length > 0) {
        setMarkers(prev => prev.slice(0, -1));
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (isNaN(value)) {
      setCount(0);
    } else {
      const clampedValue = Math.min(Math.max(value, minCount), maxCount);
      setCount(clampedValue);
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave({
        count,
        markers,
        isCorrect: count === correctCount
      });
    }
  };
  
  const handleReset = () => {
    setCount(0);
    setMarkers([]);
  };
  
  const isCorrect = count === correctCount;
  const isIncorrect = count !== correctCount;
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <p className="mb-4 text-gray-600">
          Count the number of {itemsToCount} in the image below:
        </p>
        
        <div className="relative border rounded-md overflow-hidden mb-4">
          <div
            ref={containerRef}
            className="w-full touch-none"
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={readOnly || count <= minCount}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Input
              type="number"
              value={count}
              onChange={handleInputChange}
              min={minCount}
              max={maxCount}
              disabled={readOnly}
              className={`w-20 text-center text-xl font-bold ${
                showAnswers && isCorrect ? 'border-green-500 bg-green-50' : ''
              } ${
                showAnswers && isIncorrect ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            
            {showAnswers && (
              <div className="absolute right-0 top-0 transform translate-x-full ml-2 flex items-center">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      Correct: {correctCount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={readOnly || count >= maxCount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default CountingExerciseKonva;
