import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import { TracingQuestion } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, Check } from 'lucide-react';

interface TracingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: TracingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

export function TracingExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: TracingExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(question.questionData.strokeWidth || 5);
  const [tracingData, setTracingData] = useState<string>('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const { 
    letterOrShape, 
    backgroundImageUrl, 
    guidePoints, 
    canvasWidth = 400, 
    canvasHeight = 400, 
    difficulty = 'medium' 
  } = question.questionData;
  
  // Initialize canvas and load background image if provided
  useEffect(() => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    
    if (!canvas || !guideCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    
    if (!ctx || !guideCtx) return;
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    guideCanvas.width = canvasWidth;
    guideCanvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide on the guide canvas
    drawGuide(guideCtx);
    
    // Load background image if provided
    if (backgroundImageUrl) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        guideCtx.globalAlpha = 0.2;
        guideCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
        guideCtx.globalAlpha = 1.0;
      };
      img.src = backgroundImageUrl;
    }
    
    // Load initial response if available
    if (initialResponse?.tracingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setTracingData(initialResponse.tracingData);
        setCompletionPercentage(initialResponse.completionPercentage || 0);
        setAccuracy(initialResponse.accuracy || 0);
      };
      img.src = initialResponse.tracingData;
    }
  }, [question, initialResponse]);
  
  // Draw the guide path based on guide points or letter/shape
  const drawGuide = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set guide style
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = brushSize * 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (guidePoints && guidePoints.length > 0) {
      // Draw guide from points
      ctx.beginPath();
      ctx.moveTo(guidePoints[0].x * ctx.canvas.width, guidePoints[0].y * ctx.canvas.height);
      
      for (let i = 1; i < guidePoints.length; i++) {
        ctx.lineTo(
          guidePoints[i].x * ctx.canvas.width, 
          guidePoints[i].y * ctx.canvas.height
        );
      }
      
      ctx.stroke();
    } else {
      // Draw guide based on letter or shape
      ctx.font = `${ctx.canvas.height * 0.8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // First draw with fill for the background
      ctx.fillStyle = '#EEEEEE';
      ctx.fillText(
        letterOrShape, 
        ctx.canvas.width / 2, 
        ctx.canvas.height / 2
      );
      
      // Then draw the stroke
      ctx.strokeText(
        letterOrShape, 
        ctx.canvas.width / 2, 
        ctx.canvas.height / 2
      );
    }
    
    // Add difficulty-based visual guides
    if (difficulty === 'easy') {
      // For easy difficulty, add dots along the path
      const dotSize = brushSize * 0.5;
      ctx.fillStyle = '#666666';
      
      if (guidePoints && guidePoints.length > 0) {
        for (let i = 0; i < guidePoints.length; i += 5) {
          ctx.beginPath();
          ctx.arc(
            guidePoints[i].x * ctx.canvas.width,
            guidePoints[i].y * ctx.canvas.height,
            dotSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  };
  
  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'brush' ? '#000000' : '#FFFFFF';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      
      // Prevent scrolling
      e.preventDefault();
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Save the current drawing data
    setTracingData(canvas.toDataURL('image/png'));
    
    // Calculate completion percentage and accuracy
    calculateCompletionAndAccuracy();
  };
  
  const calculateCompletionAndAccuracy = () => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    
    if (!canvas || !guideCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    
    if (!ctx || !guideCtx) return;
    
    // Get image data
    const userImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const guideImageData = guideCtx.getImageData(0, 0, guideCanvas.width, guideCanvas.height);
    
    const userPixels = userImageData.data;
    const guidePixels = guideImageData.data;
    
    let totalGuidePixels = 0;
    let coveredGuidePixels = 0;
    let totalUserPixels = 0;
    let accurateUserPixels = 0;
    
    // Count guide pixels and check how many are covered by user drawing
    for (let i = 0; i < guidePixels.length; i += 4) {
      // If guide pixel has color (not fully transparent)
      if (guidePixels[i + 3] > 50) {
        totalGuidePixels++;
        
        // If user also drew here
        if (userPixels[i + 3] > 50) {
          coveredGuidePixels++;
        }
      }
    }
    
    // Count user pixels and check how many are on the guide
    for (let i = 0; i < userPixels.length; i += 4) {
      // If user pixel has color (not fully transparent)
      if (userPixels[i + 3] > 50) {
        totalUserPixels++;
        
        // If guide also has color here
        if (guidePixels[i + 3] > 50) {
          accurateUserPixels++;
        }
      }
    }
    
    // Calculate completion percentage (how much of the guide is covered)
    const completion = totalGuidePixels > 0 
      ? Math.min(100, Math.round((coveredGuidePixels / totalGuidePixels) * 100))
      : 0;
    
    // Calculate accuracy (how much of the user drawing is on the guide)
    const accuracy = totalUserPixels > 0
      ? Math.min(100, Math.round((accurateUserPixels / totalUserPixels) * 100))
      : 0;
    
    setCompletionPercentage(completion);
    setAccuracy(accuracy);
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setTracingData('');
    setCompletionPercentage(0);
    setAccuracy(0);
  };
  
  const handleSave = () => {
    if (completionPercentage < 50 && !showAnswers) {
      toast.error('Please complete more of the tracing before saving');
      return;
    }
    
    if (onSave) {
      onSave({
        tracingData,
        completionPercentage,
        accuracy
      });
    }
  };
  
  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };
  
  const handleDownload = () => {
    if (!tracingData) {
      toast.error('No tracing to download');
      return;
    }
    
    const link = document.createElement('a');
    link.download = `tracing-${question.id}.png`;
    link.href = tracingData;
    link.click();
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <div className="mb-4">
          <p className="text-gray-600">
            Trace the {letterOrShape} by following the guide:
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Completion:</span>
              <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    completionPercentage >= 80 ? 'bg-green-500' : 
                    completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Accuracy:</span>
              <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    accuracy >= 80 ? 'bg-green-500' : 
                    accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <span className="text-sm font-medium">{accuracy}%</span>
            </div>
          </div>
        </div>
        
        {!readOnly && (
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'brush' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('brush')}
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Pen
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
            
            <div className="flex items-center space-x-2 flex-1 max-w-xs">
              <span className="text-sm whitespace-nowrap">Size: {brushSize}px</span>
              <Slider
                value={[brushSize]}
                min={1}
                max={20}
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
            </div>
          </div>
        )}
        
        <div className="relative border rounded-md overflow-hidden">
          {/* Guide canvas (bottom layer) */}
          <canvas
            ref={guideCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute top-0 left-0 w-full h-auto"
          />
          
          {/* Drawing canvas (top layer) */}
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="relative z-10 w-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ cursor: readOnly ? 'default' : (tool === 'brush' ? 'crosshair' : 'cell') }}
          />
        </div>
        
        {showAnswers && completionPercentage >= 80 && accuracy >= 70 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">
              Great job! Your tracing is accurate and complete.
            </span>
          </div>
        )}
      </div>
      
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            Save Tracing
          </Button>
        </div>
      )}
    </div>
  );
}

export default TracingExercise;
