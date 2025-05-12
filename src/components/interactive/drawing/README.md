# Drawing Exercise Component

This component provides an interactive drawing canvas for students to complete drawing exercises in the interactive assignment system.

## Features

- Interactive drawing canvas with brush and eraser tools
- Background image support
- Completion tracking
- Auto-complete functionality
- Save and download options
- Responsive design for different screen sizes
- Touch support for mobile devices

## Implementation

The drawing exercise is implemented using the React Sketch Canvas library, which provides a simple and efficient way to create drawing interfaces with touch support.

### Components

1. **DrawingExercise** - The main wrapper component that handles the drawing functionality
2. **DrawingExerciseSketch** - The implementation using React Sketch Canvas
3. **DrawingExerciseOriginal** - The original implementation using Konva (used as fallback)
4. **DrawingQuestionForm** - Form for teachers to create and edit drawing questions
5. **ImageUploader** - Component for uploading background images

### Architecture

The implementation uses React's lazy loading to dynamically import the React Sketch Canvas library, which helps with performance and allows for a fallback mechanism if the library fails to load.

### Usage

```jsx
import { DrawingExercise } from '@/components/interactive/drawing';

// Example usage
<DrawingExercise
  question={{
    id: 'question-id',
    questionText: 'Draw a picture',
    questionData: {
      instructions: 'Draw a picture of your favorite animal',
      backgroundImageUrl: 'https://example.com/background.jpg',
      canvasWidth: 800,
      canvasHeight: 600
    }
  }}
  onSave={(response) => {
    console.log('Drawing saved:', response);
  }}
/>
```

### Props

#### DrawingExercise

| Prop | Type | Description |
|------|------|-------------|
| question | Object | Question data including instructions and background image |
| readOnly | boolean | Whether the canvas is in read-only mode |
| initialResponse | DrawingResponse | Initial drawing data to load |
| onSave | Function | Callback function when drawing is saved |

#### DrawingResponse

| Property | Type | Description |
|----------|------|-------------|
| drawingData | string | Base64 encoded image data |
| completionPercentage | number | Percentage of completion (0-100) |

## Technical Details

- Uses React Sketch Canvas for the drawing functionality
- Dynamically imports the library to avoid SSR issues
- Includes fallback to original implementation if library fails to load
- Handles background images with proper scaling
- Tracks completion based on canvas coverage

## Testing

You can test the drawing exercise by navigating to `/drawing-test` in the application.

## Dependencies

- react-sketch-canvas: ^6.2.0
