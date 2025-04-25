import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ColoringQuestion, ColoringResponse } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, Check } from 'lucide-react';
import { useKonvaCanvas } from '@/hooks/useKonvaCanvas';
import Konva from 'konva';

interface ColoringExerciseProps {
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

export function ColoringExerciseKonva({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: ColoringExerciseProps) {
  const [selectedColor, setSelectedColor] = useState('#FF0000'); // Default red
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [regions, setRegions] = useState<{ id: string; color: string }[]>([]);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [regionShapes, setRegionShapes] = useState<Map<string, Konva.Shape>>(new Map());
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);
  
  const { imageUrl, regions: regionData = [] } = question.questionData;
  
  // Define canvas dimensions based on the image
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  // Initialize Konva canvas
  const {
    containerRef,
    stage,
    layer,
    clear,
    getImage,
    addRect,
    addShape,
    createLayer,
    removeShape
  } = useKonvaCanvas({
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    backgroundColor: '#ffffff'
  });
  
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
  
  // Load image and initialize regions
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      setImageObj(img);
      
      // Set canvas dimensions based on image
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;
      
      // Scale down if image is too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      setCanvasDimensions({ width, height });
    };
    
    // Initialize regions from question data
    if (regionData.length > 0) {
      setRegions(regionData.map(region => ({
        id: region.id,
        color: region.expectedColor || '#FFFFFF'
      })));
    }
    
    // Load initial response if available
    if (initialResponse?.regions) {
      setRegions(initialResponse.regions);
    }
  }, [imageUrl, regionData, initialResponse]);
  
  // Draw image and regions when image is loaded or canvas dimensions change
  useEffect(() => {
    if (!stage || !layer || !imageObj) return;
    
    // Clear the layer
    layer.destroyChildren();
    
    // Add the image
    const konvaImage = new Konva.Image({
      image: imageObj,
      width: canvasDimensions.width,
      height: canvasDimensions.height,
      x: 0,
      y: 0
    });
    
    layer.add(konvaImage);
    layer.draw();
    
    // Create regions layer
    const regionsLayer = createLayer();
    
    // Draw regions if available
    if (regionData.length > 0) {
      const newRegionShapes = new Map<string, Konva.Shape>();
      
      regionData.forEach(region => {
        // Find the color for this region
        const regionColor = regions.find(r => r.id === region.id)?.color || '#FFFFFF';
        
        // Create a shape for the region
        // Note: In a real implementation, you would need to define the region shapes
        // based on coordinates or paths from your data
        // This is a simplified example using rectangles
        const shape = new Konva.Rect({
          x: Math.random() * (canvasDimensions.width - 100),
          y: Math.random() * (canvasDimensions.height - 100),
          width: 100,
          height: 100,
          fill: regionColor,
          opacity: 0.5,
          stroke: '#000000',
          strokeWidth: 2,
          name: region.id
        });
        
        regionsLayer.add(shape);
        newRegionShapes.set(region.id, shape);
        
        // Add click handler to the shape
        shape.on('click tap', () => {
          if (readOnly) return;
          
          // Fill the region with the selected color
          shape.fill(selectedColor);
          regionsLayer.draw();
          
          // Update regions state
          setRegions(prev => 
            prev.map(r => 
              r.id === region.id ? { ...r, color: selectedColor } : r
            )
          );
        });
        
        // Add hover effect
        shape.on('mouseover', () => {
          if (readOnly) return;
          document.body.style.cursor = 'pointer';
          shape.opacity(0.8);
          regionsLayer.draw();
        });
        
        shape.on('mouseout', () => {
          if (readOnly) return;
          document.body.style.cursor = 'default';
          shape.opacity(0.5);
          regionsLayer.draw();
        });
      });
      
      setRegionShapes(newRegionShapes);
    }
    
    regionsLayer.draw();
    
  }, [stage, layer, imageObj, canvasDimensions, regions, regionData, readOnly, selectedColor, createLayer]);
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setTool('brush');
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ regions });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    // Reset all regions to white
    setRegions(regionData.map(region => ({
      id: region.id,
      color: '#FFFFFF'
    })));
    
    // Update the shapes
    regionShapes.forEach((shape, id) => {
      shape.fill('#FFFFFF');
    });
    
    if (stage) {
      stage.draw();
    }
  };
  
  // Check if all regions are colored correctly
  const checkCorrectness = () => {
    if (!regionData || regionData.length === 0) return true;
    
    return regionData.every(region => {
      if (!region.expectedColor) return true;
      
      const coloredRegion = regions.find(r => r.id === region.id);
      return coloredRegion?.color.toLowerCase() === region.expectedColor.toLowerCase();
    });
  };
  
  const isCorrect = showAnswers && checkCorrectness();
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        {!readOnly && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Color Palette:</h4>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="relative border rounded-md overflow-hidden">
          <div
            ref={containerRef}
            className="w-full touch-none"
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          />
        </div>
        
        {showAnswers && (
          <div className="mt-4 p-3 rounded-md border flex items-center gap-2">
            {isCorrect ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">Correct! All regions are colored correctly.</span>
              </>
            ) : (
              <>
                <div className="h-5 w-5 text-red-500 flex items-center justify-center">✗</div>
                <span className="text-red-600 font-medium">Some regions are not colored correctly.</span>
              </>
            )}
          </div>
        )}
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

export default ColoringExerciseKonva;
