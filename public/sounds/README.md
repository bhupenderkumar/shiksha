# Sound Files for Interactive Assignments

This directory contains sound files used for feedback in interactive assignments.

## Required Sound Files

The following sound files should be placed in this directory:

1. `correct.mp3` - Played when a student gives a correct answer
2. `incorrect.mp3` - Played when a student gives an incorrect answer
3. `celebration.mp3` - Played when a student completes an assignment
4. `click.mp3` - Played for UI interactions like button clicks
5. `complete.mp3` - Played when a section or exercise is completed

## Additional Sound Files for Drag-and-Drop Exercises

The following sound files are used specifically for drag-and-drop interactions:

1. `drop.mp3` - Played when dropping an item into a target area
2. `success.mp3` - Played when a correct match is made
3. `error.mp3` - Played when there's an error or incorrect match
4. `pop.mp3` - Played when removing an item from a container

## Sound File Specifications

- Format: MP3
- Duration: Keep sounds short (0.5-2 seconds) for immediate feedback
- Volume: Normalize audio to prevent sounds from being too loud
- Quality: 128kbps is sufficient for these types of sounds

## Obtaining Sound Files

You can obtain suitable sound files from:

1. Royalty-free sound libraries like [Freesound](https://freesound.org/)
2. Sound effect packs designed for educational applications
3. Create custom sounds using audio editing software

## Implementation Notes

The sound system is implemented in:
- `src/utils/soundUtils.ts` - Original sound utility
- `src/lib/sound-effects.ts` - Enhanced sound utility for drag-and-drop interactions

These utilities include:
- Functions to play sounds with adjustable volume
- Preloading of sounds for better performance
- Error handling for environments where audio might not be available
- Sound caching for improved performance

Sound files are referenced in components like:
- `SimplifiedMatchingExercise.tsx`
- `AssignmentPlayer.tsx`
- `ExerciseScoreCard.tsx`
- `AnswerFeedback.tsx`
- `DraggableCompletionExercise.tsx` - New drag-and-drop completion exercise

## Customization

To customize sounds:
1. Replace the MP3 files in this directory with your preferred sounds
2. Keep the same filenames to maintain compatibility
3. Ensure sounds are appropriate for the age group of students
