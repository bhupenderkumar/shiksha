import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, Download } from 'lucide-react';
import { TracingQuestion, TracingResponse } from '@/types/interactiveAssignment';

interface SimplifiedTracingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: TracingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: TracingResponse;
  onSave?: (response: TracingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedTracingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedTracingExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const { 
    letterOrShape, 
    backgroundImageUrl, 
    guidePoints = [], 
    canvasWidth = 400, 
    canvasHeight = 400, 
    strokeWidth = 5,
    difficulty = 'medium'
  } = question.questionData;
  
  // Initialize canvas and load background image if provided
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide points or load background image
    if (backgroundImageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBackgroundImage(img);
        drawGuidePoints(ctx);
      };
      img.src = backgroundImageUrl;
    } else {
      drawGuidePoints(ctx);
    }
    
    // Load initial tracing if provided
    if (initialResponse?.tracingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        calculateCompletion();
      };
      img.src = initialResponse.tracingData;
      
      setCompletionPercentage(initialResponse.completionPercentage || 0);
    }
  }, [canvasWidth, canvasHeight, backgroundImageUrl, initialResponse, guidePoints]);
  
  // Draw guide points on canvas
  const drawGuidePoints = (ctx: CanvasRenderingContext2D) => {
    if (guidePoints.length === 0) return;
    
    // Draw guide path
    ctx.beginPath();
    ctx.moveTo(guidePoints[0].x * canvasWidth, guidePoints[0].y * canvasHeight);
    
    for (let i = 1; i < guidePoints.length; i++) {
      ctx.lineTo(guidePoints[i].x * canvasWidth, guidePoints[i].y * canvasHeight);
    }
    
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    
    // Draw guide points
    guidePoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(
        point.x * canvasWidth, 
        point.y * canvasHeight, 
        strokeWidth / 2, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = '#aaaaaa';
      ctx.fill();
    });
  };
  
  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get mouse position
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get mouse position
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      calculateCompletion();
    }
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    // This is a simplified calculation - in a real implementation,
    // you would check how closely the user's tracing follows the guide path
    
    // For now, we'll just set a random completion percentage between 50-100%
    const completion = Math.floor(Math.random() * 50) + 50;
    setCompletionPercentage(completion);
  };
  
  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw background image if exists
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Redraw guide points
    drawGuidePoints(ctx);
    
    setCompletionPercentage(0);
  };
  
  // Save tracing
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get canvas data as base64 string
    const tracingData = canvas.toDataURL('image/png');
    
    if (onSave) {
      onSave({ 
        tracingData,
        completionPercentage
      });
    }
  };
  
  // Download tracing
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const tracingData = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `tracing-${question.id}.png`;
    link.href = tracingData;
    link.click();
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Trace the {letterOrShape} by following the guide.
      </p>
      
      {/* Completion indicator */}
      <div className="mb-4 flex items-center">
        <span className="text-sm mr-2">Completion:</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              completionPercentage >= 80 ? 'bg-green-500' : 
              completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <span className="text-sm ml-2 font-medium">{completionPercentage}%</span>
      </div>
      
      {/* Canvas */}
      <div className="border rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex justify-end">
        {!readOnly && (
          <>
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="mr-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="mr-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={handleSave}
            >
              Save
            </Button>
          </>
        )}
        {readOnly && (
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

export default SimplifiedTracingExercise;
