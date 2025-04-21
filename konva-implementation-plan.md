# Konva Implementation Plan for Interactive Assignments

## Overview
This plan outlines the steps to implement the interactive assignment features using Konva instead of canvas. The goal is to convert all canvas-based components to use the `useKonvaCanvas` hook for a consistent approach across all exercise types.

## Components to Convert

### 1. Tracing Exercise (High Priority)
The `tracing-exercise.tsx` component currently uses canvas directly. We need to convert it to use Konva.

**Current Implementation:**
- Uses two canvas elements (guide canvas and drawing canvas)
- Handles mouse/touch events directly
- Calculates completion percentage and accuracy by comparing pixel data

**Konva Implementation:**
- Use `useKonvaCanvas` hook to create Konva stage and layers
- Create two layers: one for the guide and one for drawing
- Implement tracing functionality using Konva's line drawing
- Calculate completion percentage and accuracy using Konva's shape detection

### 2. Counting Exercise (Medium Priority)
The `counting-exercise.tsx` component uses DOM elements for markers. We can enhance it with Konva.

**Current Implementation:**
- Uses DOM elements positioned absolutely for markers
- Handles click events on the image container

**Konva Implementation:**
- Use `useKonvaCanvas` hook to create Konva stage
- Load the image as a Konva.Image
- Add markers as Konva.Circle objects with numbers
- Handle click events through Konva

## Implementation Steps

### Phase 1: Tracing Exercise Conversion

1. Update the `tracing-exercise.tsx` component:
   - Replace canvas references with Konva stage and layers
   - Create a guide layer for displaying the letter/shape to trace
   - Create a drawing layer for user input
   - Implement drawing functionality using Konva lines
   - Update the completion calculation logic to work with Konva shapes

2. Test the tracing exercise with different letters/shapes and difficulty levels

### Phase 2: Counting Exercise Enhancement

1. Update the `counting-exercise.tsx` component:
   - Replace the image container with a Konva stage
   - Load the image as a Konva.Image
   - Add markers as Konva.Circle objects with Konva.Text for numbers
   - Implement click handling through Konva events

2. Test the counting exercise with different images and count requirements

### Phase 3: Review and Enhance Other Components

1. Review other exercise components to ensure they're using Konva where appropriate:
   - Drawing Exercise (already using Konva)
   - Identification Exercise (could potentially benefit from Konva for highlighting areas)
   - Puzzle Exercise (could use Konva for more advanced puzzle piece manipulation)

2. Enhance existing Konva implementations with additional features:
   - Add more shape types to the `useKonvaCanvas` hook (rectangles, polygons, etc.)
   - Implement drag-and-drop functionality for relevant exercises
   - Add animation capabilities for feedback and celebrations

## Testing Strategy

1. Test each converted component individually:
   - Verify that all functionality works as expected
   - Ensure touch events work properly for mobile devices
   - Check performance with complex drawings/interactions

2. Test the components in the context of a complete assignment:
   - Verify that responses are saved correctly
   - Ensure that the UI is consistent across different exercise types
   - Test the overall user experience flow

## Implementation Timeline

1. Phase 1 (Tracing Exercise): 1-2 days
2. Phase 2 (Counting Exercise): 1 day
3. Phase 3 (Review and Enhancement): 1-2 days

Total estimated time: 3-5 days
