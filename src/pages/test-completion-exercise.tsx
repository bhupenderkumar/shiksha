import React, { useState, useEffect } from 'react';
import { CompletionExercise } from '@/components/interactive/completion-exercise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { preloadSounds } from '@/lib/sound-effects';
import { Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { ExerciseCard } from '@/components/ui/exercise-card';
import { PlayButton } from '@/components/ui/play-button';
import { QRCodeButton } from '@/components/ui/qr-code-button';

export default function TestCompletionExercise() {
  const [useDragDrop, setUseDragDrop] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [enableSounds, setEnableSounds] = useState(true);
  const [enableHints, setEnableHints] = useState(true);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isStandalone, setIsStandalone] = useState(false);
  const [exampleType, setExampleType] = useState<'simple' | 'longer' | 'both'>('both');

  // Parse URL parameters when component mounts
  useEffect(() => {
    // Preload sounds
    preloadSounds();

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check if standalone mode
    if (urlParams.get('standalone') === 'true') {
      setIsStandalone(true);

      // Set default settings for standalone mode
      setUseDragDrop(true);
      setEnableSounds(true);
      setEnableHints(true);
      setEnableConfetti(true);
    }

    // Check which example to show
    const example = urlParams.get('example');
    if (example === 'simple') {
      setExampleType('simple');
    } else if (example === 'longer') {
      setExampleType('longer');
    } else {
      setExampleType('both');
    }

    // Check difficulty level
    const difficultyParam = urlParams.get('difficulty');
    if (difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard') {
      setDifficulty(difficultyParam);
    }

    // Check other settings
    if (urlParams.get('sounds') === 'false') setEnableSounds(false);
    if (urlParams.get('hints') === 'false') setEnableHints(false);
    if (urlParams.get('confetti') === 'false') setEnableConfetti(false);
    if (urlParams.get('showAnswers') === 'true') setShowAnswers(true);
  }, []);

  // Sample question data
  const sampleQuestion = {
    id: uuidv4(),
    questionText: 'Fill in the blanks with the correct words:',
    questionData: {
      text: 'The [blank1] jumped over the [blank2] fence to catch the [blank3].',
      blanks: [
        {
          id: uuidv4(),
          answer: 'dog',
          position: 1
        },
        {
          id: uuidv4(),
          answer: 'white',
          position: 2
        },
        {
          id: uuidv4(),
          answer: 'ball',
          position: 3
        }
      ]
    }
  };

  // Sample longer question
  const longerQuestion = {
    id: uuidv4(),
    questionText: 'Complete the paragraph with the correct words:',
    questionData: {
      text: 'Once upon a time, there was a [blank1] who lived in a [blank2] house. Every day, the [blank1] would go to the [blank3] to get some [blank4]. One day, a [blank5] appeared and asked for some [blank6].',
      blanks: [
        {
          id: uuidv4(),
          answer: 'girl',
          position: 1
        },
        {
          id: uuidv4(),
          answer: 'small',
          position: 2
        },
        {
          id: uuidv4(),
          answer: 'market',
          position: 3
        },
        {
          id: uuidv4(),
          answer: 'food',
          position: 4
        },
        {
          id: uuidv4(),
          answer: 'stranger',
          position: 5
        },
        {
          id: uuidv4(),
          answer: 'help',
          position: 6
        }
      ]
    }
  };

  const handleSave = (response: any) => {
    console.log('Saved response:', response);
    alert('Answer saved! Check console for details.');
  };

  // Render standalone mode (just the exercise)
  if (isStandalone) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-800">
              {exampleType === 'simple' ? 'Simple Completion Exercise' :
               exampleType === 'longer' ? 'Story Completion Exercise' :
               'Interactive Completion Exercise'}
            </h1>
            <p className="text-sm text-blue-600">
              Fill in the blanks by dragging the correct words to the empty spaces.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-blue-50 border-blue-200"
            onClick={() => window.close()}
          >
            Close Window
          </Button>
        </div>

        {/* Simple example */}
        {(exampleType === 'simple' || exampleType === 'both') && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <CompletionExercise
                question={sampleQuestion}
                useDragDrop={useDragDrop}
                showAnswers={showAnswers}
                onSave={handleSave}
                enableSounds={enableSounds}
                enableHints={enableHints}
                enableConfetti={enableConfetti}
                difficulty={difficulty}
                hintText="Try matching the words that make sense in the context of the sentence."
              />
            </CardContent>
          </Card>
        )}

        {/* Longer example */}
        {(exampleType === 'longer' || exampleType === 'both') && (
          <Card>
            <CardContent className="pt-6">
              <CompletionExercise
                question={longerQuestion}
                useDragDrop={useDragDrop}
                showAnswers={showAnswers}
                onSave={handleSave}
                enableSounds={enableSounds}
                enableHints={enableHints}
                enableConfetti={enableConfetti}
                difficulty={difficulty}
                hintText="Fill in the blanks to complete the story. Look for words that fit the narrative."
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render full page with settings
  return (
    <div className="container mx-auto py-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
        <h1 className="text-2xl font-bold mb-2 text-blue-800">Interactive Completion Exercise</h1>
        <p className="text-blue-600 mb-4">
          Test the drag-and-drop completion exercise with various settings and features.
        </p>
        <p className="text-sm text-blue-500">
          This page demonstrates an enhanced drag-and-drop interface for fill-in-the-blank exercises,
          with features like hints, confetti celebrations, difficulty levels, and more.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exercise Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="drag-drop-mode"
                checked={useDragDrop}
                onCheckedChange={setUseDragDrop}
              />
              <Label htmlFor="drag-drop-mode" className="flex items-center">
                Use Drag & Drop Mode
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-answers"
                checked={showAnswers}
                onCheckedChange={setShowAnswers}
              />
              <Label htmlFor="show-answers">Show Answers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-sounds"
                checked={enableSounds}
                onCheckedChange={setEnableSounds}
              />
              <Label htmlFor="enable-sounds" className="flex items-center">
                {enableSounds ? (
                  <><Volume2 className="h-4 w-4 mr-1" /> Enable Sounds</>
                ) : (
                  <><VolumeX className="h-4 w-4 mr-1" /> Sounds Disabled</>
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-hints"
                checked={enableHints}
                onCheckedChange={setEnableHints}
              />
              <Label htmlFor="enable-hints" className="flex items-center">
                Enable Hints
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-confetti"
                checked={enableConfetti}
                onCheckedChange={setEnableConfetti}
              />
              <Label htmlFor="enable-confetti" className="flex items-center">
                Enable Confetti
              </Label>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="difficulty" className="block mb-2">Difficulty Level</Label>
            <div className="flex space-x-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`difficulty-${level}`}
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={() => setDifficulty(level)}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor={`difficulty-${level}`} className="capitalize">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {difficulty === 'easy' ? 'No distractors' :
               difficulty === 'medium' ? 'Some distractors' :
               'More distractors and challenging options'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4 space-x-2">
        <QRCodeButton
          url="/test-completion-exercise?standalone=true"
          title="Test on Mobile Device"
          description="Scan this QR code with your mobile device to test the exercise"
          className="flex items-center"
        />
        <PlayButton
          url="/test-completion-exercise?standalone=true"
          label="Open in New Window"
          variant="outline"
          size="sm"
          className="flex items-center"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <ExerciseCard
          title="Simple Example"
          description="A basic sentence with three blanks to fill in."
          playUrl="/test-completion-exercise?example=simple&standalone=true"
          tags={['Basic', 'Short', 'Beginner']}
        >
          <CompletionExercise
            question={sampleQuestion}
            useDragDrop={useDragDrop}
            showAnswers={showAnswers}
            onSave={handleSave}
            enableSounds={enableSounds}
            enableHints={enableHints}
            enableConfetti={enableConfetti}
            difficulty={difficulty}
            hintText="Try matching the words that make sense in the context of the sentence."
          />
        </ExerciseCard>

        <ExerciseCard
          title="Longer Example"
          description="A paragraph with multiple blanks to complete the story."
          playUrl="/test-completion-exercise?example=longer&standalone=true"
          tags={['Paragraph', 'Story', 'Intermediate']}
        >
          <CompletionExercise
            question={longerQuestion}
            useDragDrop={useDragDrop}
            showAnswers={showAnswers}
            onSave={handleSave}
            enableSounds={enableSounds}
            enableHints={enableHints}
            enableConfetti={enableConfetti}
            difficulty={difficulty}
            hintText="Fill in the blanks to complete the story. Look for words that fit the narrative."
          />
        </ExerciseCard>
      </div>
    </div>
  );
}
