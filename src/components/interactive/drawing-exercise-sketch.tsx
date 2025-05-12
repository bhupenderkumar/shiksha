import React, { useState, useRef, useEffect } from 'react';
// Import the library dynamically to avoid SSR issues
// The actual import will happen at runtime
// import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, CheckCircle, Play, Check } from 'lucide-react';

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

export function DrawingExerciseSketch({
  question,
  readOnly = false,
  initialResponse,
  onSave
}: DrawingExerciseProps) {
  const [completionPercentage, setCompletionPercentage] = useState(initialResponse?.completionPercentage || 0);
  const [isCompleted, setIsCompleted] = useState(initialResponse?.completionPercentage ? initialResponse.completionPercentage >= 80 : false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [ReactSketchCanvas, setReactSketchCanvas] = useState<any>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const canvasRef = useRef<any>(null);

  const { canvasWidth = 800, canvasHeight = 600, backgroundImageUrl, instructions } = question.questionData;

  // Dynamically import the ReactSketchCanvas component
  useEffect(() => {
    let isMounted = true;

    const loadLibrary = async () => {
      try {
        // Import the library dynamically
        const module = await import('react-sketch-canvas');

        // Only update state if component is still mounted
        if (isMounted) {
          setReactSketchCanvas(() => module.ReactSketchCanvas);
          setIsLibraryLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load ReactSketchCanvas:', error);
        if (isMounted) {
          setIsLibraryLoaded(false);
        }
      }
    };

    loadLibrary();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate completion based on stroke paths
  const updateCompletionPercentage = async () => {
    if (!canvasRef.current) return;

    try {
      const paths = await canvasRef.current.exportPaths();

      // Simple calculation based on number of paths and points
      const totalPoints = paths.reduce((sum: number, path: any) => sum + path.paths.length, 0);

      // Set a threshold for completion (e.g., 100 points is considered complete)
      const threshold = 100;
      const percentage = Math.min(100, Math.round((totalPoints / threshold) * 100));

      setCompletionPercentage(percentage);
      if (percentage >= 80) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error calculating completion:', error);
    }
  };

  // Handle play functionality
  const handlePlay = () => {
    setIsPlaying(true);

    // Simulate drawing with the auto-complete feature
    const interval = setInterval(() => {
      setCompletionPercentage(prev => {
        const newValue = Math.min(100, prev + 5);
        if (newValue >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          setIsPlaying(false);
        }
        return newValue;
      });
    }, 200);

    // Safety cleanup
    setTimeout(() => {
      clearInterval(interval);
      setIsPlaying(false);
      setIsCompleted(true);
      setCompletionPercentage(100);
    }, 5000);
  };

  // Save drawing
  const handleSave = async () => {
    if (!canvasRef.current) return;

    try {
      // Get drawing as data URL
      const drawingData = await canvasRef.current.exportImage('png');

      if (onSave) {
        onSave({
          drawingData,
          completionPercentage
        });
      }

      toast.success('Drawing saved successfully');
    } catch (error) {
      console.error('Error saving drawing:', error);
      toast.error('Failed to save drawing');
    }
  };

  // Handle clear canvas
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      setCompletionPercentage(0);
      setIsCompleted(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const link = document.createElement('a');
      link.download = `drawing-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading drawing:', error);
      toast.error('Failed to download drawing');
    }
  };

  // Toggle eraser mode
  const toggleEraseMode = () => {
    if (canvasRef.current) {
      const newMode = !eraseMode;
      canvasRef.current.eraseMode(newMode);
      setEraseMode(newMode);
    }
  };

  // Load initial response
  useEffect(() => {
    if (initialResponse?.drawingData && canvasRef.current) {
      // Load the saved drawing
      try {
        canvasRef.current.importImage(initialResponse.drawingData);

        // Set completion percentage
        if (initialResponse.completionPercentage) {
          setCompletionPercentage(initialResponse.completionPercentage);
          if (initialResponse.completionPercentage >= 80) {
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error loading saved drawing:', error);
        toast.error('Failed to load saved drawing');
      }
    }
  }, [initialResponse, canvasRef.current]);

  // Update completion percentage periodically
  useEffect(() => {
    if (readOnly) return;

    const interval = setInterval(() => {
      if (hasDrawn) {
        updateCompletionPercentage();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hasDrawn, readOnly]);

  // Handle canvas change
  const handleCanvasChange = () => {
    setHasDrawn(true);
    updateCompletionPercentage();
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
                variant={!eraseMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEraseMode(false);
                  if (canvasRef.current) canvasRef.current.eraseMode(false);
                }}
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Brush
              </Button>
              <Button
                variant={eraseMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEraseMode(true);
                  if (canvasRef.current) canvasRef.current.eraseMode(true);
                }}
              >
                <Eraser className="h-4 w-4 mr-1" />
                Eraser
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}

        <div className="relative border rounded overflow-hidden">
          {isLibraryLoaded && ReactSketchCanvas ? (
            <div
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                maxWidth: '100%'
              }}
            >
              {React.createElement(ReactSketchCanvas, {
                ref: canvasRef,
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                strokeWidth: 5,
                strokeColor: "#000000",
                backgroundImage: backgroundImageUrl,
                exportWithBackgroundImage: true,
                preserveBackgroundImageAspectRatio: "meet",
                withTimestamp: true,
                readOnly: readOnly,
                onChange: handleCanvasChange,
                style: {
                  border: 'none'
                }
              })}
            </div>
          ) : (
            <div
              id="sketch-canvas-placeholder"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                maxWidth: '100%',
                backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#ffffff'
              }}
              className="touch-none"
            >
              <div className="flex items-center justify-center h-full text-gray-400">
                {isLibraryLoaded === false ?
                  "Drawing library could not be loaded" :
                  "Loading drawing canvas..."}
              </div>
            </div>
          )}
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

              <Button
                onClick={handleSave}
                disabled={!hasDrawn && !isCompleted}
                className="flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Drawing
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrawingExerciseSketch;
