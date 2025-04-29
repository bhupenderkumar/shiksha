import React from 'react';
import { EnhancedMatchingExercise } from '@/components/interactive/EnhancedMatchingExercise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EnhancedMatchingDemo() {
  // Sample matching question data
  const sampleQuestion = {
    id: 'match-demo-1',
    questionText: 'Match the animals with their homes',
    questionData: {
      pairs: [
        {
          id: 'pair1',
          left: 'Bird',
          right: 'Nest',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: 'pair2',
          left: 'Fish',
          right: 'Ocean',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: 'pair3',
          left: 'Bee',
          right: 'Hive',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: 'pair4',
          left: 'Dog',
          right: 'Kennel',
          leftType: 'text',
          rightType: 'text'
        },
        {
          id: 'pair5',
          left: 'Rabbit',
          right: 'Burrow',
          leftType: 'text',
          rightType: 'text'
        }
      ]
    }
  };

  // Sample image-based matching question
  const imageMatchingQuestion = {
    id: 'match-demo-2',
    questionText: 'Match the fruits with their names',
    questionData: {
      pairs: [
        {
          id: 'fruit1',
          left: 'https://cdn.pixabay.com/photo/2016/10/09/17/06/apples-1726045_640.jpg',
          right: 'Apple',
          leftType: 'image',
          rightType: 'text'
        },
        {
          id: 'fruit2',
          left: 'https://cdn.pixabay.com/photo/2016/01/03/17/59/bananas-1119790_640.jpg',
          right: 'Banana',
          leftType: 'image',
          rightType: 'text'
        },
        {
          id: 'fruit3',
          left: 'https://cdn.pixabay.com/photo/2017/01/20/15/06/oranges-1995056_640.jpg',
          right: 'Orange',
          leftType: 'image',
          rightType: 'text'
        },
        {
          id: 'fruit4',
          left: 'https://cdn.pixabay.com/photo/2018/04/29/11/54/strawberries-3359755_640.jpg',
          right: 'Strawberry',
          leftType: 'image',
          rightType: 'text'
        }
      ]
    }
  };

  // Handle save response
  const handleSave = (response: any) => {
    console.log('Saved response:', response);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/demo">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Demos
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Enhanced Matching Exercise Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This is a demonstration of the enhanced matching exercise with improved UI/UX for children.
            The exercise features:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Side-by-side visual layout</li>
            <li>Intuitive drag-and-drop interaction</li>
            <li>Visual cues with colors and connecting lines</li>
            <li>Simplified language for children</li>
            <li>Immediate feedback on matched items</li>
          </ul>
          <p>Try matching the items below by dragging from one column to the other.</p>
        </CardContent>
      </Card>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Text Matching Example</h2>
        <EnhancedMatchingExercise
          question={sampleQuestion}
          onSave={handleSave}
          childFriendly={true}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Image Matching Example</h2>
        <EnhancedMatchingExercise
          question={imageMatchingQuestion}
          onSave={handleSave}
          childFriendly={true}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Standard Style (Non-Child-Friendly)</h2>
        <EnhancedMatchingExercise
          question={sampleQuestion}
          onSave={handleSave}
          childFriendly={false}
        />
      </div>
    </div>
  );
}
