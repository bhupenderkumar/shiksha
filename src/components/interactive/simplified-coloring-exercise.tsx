import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { Paintbrush, Eraser, RotateCcw, Check } from 'lucide-react';

interface ColorRegion {
  id: string;
  name?: string;
  expectedColor?: string;
}

interface ColoringQuestion {
  imageUrl: string;
  regions: ColorRegion[];
}

interface ColoringResponse {
  regions: { id: string; color: string }[];
  isCorrect?: boolean;
}

interface SimplifiedColoringExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: ColoringQuestion;
  };
  readOnly?: boolean;
  initialResponse?: ColoringResponse;
  onSave?: (response: ColoringResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedColoringExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedColoringExerciseProps) {
  const [selectedColor, setSelectedColor] = useState('#FF0000'); // Default red
  const [coloredRegions, setColoredRegions] = useState<{ id: string; color: string }[]>([]);
  
  const { imageUrl, regions = [] } = question.questionData;
  
  // Available colors for coloring
  const colorPalette = [
    '#FF0000', // Red
    '#FF9900', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF', // Blue
    '#9900FF', // Purple
    '#FF00FF', // Pink
    '#663300', // Brown
    '#000000', // Black
    '#FFFFFF', // White
  ];
  
  // Initialize colored regions from initial response
  useEffect(() => {
    if (initialResponse?.regions) {
      setColoredRegions(initialResponse.regions);
    } else {
      setColoredRegions([]);
    }
  }, [initialResponse]);
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (readOnly) return;
    setSelectedColor(color);
  };
  
  // Handle region coloring
  const handleRegionColor = (regionId: string) => {
    if (readOnly) return;
    
    // Update or add the region color
    const updatedRegions = [...coloredRegions];
    const existingIndex = updatedRegions.findIndex(r => r.id === regionId);
    
    if (existingIndex >= 0) {
      updatedRegions[existingIndex] = { ...updatedRegions[existingIndex], color: selectedColor };
    } else {
      updatedRegions.push({ id: regionId, color: selectedColor });
    }
    
    setColoredRegions(updatedRegions);
    
    // Save the response
    if (onSave) {
      onSave({ regions: updatedRegions });
    }
  };
  
  // Reset the coloring
  const handleReset = () => {
    setColoredRegions([]);
    
    if (onSave) {
      onSave({ regions: [] });
    }
  };
  
  // Get color for a region
  const getRegionColor = (regionId: string) => {
    const region = coloredRegions.find(r => r.id === regionId);
    return region?.color || '#FFFFFF'; // Default to white
  };
  
  // Check if all regions are colored correctly
  const checkCorrectness = () => {
    if (!regions || regions.length === 0) return true;
    
    return regions.every(region => {
      if (!region.expectedColor) return true;
      
      const coloredRegion = coloredRegions.find(r => r.id === region.id);
      return coloredRegion?.color.toLowerCase() === region.expectedColor.toLowerCase();
    });
  };
  
  const isCorrect = showAnswers && checkCorrectness();
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Select a color from the palette and click on a region to color it.
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && (
        <Alert variant={isCorrect ? "success" : "info"} className="mb-4">
          <p className="font-medium">
            {isCorrect ? 'Correct! All regions are colored correctly.' : 'Some regions are not colored correctly.'}
          </p>
        </Alert>
      )}
      
      {/* Color palette */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Color Palette</h4>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map(color => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`
                w-8 h-8 rounded-full border-2
                ${selectedColor === color ? 'border-black' : 'border-gray-300'}
                ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{ backgroundColor: color }}
              disabled={readOnly}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
      </div>
      
      {/* Coloring area */}
      <div className="mb-4 border rounded-md p-4">
        <div className="relative">
          {/* Display the image */}
          <img 
            src={imageUrl} 
            alt="Coloring image" 
            className="max-w-full h-auto"
          />
          
          {/* Simplified coloring regions */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {regions.map(region => (
              <div
                key={region.id}
                onClick={() => handleRegionColor(region.id)}
                className={`
                  p-3 border rounded-md cursor-pointer transition-all
                  ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                `}
                style={{ backgroundColor: getRegionColor(region.id) }}
              >
                <p className="text-center" style={{ 
                  color: getRegionColor(region.id) === '#FFFFFF' ? '#000000' : 
                         (getRegionColor(region.id) === '#000000' ? '#FFFFFF' : '#000000') 
                }}>
                  {region.name || `Region ${region.id}`}
                </p>
              </div>
            ))}
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
            disabled={coloredRegions.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedColoringExercise;
