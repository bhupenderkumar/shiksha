import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { PuzzleQuestion } from '@/types/interactiveAssignment';

interface PuzzleExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: PuzzleQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  width: number;
  height: number;
  imageUrl: string;
  isCorrect: boolean;
}

interface SortablePieceProps {
  piece: PuzzlePiece;
  showCorrect?: boolean;
}

const SortablePiece = ({ piece, showCorrect }: SortablePieceProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: piece.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
    backgroundImage: `url(${piece.imageUrl})`,
    backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
    backgroundSize: 'cover',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        absolute border border-white cursor-grab shadow-md
        ${piece.isCorrect ? 'ring-2 ring-green-500' : ''}
        ${showCorrect && !piece.isCorrect ? 'ring-2 ring-red-500' : ''}
      `}
    />
  );
};

export function PuzzleExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: PuzzleExerciseProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load image and create puzzle pieces
  useEffect(() => {
    const img = new Image();
    img.src = question.questionData.imageUrl;
    img.onload = () => {
      setImageLoaded(true);
      if (imageRef.current) {
        imageRef.current.src = img.src;
      }
    };
  }, [question]);

  // Create puzzle pieces when image is loaded
  useEffect(() => {
    if (!imageLoaded || !containerRef.current || !imageRef.current) return;

    const createPuzzlePieces = () => {
      const { pieces: numPieces, difficulty } = question.questionData;
      
      // Determine grid size based on number of pieces
      let rows, cols;
      if (numPieces <= 4) {
        rows = 2;
        cols = 2;
      } else if (numPieces <= 9) {
        rows = 3;
        cols = 3;
      } else if (numPieces <= 16) {
        rows = 4;
        cols = 4;
      } else {
        rows = 5;
        cols = 5;
      }
      
      const img = imageRef.current!;
      const containerWidth = containerRef.current!.clientWidth;
      const containerHeight = containerWidth * (img.height / img.width);
      
      const pieceWidth = containerWidth / cols;
      const pieceHeight = containerHeight / rows;
      
      const newPieces: PuzzlePiece[] = [];
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newPieces.length >= numPieces) break;
          
          const id = `piece-${row}-${col}`;
          const correctX = col * pieceWidth;
          const correctY = row * pieceHeight;
          
          // Random position for initial placement
          const randomX = Math.random() * (containerWidth - pieceWidth);
          const randomY = Math.random() * (containerHeight - pieceHeight) + containerHeight + 20; // Place below the puzzle area
          
          newPieces.push({
            id,
            x: randomX,
            y: randomY,
            correctX,
            correctY,
            width: pieceWidth,
            height: pieceHeight,
            imageUrl: question.questionData.imageUrl,
            isCorrect: false
          });
        }
      }
      
      // Shuffle pieces
      const shuffledPieces = [...newPieces].sort(() => Math.random() - 0.5);
      
      // Apply initial response if available
      if (initialResponse?.pieces) {
        const responsePieces = initialResponse.pieces;
        shuffledPieces.forEach((piece, index) => {
          const responsePiece = responsePieces.find((p: any) => p.id === piece.id);
          if (responsePiece) {
            piece.x = responsePiece.x;
            piece.y = responsePiece.y;
            piece.isCorrect = responsePiece.isCorrect;
          }
        });
      }
      
      setPieces(shuffledPieces);
      updateCompletionPercentage(shuffledPieces);
    };
    
    createPuzzlePieces();
  }, [imageLoaded, question, initialResponse]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !containerRef.current) return;
    
    const pieceId = active.id as string;
    const piece = pieces.find(p => p.id === pieceId);
    
    if (!piece) return;
    
    // Get the position where the piece was dropped
    const { x, y } = event.over.rect;
    
    // Update the piece position
    const updatedPieces = pieces.map(p => {
      if (p.id === pieceId) {
        // Calculate position relative to the container
        const containerRect = containerRef.current!.getBoundingClientRect();
        const newX = x - containerRect.left;
        const newY = y - containerRect.top;
        
        // Check if the piece is close to its correct position
        const isCorrect = 
          Math.abs(newX - p.correctX) < 20 && 
          Math.abs(newY - p.correctY) < 20;
        
        // If correct, snap to exact position
        return {
          ...p,
          x: isCorrect ? p.correctX : newX,
          y: isCorrect ? p.correctY : newY,
          isCorrect
        };
      }
      return p;
    });
    
    setPieces(updatedPieces);
    updateCompletionPercentage(updatedPieces);
  };

  const updateCompletionPercentage = (currentPieces: PuzzlePiece[]) => {
    const correctPieces = currentPieces.filter(p => p.isCorrect).length;
    const percentage = Math.round((correctPieces / currentPieces.length) * 100);
    setCompletionPercentage(percentage);
  };

  const handleSave = () => {
    if (completionPercentage < 100 && !showAnswers) {
      toast.error('Complete the puzzle before saving');
      return;
    }
    
    if (onSave) {
      onSave({
        pieces: pieces.map(p => ({
          id: p.id,
          x: p.x,
          y: p.y,
          isCorrect: p.isCorrect
        })),
        completionPercentage
      });
    }
  };

  const handleReset = () => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Randomize positions
    const updatedPieces = pieces.map(p => {
      const randomX = Math.random() * (containerWidth - p.width);
      const randomY = Math.random() * (containerHeight - p.height) + containerHeight + 20;
      
      return {
        ...p,
        x: randomX,
        y: randomY,
        isCorrect: false
      };
    });
    
    setPieces(updatedPieces);
    setCompletionPercentage(0);
  };

  const handleShowSolution = () => {
    // Place all pieces in their correct positions
    const updatedPieces = pieces.map(p => ({
      ...p,
      x: p.correctX,
      y: p.correctY,
      isCorrect: true
    }));
    
    setPieces(updatedPieces);
    setCompletionPercentage(100);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">
            Completion: <span className="font-medium">{completionPercentage}%</span>
          </div>
          
          {question.questionData.previewEnabled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          )}
        </div>
        
        {showPreview && (
          <div className="mb-4 border rounded-md overflow-hidden">
            <img 
              src={question.questionData.imageUrl} 
              alt="Puzzle preview" 
              className="w-full h-auto"
            />
          </div>
        )}
        
        <div className="relative" style={{ height: '600px' }}>
          {/* Puzzle board */}
          <div 
            ref={containerRef} 
            className="relative border-2 border-gray-300 rounded-md bg-gray-100"
            style={{ 
              width: '100%', 
              height: '50%',
              backgroundImage: 'url(/images/puzzle-grid-bg.png)',
              backgroundSize: 'cover'
            }}
          >
            <img 
              ref={imageRef} 
              src={question.questionData.imageUrl} 
              alt="Hidden reference" 
              className="hidden" 
            />
          </div>
          
          {/* Piece tray */}
          <div 
            className="relative mt-4 border-2 border-gray-300 rounded-md bg-gray-200"
            style={{ width: '100%', height: '45%' }}
          >
            <p className="text-center text-sm text-gray-500 mt-2">Drag pieces to the puzzle board</p>
          </div>
          
          {/* Puzzle pieces */}
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pieces.map(p => p.id)}>
              {pieces.map(piece => (
                <SortablePiece 
                  key={piece.id} 
                  piece={piece} 
                  showCorrect={showAnswers}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            {showAnswers && (
              <Button variant="outline" onClick={handleShowSolution}>
                Show Solution
              </Button>
            )}
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default PuzzleExercise;
