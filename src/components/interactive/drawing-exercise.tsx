import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, Upload } from 'lucide-react';
import { useKonvaCanvas } from '@/hooks/useKonvaCanvas';
import Konva from 'konva';

interface DrawingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: DrawingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: DrawingResponse;
  onSave?: (response: DrawingResponse) => void;
}

export function DrawingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave
}: DrawingExerciseProps) {
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [currentLine, setCurrentLine] = useState<Konva.Line | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const { canvasWidth = 800, canvasHeight = 600, backgroundImageUrl, instructions } = question.questionData;

  // Initialize Konva canvas
  const {
    containerRef,
    stage,
    layer,
    clear,
    getImage,
    addLine,
    addImage
  } = useKonvaCanvas({
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: '#ffffff'
  });

  useEffect(() => {
    // Load background image if provided
    if (backgroundImageUrl && layer) {
      const img = new Image();
      img.src = backgroundImageUrl;
      img.onload = () => {
        setBackgroundImage(img);
        addImage(img, 0, 0, canvasWidth, canvasHeight);
      };
    }

    // Load initial response if available
    if (initialResponse?.drawingData && layer) {
      const img = new Image();
      img.src = initialResponse.drawingData;
      img.onload = () => {
        if (layer) {
          // Clear any existing content first
          clear();

          // Add the image from the response
          addImage(img, 0, 0, canvasWidth, canvasHeight);
        }
      };
    }
  }, [backgroundImageUrl, initialResponse, layer, addImage, clear, canvasWidth, canvasHeight]);

  // Set up event handlers for the Konva stage
  useEffect(() => {
    if (!stage || readOnly) return;

    const handleMouseDown = () => {
      if (readOnly) return;

      setIsDrawing(true);
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Create a new line
      const newLine = addLine(
        [pos.x, pos.y],
        brushSize,
        tool === 'brush' ? color : '#FFFFFF'
      );

      setCurrentLine(newLine);
    };

    const handleMouseMove = () => {
      if (!isDrawing || readOnly || !currentLine) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Append point to the current line
      const newPoints = [...currentLine.points(), pos.x, pos.y];
      currentLine.points(newPoints);
      layer?.batchDraw();
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      setCurrentLine(null);
    };

    // Note: Konva handles touch events automatically

    // Add event listeners
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend mouseout', handleMouseUp);

    // Clean up
    return () => {
      stage.off('mousedown touchstart');
      stage.off('mousemove touchmove');
      stage.off('mouseup touchend mouseout');
    };
  }, [stage, layer, isDrawing, currentLine, readOnly, brushSize, color, tool, addLine]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    setTool('brush');
  };

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  const handleClear = () => {
    clear();

    // Re-add background image if it exists
    if (backgroundImage && layer) {
      addImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    }
  };

  const handleSave = () => {
    // Get drawing data as base64 string
    const drawingData = getImage();

    if (onSave) {
      onSave({ drawingData });
    }

    toast.success('Drawing saved successfully');
  };

  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a');
    link.download = `drawing-${new Date().getTime()}.png`;
    link.href = getImage();
    link.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Clear canvas first
        clear();

        // Draw uploaded image
        addImage(img, 0, 0, canvasWidth, canvasHeight);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{question.questionText}</h3>

      {instructions && (
        <p className="mb-4 text-gray-600">{instructions}</p>
      )}

      <div className="border rounded-md p-4 bg-white">
        {!readOnly && (
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'brush' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('brush')}
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Brush
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
              >
                <Eraser className="h-4 w-4 mr-1" />
                Eraser
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="color-picker" className="text-sm">Color:</label>
              <input
                id="color-picker"
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-8 h-8 p-0 border-0"
              />
            </div>

            <div className="flex items-center space-x-2 flex-1 max-w-xs">
              <label className="text-sm whitespace-nowrap">Size: {brushSize}px</label>
              <Slider
                value={[brushSize]}
                min={1}
                max={50}
                step={1}
                onValueChange={handleBrushSizeChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>
        )}

        <div className="relative border rounded overflow-hidden">
          <div
            ref={containerRef}
            className="w-full touch-none"
            style={{ cursor: readOnly ? 'default' : 'crosshair' }}
          />
        </div>
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            Save Drawing
          </Button>
        </div>
      )}
    </div>
  );
}

export default DrawingExercise;
