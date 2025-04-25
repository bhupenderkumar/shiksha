import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TracingExerciseKonva from '@/components/interactive/tracing-exercise-konva';
import CountingExerciseKonva from '@/components/interactive/counting-exercise-konva';
import ColoringExerciseKonva from '@/components/interactive/coloring-exercise-konva';
import DrawingExercise from '@/components/interactive/drawing-exercise';

export default function KonvaTestPage() {
  const [activeTab, setActiveTab] = useState('tracing');
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleSaveResponse = (type: string, response: any) => {
    setResponses(prev => ({
      ...prev,
      [type]: response
    }));
    console.log(`Saved ${type} response:`, response);
  };

  // Sample question data for testing
  const tracingQuestion = {
    id: 'tracing-test-1',
    questionText: 'Trace the letter A',
    questionData: {
      letterOrShape: 'A',
      canvasWidth: 400,
      canvasHeight: 400,
      strokeWidth: 5,
      difficulty: 'medium' as const,
      guidePoints: [
        { x: 0.2, y: 0.8 },
        { x: 0.5, y: 0.2 },
        { x: 0.8, y: 0.8 },
        { x: 0.35, y: 0.5 },
        { x: 0.65, y: 0.5 }
      ]
    }
  };

  const countingQuestion = {
    id: 'counting-test-1',
    questionText: 'Count the apples',
    questionData: {
      imageUrl: 'https://img.freepik.com/free-vector/apple-fruit-cartoon-icon-illustration_138676-2383.jpg',
      itemsToCount: 'apples',
      correctCount: 5,
      minCount: 0,
      maxCount: 10,
      showNumbers: true,
      canvasWidth: 600,
      canvasHeight: 400
    }
  };

  const drawingQuestion = {
    id: 'drawing-test-1',
    questionText: 'Draw a house',
    questionData: {
      instructions: 'Draw a house with a door and windows',
      canvasWidth: 600,
      canvasHeight: 400
    }
  };

  const coloringQuestion = {
    id: 'coloring-test-1',
    questionText: 'Color the shapes',
    questionData: {
      imageUrl: 'https://www.coloring-page.net/coloring/shapes/shapes_1.jpg',
      regions: [
        {
          id: 'region1',
          name: 'Circle',
          expectedColor: '#FF0000'
        },
        {
          id: 'region2',
          name: 'Square',
          expectedColor: '#0000FF'
        },
        {
          id: 'region3',
          name: 'Triangle',
          expectedColor: '#00FF00'
        }
      ]
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Konva Exercise Test Page</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="tracing">Tracing Exercise</TabsTrigger>
          <TabsTrigger value="counting">Counting Exercise</TabsTrigger>
          <TabsTrigger value="coloring">Coloring Exercise</TabsTrigger>
          <TabsTrigger value="drawing">Drawing Exercise</TabsTrigger>
        </TabsList>

        <TabsContent value="tracing">
          <Card>
            <CardHeader>
              <CardTitle>Tracing Exercise (Konva)</CardTitle>
            </CardHeader>
            <CardContent>
              <TracingExerciseKonva
                question={tracingQuestion}
                onSave={(response) => handleSaveResponse('tracing', response)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counting">
          <Card>
            <CardHeader>
              <CardTitle>Counting Exercise (Konva)</CardTitle>
            </CardHeader>
            <CardContent>
              <CountingExerciseKonva
                question={countingQuestion}
                onSave={(response) => handleSaveResponse('counting', response)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coloring">
          <Card>
            <CardHeader>
              <CardTitle>Coloring Exercise (Konva)</CardTitle>
            </CardHeader>
            <CardContent>
              <ColoringExerciseKonva
                question={coloringQuestion}
                onSave={(response) => handleSaveResponse('coloring', response)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawing">
          <Card>
            <CardHeader>
              <CardTitle>Drawing Exercise (Already using Konva)</CardTitle>
            </CardHeader>
            <CardContent>
              <DrawingExercise
                question={drawingQuestion}
                onSave={(response) => handleSaveResponse('drawing', response)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Saved Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {JSON.stringify(responses, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
