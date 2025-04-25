import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Paintbrush, Eraser, RotateCcw, Download } from 'lucide-react';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';

interface SimplifiedDrawingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: DrawingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: DrawingResponse;
  onSave?: (response: DrawingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedDrawingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedDrawingExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const { canvasWidth = 800, canvasHeight = 600, backgroundImageUrl, instructions } = question.questionData;
  
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
    
    // Load background image if provided
    if (backgroundImageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBackgroundImage(img);
      };
      img.src = backgroundImageUrl;
    }
    
    // Load initial drawing if provided
    if (initialResponse?.drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialResponse.drawingData;
    }
  }, [canvasWidth, canvasHeight, backgroundImageUrl, initialResponse]);
  
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
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'brush' ? color : '#ffffff';
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
    setIsDrawing(false);
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
  };
  
  // Save drawing
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get canvas data as base64 string
    const drawingData = canvas.toDataURL('image/png');
    
    if (onSave) {
      onSave({ drawingData });
    }
  };
  
  // Download drawing
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const drawingData = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `drawing-${question.id}.png`;
    link.href = drawingData;
    link.click();
  };
  
  // Available colors
  const colorPalette = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF9900', // Orange
    '#9900FF', // Purple
    '#663300', // Brown
  ];
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        {instructions || 'Draw your answer in the canvas below.'}
      </p>
      
      {/* Drawing tools */}
      {!readOnly && (
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center space-x-2 p-2 border rounded-md">
            <Button
              variant={tool === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('brush')}
              className="h-8"
            >
              <Paintbrush className="h-4 w-4 mr-1" />
              Brush
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
              className="h-8"
            >
              <Eraser className="h-4 w-4 mr-1" />
              Eraser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 p-2 border rounded-md">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm">{brushSize}px</span>
          </div>
          
          <div className="flex items-center space-x-2 p-2 border rounded-md">
            <span className="text-sm">Color:</span>
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {colorPalette.map((c) => (
                <div
                  key={c}
                  className={`w-6 h-6 rounded-full cursor-pointer ${color === c ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
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
              <RotateCcw className="mr-2 h-4 w-4" />
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

export default SimplifiedDrawingExercise;
