import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';
import { DrawingExercise } from './drawing-exercise'; // Original implementation

// Lazy load the sketch-based implementation
const DrawingExerciseSketch = lazy(() =>
  import('./drawing-exercise-sketch').then(module => ({
    default: module.DrawingExerciseSketch
  }))
);

interface DrawingExerciseWrapperProps {
  question: {
    id: string;
    questionText: string;
    questionData: DrawingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: DrawingResponse;
  onSave?: (response: DrawingResponse) => void;
}

export default function DrawingExerciseWrapper(props: DrawingExerciseWrapperProps) {
  const [useSketchCanvas, setUseSketchCanvas] = useState(true);
  const [isLibraryAvailable, setIsLibraryAvailable] = useState(false);

  // Check if the library is available
  useEffect(() => {
    const checkLibrary = async () => {
      try {
        // Try to dynamically import the library
        await import('react-sketch-canvas');
        setIsLibraryAvailable(true);
      } catch (error) {
        console.error('React Sketch Canvas library not available:', error);
        setIsLibraryAvailable(false);
        setUseSketchCanvas(false);
      }
    };

    checkLibrary();
  }, []);

  // If the library is not available or we've chosen not to use it, fall back to the original implementation
  if (!isLibraryAvailable || !useSketchCanvas) {
    return <DrawingExercise {...props} />;
  }

  // Otherwise, use the new sketch-based implementation with Suspense
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading drawing canvas...</div>}>
      <DrawingExerciseSketch {...props} />
    </Suspense>
  );
}
