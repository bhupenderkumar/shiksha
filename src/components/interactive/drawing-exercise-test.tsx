import React, { useState } from 'react';
import { DrawingExercise } from './drawing/index';
import { DrawingQuestion, DrawingResponse } from '@/types/interactiveAssignment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DrawingExerciseTest() {
  const [response, setResponse] = useState<DrawingResponse | undefined>(undefined);

  // Sample question data
  const question = {
    id: 'test-drawing-1',
    questionText: 'Draw a picture of your favorite animal',
    questionData: {
      instructions: 'Use the drawing tools to create a picture of your favorite animal. Try to be as detailed as possible.',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop',
      canvasWidth: 800,
      canvasHeight: 600
    } as DrawingQuestion
  };

  const handleSave = (newResponse: DrawingResponse) => {
    console.log('Drawing saved:', newResponse);
    setResponse(newResponse);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Drawing Exercise Test</h1>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Drawing Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawingExercise
              question={question}
              initialResponse={response}
              onSave={handleSave}
            />
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Completion Percentage:</p>
                  <p>{response.completionPercentage}%</p>
                </div>

                <div>
                  <p className="font-medium">Drawing:</p>
                  <div className="border rounded-md overflow-hidden">
                    <img
                      src={response.drawingData}
                      alt="Saved drawing"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setResponse(undefined)}
                >
                  Clear Saved Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DrawingExerciseTest;
