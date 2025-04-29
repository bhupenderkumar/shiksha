# Play Button and QR Code Features

This document explains how to use the Play Button and QR Code features for testing interactive exercises.

## Play Button

The Play Button allows you to open an exercise in a new window for testing. This is useful for:

1. Testing the exercise in isolation without other UI elements
2. Sharing a specific exercise with others
3. Testing on different screen sizes by resizing the window

### How to Use

1. Click the "Play" button on any exercise card
2. The exercise will open in a new browser window
3. You can interact with the exercise in the new window
4. Close the window when you're done testing

### URL Parameters

The Play Button uses URL parameters to configure the exercise:

- `standalone=true` - Opens the exercise in standalone mode
- `example=simple` or `example=longer` - Specifies which example to show
- `difficulty=easy|medium|hard` - Sets the difficulty level
- `sounds=false` - Disables sound effects
- `hints=false` - Disables hints
- `confetti=false` - Disables confetti celebrations
- `showAnswers=true` - Shows the correct answers

Example URL:
```
/test-completion-exercise?standalone=true&example=simple&difficulty=easy
```

## QR Code Button

The QR Code Button generates a QR code that you can scan with a mobile device to test the exercise on mobile.

### How to Use

1. Click the "QR Code" button
2. A dialog will appear with a QR code
3. Scan the QR code with your mobile device's camera
4. The exercise will open in your mobile browser
5. Test the exercise on your mobile device

### Benefits

- Test touch interactions on actual mobile devices
- Verify responsive design works correctly
- Test performance on mobile devices
- Share with others for testing without sending links

## Implementation Details

These features are implemented using:

1. `PlayButton` component in `src/components/ui/play-button.tsx`
2. `QRCodeButton` component in `src/components/ui/qr-code-button.tsx`
3. `ExerciseCard` component in `src/components/ui/exercise-card.tsx`

The QR code is generated using a free QR code API service.
