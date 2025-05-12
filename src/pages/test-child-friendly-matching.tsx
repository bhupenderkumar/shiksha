import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { preloadSounds } from '@/lib/sound-effects';
import { Volume2, VolumeX } from 'lucide-react';
import { ChildFriendlyMatchingExercise } from '@/components/interactive/child-friendly-matching-exercise';

export default function TestChildFriendlyMatching() {
  const [showAnswers, setShowAnswers] = useState(false);
  const [enableSounds, setEnableSounds] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  // Parse URL parameters when component mounts
  useEffect(() => {
    // Preload sounds
    preloadSounds();

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check if standalone mode
    if (urlParams.get('standalone') === 'true') {
      setIsStandalone(true);
      setEnableSounds(true);
      setEnableAnimations(true);
    }

    // Check other settings
    if (urlParams.get('sounds') === 'false') setEnableSounds(false);
    if (urlParams.get('animations') === 'false') setEnableAnimations(false);
    if (urlParams.get('showAnswers') === 'true') setShowAnswers(true);
  }, []);

  // Sample question data for animals and their habitats
  const animalMatchingQuestion = {
    id: uuidv4(),
    questionText: 'Match the animals to their habitats',
    questionData: {
      pairs: [
        {
          id: uuidv4(),
          left: '🐠',
          right: '🌊',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🐘',
          right: '🌿',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🐦',
          right: '🌳',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🐝',
          right: '🌸',
          leftType: 'text',
          rightType: 'text'
        }
      ]
    }
  };

  // Sample question data for shapes and colors
  const shapeColorMatchingQuestion = {
    id: uuidv4(),
    questionText: 'Match the shapes to their colors',
    questionData: {
      pairs: [
        {
          id: uuidv4(),
          left: '🔴',
          right: 'Red',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🟡',
          right: 'Yellow',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🟢',
          right: 'Green',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: uuidv4(),
          left: '🔵',
          right: 'Blue',
          leftType: 'text',
          rightType: 'text'
        }
      ]
    }
  };

  const handleSave = (response: any) => {
    console.log('Saved response:', response);
  };

  // Render standalone mode (just the exercise)
  if (isStandalone) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-800">
              Child-Friendly Matching Exercise
            </h1>
            <p className="text-sm text-blue-600">
              Drag items from the left to their matching items on the right.
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

        <Card className="mb-6">
          <CardContent className="pt-6">
            <ChildFriendlyMatchingExercise
              question={animalMatchingQuestion}
              showAnswers={showAnswers}
              onSave={handleSave}
              enableSounds={enableSounds}
              enableAnimations={enableAnimations}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render full page with settings
  return (
    <div className="container mx-auto py-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
        <h1 className="text-2xl font-bold mb-2 text-blue-800">Child-Friendly Matching Exercise</h1>
        <p className="text-blue-600 mb-4">
          Test the improved drag-and-drop matching exercise designed for preschool children.
        </p>
        <p className="text-sm text-blue-500">
          This page demonstrates an enhanced drag-and-drop interface with visual connections between matched items,
          immediate feedback, and child-friendly interactions.
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
                id="enable-animations"
                checked={enableAnimations}
                onCheckedChange={setEnableAnimations}
              />
              <Label htmlFor="enable-animations" className="flex items-center">
                Enable Animations
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4 space-x-2">
        <Button
          onClick={() => window.open('/test-child-friendly-matching?standalone=true', '_blank')}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          Open in New Window
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Animals and Habitats</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildFriendlyMatchingExercise
              question={animalMatchingQuestion}
              showAnswers={showAnswers}
              onSave={handleSave}
              enableSounds={enableSounds}
              enableAnimations={enableAnimations}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shapes and Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildFriendlyMatchingExercise
              question={shapeColorMatchingQuestion}
              showAnswers={showAnswers}
              onSave={handleSave}
              enableSounds={enableSounds}
              enableAnimations={enableAnimations}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}