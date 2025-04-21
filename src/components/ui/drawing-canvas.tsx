import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Trash2, Download, Undo, Redo, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  backgroundImage?: string;
  guidePoints?: { x: number; y: number }[];
  strokeWidth?: number;
  strokeColor?: string;
  className?: string;
  readOnly?: boolean;
  initialDrawing?: string;
  onSave?: (dataUrl: string) => void;
  onDrawingChange?: (dataUrl: string) => void;
  showControls?: boolean;
}

export function DrawingCanvas({
  width = 500,
  height = 300,
  backgroundImage,
  guidePoints,
  strokeWidth = 3,
  strokeColor = '#000000',
  className,
  readOnly = false,
  initialDrawing,
  onSave,
  onDrawingChange,
  showControls = true
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(strokeWidth);
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = backgroundImage;
    } else {
      saveToHistory();
    }

    // Draw guide points if provided
    if (guidePoints && guidePoints.length > 0) {
      drawGuidePoints(ctx);
    }

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialDrawing;
    }
  }, [width, height, backgroundImage, guidePoints, initialDrawing]);

  // Draw guide points
  const drawGuidePoints = (ctx: CanvasRenderingContext2D) => {
    if (!guidePoints || !guidePoints.length) return;

    ctx.save();
    ctx.fillStyle = 'rgba(100, 149, 237, 0.5)';
    
    guidePoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Connect guide points with dotted lines
    if (guidePoints.length > 1) {
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(guidePoints[0].x, guidePoints[0].y);
      
      for (let i = 1; i < guidePoints.length; i++) {
        ctx.lineTo(guidePoints[i].x, guidePoints[i].y);
      }
      
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Save current canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    
    // If we're not at the end of the history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(prev => prev.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, dataUrl]);
    setHistoryIndex(prev => prev + 1);
    
    if (onDrawingChange) {
      onDrawingChange(dataUrl);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      if (onDrawingChange) {
        onDrawingChange(history[newIndex]);
      }
    };
    img.src = history[newIndex];
  };

  // Redo last undone action
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      if (onDrawingChange) {
        onDrawingChange(history[newIndex]);
      }
    };
    img.src = history[newIndex];
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = backgroundImage;
    } else {
      saveToHistory();
    }
    
    // Redraw guide points if provided
    if (guidePoints && guidePoints.length > 0) {
      drawGuidePoints(ctx);
    }
  };

  // Download canvas as image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataUrl;
    link.click();
  };

  // Save canvas
  const handleSave = () => {
    if (!onSave) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  // Toggle eraser
  const toggleEraser = () => {
    setIsEraser(prev => !prev);
  };

  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on touch devices
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isEraser ? 'white' : currentColor;
      ctx.lineWidth = currentStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    saveToHistory();
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {showControls && !readOnly && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-1">
            <Button
              variant={isEraser ? "outline" : "default"}
              size="sm"
              onClick={() => setIsEraser(false)}
              className="h-8 w-8 p-0"
            >
              <PenTool className="h-4 w-4" />
            </Button>
            
            <Button
              variant={isEraser ? "default" : "outline"}
              size="sm"
              onClick={toggleEraser}
              className="h-8 w-8 p-0"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-xs text-gray-500">Size:</span>
            <Slider
              value={[currentStrokeWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setCurrentStrokeWidth(value[0])}
              className="w-24"
            />
          </div>
          
          {!isEraser && (
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-xs text-gray-500">Color:</span>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-8 h-8 p-0 border rounded cursor-pointer"
              />
            </div>
          )}
          
          <div className="flex-grow"></div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          
          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="ml-2"
            >
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
