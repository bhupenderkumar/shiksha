import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { PuzzleQuestion, PuzzleResponse } from '@/types/interactiveAssignment';

interface SimplifiedPuzzleExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: PuzzleQuestion;
  };
  readOnly?: boolean;
  initialResponse?: PuzzleResponse;
  onSave?: (response: PuzzleResponse) => void;
  showAnswers?: boolean;
}

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isPlaced: boolean;
}

export function SimplifiedPuzzleExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedPuzzleExerciseProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const { imageUrl, pieces: pieceCount = 9, difficulty = 'medium', previewEnabled = true } = question.questionData;
  
  // Initialize puzzle pieces
  useEffect(() => {
    if (initialResponse?.piecesPlaced) {
      // Initialize from response
      const initialPieces: PuzzlePiece[] = [];
      const totalPieces = pieceCount;
      
      for (let i = 0; i < totalPieces; i++) {
        initialPieces.push({
          id: i,
          currentPosition: i,
          correctPosition: i,
          isPlaced: i < initialResponse.piecesPlaced
        });
      }
      
      // Shuffle unplaced pieces
      const unplacedPieces = initialPieces.filter(p => !p.isPlaced);
      const shuffledUnplaced = [...unplacedPieces].sort(() => Math.random() - 0.5);
      
      let unplacedIndex = 0;
      const finalPieces = initialPieces.map(piece => {
        if (piece.isPlaced) return piece;
        
        return {
          ...shuffledUnplaced[unplacedIndex++],
          isPlaced: false
        };
      });
      
      setPieces(finalPieces);
      setTimeSpent(initialResponse.timeSpent || 0);
    } else {
      // Create new puzzle pieces
      const initialPieces: PuzzlePiece[] = [];
      const totalPieces = pieceCount;
      
      for (let i = 0; i < totalPieces; i++) {
        initialPieces.push({
          id: i,
          currentPosition: i,
          correctPosition: i,
          isPlaced: false
        });
      }
      
      // Shuffle pieces
      const shuffledPieces = [...initialPieces].sort(() => Math.random() - 0.5);
      
      setPieces(shuffledPieces.map((piece, index) => ({
        ...piece,
        currentPosition: index
      })));
      
      setTimeSpent(0);
    }
    
    // Start timer
    if (!readOnly && !startTime) {
      setStartTime(new Date());
    }
  }, [question.questionData, initialResponse, pieceCount, startTime, readOnly]);
  
  // Update timer
  useEffect(() => {
    if (readOnly || !startTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setTimeSpent(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, readOnly]);
  
  // Handle piece selection
  const handlePieceClick = (index: number) => {
    if (readOnly) return;
    
    const piece = pieces[index];
    if (piece.isPlaced) return;
    
    setSelectedPiece(selectedPiece === index ? null : index);
  };
  
  // Handle placing a piece
  const handlePlacePiece = (index: number) => {
    if (readOnly || selectedPiece === null) return;
    
    const selectedPieceObj = pieces[selectedPiece];
    const targetPiece = pieces[index];
    
    // Can only place in empty slots
    if (targetPiece.isPlaced) return;
    
    // Swap pieces
    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      
      // Mark the selected piece as placed in its new position
      newPieces[selectedPiece] = {
        ...targetPiece,
        currentPosition: selectedPiece
      };
      
      // Move the target piece to the selected piece's position
      newPieces[index] = {
        ...selectedPieceObj,
        currentPosition: index,
        isPlaced: true
      };
      
      return newPieces;
    });
    
    setSelectedPiece(null);
    
    // Check if puzzle is complete
    const allPlaced = pieces.every(piece => piece.isPlaced);
    if (allPlaced) {
      handleSave(true);
    }
  };
  
  // Handle save
  const handleSave = (completed = false) => {
    if (onSave) {
      const piecesPlaced = pieces.filter(piece => piece.isPlaced).length;
      
      onSave({
        completed,
        piecesPlaced,
        timeSpent
      });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    // Create new puzzle pieces
    const initialPieces: PuzzlePiece[] = [];
    const totalPieces = pieceCount;
    
    for (let i = 0; i < totalPieces; i++) {
      initialPieces.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isPlaced: false
      });
    }
    
    // Shuffle pieces
    const shuffledPieces = [...initialPieces].sort(() => Math.random() - 0.5);
    
    setPieces(shuffledPieces.map((piece, index) => ({
      ...piece,
      currentPosition: index
    })));
    
    setSelectedPiece(null);
    setStartTime(new Date());
    setTimeSpent(0);
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate grid dimensions
  const gridSize = Math.sqrt(pieceCount);
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Complete the puzzle by selecting and placing the pieces in the correct positions.
      </p>
      
      {/* Progress and timer */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm">
            Progress: {pieces.filter(p => p.isPlaced).length} / {pieces.length} pieces
          </p>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${(pieces.filter(p => p.isPlaced).length / pieces.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="text-sm">
          Time: {formatTime(timeSpent)}
        </div>
        
        {previewEnabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Preview
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Preview */}
      {showPreview && (
        <div className="mb-4 border rounded-md overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Puzzle preview" 
            className="w-full max-h-64 object-contain"
          />
        </div>
      )}
      
      {/* Puzzle grid */}
      <div className="border rounded-md p-2 bg-gray-50">
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            aspectRatio: '1/1'
          }}
        >
          {pieces.map((piece, index) => {
            const isSelected = selectedPiece === index;
            const isPlaceable = selectedPiece !== null && !piece.isPlaced;
            
            return (
              <div
                key={index}
                onClick={() => piece.isPlaced ? null : (isPlaceable ? handlePlacePiece(index) : handlePieceClick(index))}
                className={`
                  relative border rounded-md overflow-hidden
                  ${piece.isPlaced ? 'cursor-default' : 'cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isPlaceable ? 'ring-2 ring-green-500' : ''}
                  ${readOnly ? 'cursor-default' : ''}
                `}
                style={{ aspectRatio: '1/1' }}
              >
                {piece.isPlaced || showAnswers ? (
                  <div className="w-full h-full bg-white relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: `${gridSize * 100}%`,
                        backgroundPosition: `${(piece.correctPosition % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.correctPosition / gridSize) * (100 / (gridSize - 1))}%`
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <span className="text-lg font-bold text-gray-400">?</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Controls */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={() => handleSave(false)}
          >
            Save Progress
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedPuzzleExercise;
