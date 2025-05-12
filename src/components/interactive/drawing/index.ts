// Export the drawing components
import DrawingExerciseWrapper from '../drawing-exercise-wrapper';
import { DrawingExercise as DrawingExerciseOriginal } from '../drawing-exercise';

export { DrawingExerciseOriginal };
export const DrawingExercise = DrawingExerciseWrapper;
