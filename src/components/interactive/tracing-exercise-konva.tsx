import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import { TracingQuestion } from '@/types/interactiveAssignment';
import { Paintbrush, Eraser, RotateCcw, Download, Check } from 'lucide-react';
import { useKonvaCanvas } from '@/hooks/useKonvaCanvas';
import Konva from 'konva';

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

export function TracingExerciseKonva({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: TracingExerciseProps) {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(question.questionData.strokeWidth || 5);
  const [tracingData, setTracingData] = useState<string>('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [guideLayer, setGuideLayer] = useState<Konva.Layer | null>(null);
  
  const { 
    letterOrShape, 
    backgroundImageUrl, 
    guidePoints, 
    canvasWidth = 400, 
    canvasHeight = 400, 
    difficulty = 'medium' 
  } = question.questionData;
  
  // Initialize Konva canvas
  const {
    containerRef,
    stage,
    layer,
    clear,
    getImage,
    addLine,
    addText,
    addCircle
  } = useKonvaCanvas({
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: '#ffffff'
  });

  // Create guide layer
  useEffect(() => {
    if (!stage) return;
    
    // Create a separate layer for the guide
    const newGuideLayer = new Konva.Layer();
    stage.add(newGuideLayer);
    
    // Make sure the guide layer is below the drawing layer
    newGuideLayer.moveToBottom();
    
    setGuideLayer(newGuideLayer);
    
    // Draw the guide
    drawGuide(newGuideLayer);
    
    return () => {
      newGuideLayer.destroy();
    };
  }, [stage, letterOrShape, guidePoints, canvasWidth, canvasHeight]);
  
  // Load background image if provided
  useEffect(() => {
    if (!backgroundImageUrl || !guideLayer) return;
    
    const image = new Image();
    image.src = backgroundImageUrl;
    image.onload = () => {
      setBackgroundImage(image);
      
      // Add background image to guide layer
      const konvaImage = new Konva.Image({
        x: 0,
        y: 0,
        image: image,
        width: canvasWidth,
        height: canvasHeight,
        opacity: 0.3,
      });
      
      guideLayer.add(konvaImage);
      guideLayer.draw();
    };
  }, [backgroundImageUrl, guideLayer, canvasWidth, canvasHeight]);
  
  // Draw guide on the guide layer
  const drawGuide = (guideLayer: Konva.Layer) => {
    if (!guideLayer) return;
    
    if (guidePoints && guidePoints.length > 0) {
      // Draw guide from points
      const points: number[] = [];
      
      // Convert guide points to flat array for Konva
      guidePoints.forEach(point => {
        points.push(point.x * canvasWidth);
        points.push(point.y * canvasHeight);
      });
      
      const guideLine = new Konva.Line({
        points: points,
        stroke: '#AAAAAA',
        strokeWidth: brushSize * 1.2,
        lineCap: 'round',
        lineJoin: 'round',
        dash: [5, 5],
        opacity: 0.6,
      });
      
      guideLayer.add(guideLine);
    } else {
      // Draw guide based on letter or shape
      const guideText = new Konva.Text({
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        text: letterOrShape,
        fontSize: canvasHeight * 0.8,
        fontFamily: 'sans-serif',
        fill: '#EEEEEE',
        stroke: '#AAAAAA',
        strokeWidth: 2,
        align: 'center',
        verticalAlign: 'middle',
      });
      
      guideLayer.add(guideText);
    }
    
    guideLayer.draw();
  };
  
  // Handle drawing events through Konva
  useEffect(() => {
    if (!stage || !layer || readOnly) return;
    
    let isDrawing = false;
    let lastLine: Konva.Line | null = null;
    
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      isDrawing = true;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const newLine = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: tool === 'brush' ? '#000000' : '#FFFFFF',
        strokeWidth: brushSize,
        lineCap: 'round',
        lineJoin: 'round',
        tension: 0.5,
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
      });
      
      layer.add(newLine);
      lastLine = newLine;
    };
    
    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing || !lastLine) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
      layer.batchDraw();
    };
    
    const handleMouseUp = () => {
      isDrawing = false;
      lastLine = null;
      
      // Calculate completion and accuracy after drawing
      calculateCompletionAndAccuracy();
    };
    
    // Add event listeners
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);
    
    // Clean up
    return () => {
      stage.off('mousedown touchstart');
      stage.off('mousemove touchmove');
      stage.off('mouseup touchend');
    };
  }, [stage, layer, readOnly, brushSize, tool]);
  
  // Calculate completion percentage and accuracy
  const calculateCompletionAndAccuracy = () => {
    if (!stage || !guideLayer || !layer) return;
    
    // Get image data from both layers
    const guideDataURL = guideLayer.toCanvas().toDataURL();
    const drawingDataURL = layer.toCanvas().toDataURL();
    
    // Create temporary canvases to analyze pixel data
    const guideCanvas = document.createElement('canvas');
    const drawingCanvas = document.createElement('canvas');
    
    guideCanvas.width = canvasWidth;
    guideCanvas.height = canvasHeight;
    drawingCanvas.width = canvasWidth;
    drawingCanvas.height = canvasHeight;
    
    const guideCtx = guideCanvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');
    
    if (!guideCtx || !drawingCtx) return;
    
    // Load images into canvases
    const guideImg = new Image();
    const drawingImg = new Image();
    
    guideImg.onload = () => {
      guideCtx.drawImage(guideImg, 0, 0);
      
      drawingImg.onload = () => {
        drawingCtx.drawImage(drawingImg, 0, 0);
        
        // Get image data
        const guideImageData = guideCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const drawingImageData = drawingCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        const guidePixels = guideImageData.data;
        const drawingPixels = drawingImageData.data;
        
        let totalGuidePixels = 0;
        let coveredGuidePixels = 0;
        let totalDrawingPixels = 0;
        let accurateDrawingPixels = 0;
        
        // Analyze pixels
        for (let i = 0; i < guidePixels.length; i += 4) {
          // Check if guide pixel is not white (part of the guide)
          const isGuidePixel = 
            guidePixels[i] < 240 || 
            guidePixels[i + 1] < 240 || 
            guidePixels[i + 2] < 240;
          
          // Check if drawing pixel is not white (part of the drawing)
          const isDrawingPixel = 
            drawingPixels[i] < 240 || 
            drawingPixels[i + 1] < 240 || 
            drawingPixels[i + 2] < 240;
          
          if (isGuidePixel) {
            totalGuidePixels++;
            if (isDrawingPixel) {
              coveredGuidePixels++;
            }
          }
          
          if (isDrawingPixel) {
            totalDrawingPixels++;
            if (isGuidePixel) {
              accurateDrawingPixels++;
            }
          }
        }
        
        // Calculate completion percentage (how much of the guide is covered)
        const completion = totalGuidePixels > 0 
          ? Math.min(100, Math.round((coveredGuidePixels / totalGuidePixels) * 100))
          : 0;
        
        // Calculate accuracy (how much of the user drawing is on the guide)
        const accuracy = totalDrawingPixels > 0
          ? Math.min(100, Math.round((accurateDrawingPixels / totalDrawingPixels) * 100))
          : 0;
        
        setCompletionPercentage(completion);
        setAccuracy(accuracy);
      };
      
      drawingImg.src = drawingDataURL;
    };
    
    guideImg.src = guideDataURL;
  };
  
  const handleClear = () => {
    clear();
    setTracingData('');
    setCompletionPercentage(0);
    setAccuracy(0);
  };
  
  const handleSave = () => {
    if (!stage) return;
    
    // Get the drawing as a data URL
    const dataURL = getImage();
    setTracingData(dataURL);
    
    if (onSave) {
      onSave({
        tracingData: dataURL,
        completionPercentage,
        accuracy,
      });
    }
  };
  
  const handleDownload = () => {
    if (!stage) return;
    
    const dataURL = getImage();
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `tracing-${letterOrShape}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'brush' ? "default" : "outline"}
                size="sm"
                onClick={() => setTool('brush')}
                className="flex items-center"
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Brush
              </Button>
              
              <Button
                variant={tool === 'eraser' ? "default" : "outline"}
                size="sm"
                onClick={() => setTool('eraser')}
                className="flex items-center"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Eraser
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Size:</span>
              <Slider
                value={[brushSize]}
                min={1}
                max={20}
                step={1}
                onValueChange={handleBrushSizeChange}
                className="w-32"
              />
              <span className="text-sm font-medium">{brushSize}px</span>
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
          <div
            ref={containerRef}
            className="w-full touch-none"
            style={{ cursor: readOnly ? 'default' : (tool === 'brush' ? 'crosshair' : 'cell') }}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleClear}>
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
  
  function handleBrushSizeChange(value: number[]) {
    setBrushSize(value[0]);
  }
}

export default TracingExerciseKonva;
