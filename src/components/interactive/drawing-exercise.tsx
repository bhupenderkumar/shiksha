import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, Upload, Check, Play, CheckCircle } from 'lucide-react';
import { useKonvaCanvas } from '@/hooks/useKonvaCanvas';
import Konva from 'konva';
import { Progress } from '@/components/ui/progress';

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
  const [hasDrawn, setHasDrawn] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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

  // Calculate completion percentage based on canvas coverage
  const updateCompletionPercentage = useCallback(() => {
    if (!layer) return;

    // Get the canvas data
    const canvas = layer.getCanvas()._canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Count non-transparent pixels (pixels that have been drawn on)
    let nonTransparentPixels = 0;
    let totalPixels = data.length / 4; // RGBA values (4 values per pixel)

    for (let i = 3; i < data.length; i += 4) {
      // Check alpha channel (every 4th value)
      if (data[i] > 0) {
        nonTransparentPixels++;
      }
    }

    // Calculate percentage (exclude background pixels)
    let percentage = 0;
    if (backgroundImage) {
      // If there's a background, we need a more sophisticated calculation
      // For simplicity, we'll use a threshold of drawn pixels
      const threshold = totalPixels * 0.1; // 10% of canvas should be drawn on
      percentage = Math.min(100, Math.round((nonTransparentPixels / threshold) * 100));
    } else {
      // Without background, simple percentage of canvas covered
      percentage = Math.min(100, Math.round((nonTransparentPixels / totalPixels) * 100));
    }

    setCompletionPercentage(percentage);

    // Check if exercise is completed (over 80% completion)
    if (percentage >= 80) {
      setIsCompleted(true);
    }
  }, [layer, backgroundImage]);

  useEffect(() => {
    // Load background image if provided
    if (backgroundImageUrl && layer) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Allow loading from different domains
      img.src = backgroundImageUrl;
      img.onload = () => {
        setBackgroundImage(img);
        addImage(img, 0, 0, canvasWidth, canvasHeight);

        // If there's also an initial response, load it on top of the background
        if (initialResponse?.drawingData) {
          const responseImg = new Image();
          responseImg.crossOrigin = "anonymous";
          responseImg.src = initialResponse.drawingData;
          responseImg.onload = () => {
            // We don't want to clear here as it would remove the background
            // Instead, we add the response image on top
            addImage(responseImg, 0, 0, canvasWidth, canvasHeight);

            // Set completion percentage from the response if available
            if (initialResponse.completionPercentage) {
              setCompletionPercentage(initialResponse.completionPercentage);
              if (initialResponse.completionPercentage >= 80) {
                setIsCompleted(true);
              }
            }
          };
        }
      };

      // Handle image loading error
      img.onerror = () => {
        console.error('Failed to load background image:', backgroundImageUrl);
        toast.error('Failed to load background image');
      };
    }
    // If there's no background but there is an initial response
    else if (initialResponse?.drawingData && layer) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = initialResponse.drawingData;
      img.onload = () => {
        // Clear any existing content first
        clear();

        // Add the image from the response
        addImage(img, 0, 0, canvasWidth, canvasHeight);

        // Set completion percentage from the response if available
        if (initialResponse.completionPercentage) {
          setCompletionPercentage(initialResponse.completionPercentage);
          if (initialResponse.completionPercentage >= 80) {
            setIsCompleted(true);
          }
        }
      };

      // Handle image loading error
      img.onerror = () => {
        console.error('Failed to load response image');
        toast.error('Failed to load saved drawing');
      };
    }
  }, [backgroundImageUrl, initialResponse, layer, addImage, clear, canvasWidth, canvasHeight]);

  // Periodically update completion percentage
  useEffect(() => {
    if (readOnly || !hasDrawn) return;

    // Update completion percentage every 2 seconds while drawing
    const intervalId = setInterval(() => {
      if (hasDrawn) {
        updateCompletionPercentage();
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [hasDrawn, readOnly, updateCompletionPercentage]);

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
      setHasDrawn(true);
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

      // Update completion percentage when user stops drawing
      setTimeout(() => {
        updateCompletionPercentage();
      }, 100); // Small delay to ensure the canvas has updated
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
  }, [stage, layer, isDrawing, currentLine, readOnly, brushSize, color, tool, addLine, updateCompletionPercentage]);

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

  // Handle play functionality
  const handlePlay = () => {
    setIsPlaying(true);
    setHasDrawn(true);

    // Use a ref to track the current completion percentage in the interval
    let currentCompletion = completionPercentage;

    // Play animation at intervals
    const animationInterval = setInterval(() => {
      // Increment completion percentage gradually
      currentCompletion = Math.min(100, currentCompletion + 5);

      setCompletionPercentage(currentCompletion);

      if (currentCompletion >= 80) {
        setIsCompleted(true);
      }

      if (currentCompletion >= 100) {
        clearInterval(animationInterval);
        setIsPlaying(false);
      }
    }, 200);

    // Clean up interval after 5 seconds (safety)
    setTimeout(() => {
      clearInterval(animationInterval);
      setIsPlaying(false);
      setIsCompleted(true);
      setCompletionPercentage(100);
    }, 5000);
  };

  const handleSave = () => {
    // Update completion percentage one final time
    updateCompletionPercentage();

    // Get drawing data as base64 string
    const drawingData = getImage();

    if (onSave) {
      onSave({
        drawingData,
        completionPercentage
      });
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

      <div className="mt-4">
        <div className="flex items-center mb-2">
          <div className="text-sm font-medium mr-2">Completion: {completionPercentage}%</div>
          <Progress value={completionPercentage} className="flex-1" />
          {isCompleted && (
            <div className="ml-2 text-green-500 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="mt-2 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePlay}
              disabled={isPlaying || isCompleted}
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              {isPlaying ? 'Playing...' : 'Auto-Complete'}
            </Button>

            <Button onClick={handleSave} disabled={!hasDrawn && !isCompleted}>
              <Check className="h-4 w-4 mr-1" />
              Save Drawing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingExercise;
