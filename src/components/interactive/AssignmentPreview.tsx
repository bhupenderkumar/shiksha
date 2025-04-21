import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Smartphone, Monitor } from 'lucide-react';

interface AssignmentPreviewProps {
  assignment: any;
  onClose: () => void;
}

export function AssignmentPreview({ assignment, onClose }: AssignmentPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showMetadata, setShowMetadata] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <TabsList>
            <TabsTrigger
              value="desktop"
              onClick={() => setViewMode('desktop')}
              className={viewMode === 'desktop' ? 'bg-primary text-white' : ''}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </TabsTrigger>
            <TabsTrigger
              value="mobile"
              onClick={() => setViewMode('mobile')}
              className={viewMode === 'mobile' ? 'bg-primary text-white' : ''}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            {showMetadata ? (
              <><EyeOff className="h-4 w-4 mr-2" /> Hide Metadata</>
            ) : (
              <><Eye className="h-4 w-4 mr-2" /> Show Metadata</>
            )}
          </Button>
        </div>
        <Button onClick={onClose}>Close Preview</Button>
      </div>

      <div className={`preview-container ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">{assignment.title}</h2>
            {showMetadata && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Difficulty: {assignment.difficultyLevel}</p>
                <p>Estimated Time: {assignment.estimatedTimeMinutes} minutes</p>
                <p>Age Group: {assignment.ageGroup}</p>
                <p>Due Date: {assignment.dueDate.toLocaleDateString()}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-600">{assignment.description}</p>
              
              {assignment.questions.map((question: any, index: number) => (
                <QuestionPreview
                  key={question.id}
                  question={question}
                  index={index}
                  showMetadata={showMetadata}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuestionPreview({ question, index, showMetadata }: {
  question: any;
  index: number;
  showMetadata: boolean;
}) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        {showMetadata && (
          <div className="mb-2 text-sm text-gray-500">
            Question {index + 1} | Type: {question.type} | Points: {question.points}
          </div>
        )}
        
        {/* Render different question types */}
        {question.type === 'MATCHING' && (
          <MatchingQuestionPreview question={question} />
        )}
        {/* Add other question type previews here */}
      </CardContent>
    </Card>
  );
}

function MatchingQuestionPreview({ question }: { question: any }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">{question.content.instruction}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {question.content.leftItems.map((item: any, index: number) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded border border-gray-200"
            >
              {item.text}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {question.content.rightItems.map((item: any, index: number) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded border border-gray-200"
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

