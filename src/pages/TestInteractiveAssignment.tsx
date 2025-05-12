import React, { useState, useEffect } from 'react';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { progressTrackingService } from '@/services/progressTrackingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioInstructions } from '@/components/ui/audio-instructions';
import { CelebrationFeedback } from '@/components/ui/celebration-feedback';
import { ShareableLink } from '@/components/ui/shareable-link';
import { useAuth } from '@/lib/auth-provider';
import { toast } from 'react-hot-toast';

export default function TestInteractiveAssignment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testAssignmentId, setTestAssignmentId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sample audio URL - replace with your actual audio file
  const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const createTestAssignment = async () => {
    if (!user) {
      toast.error('You must be logged in to create an assignment');
      return;
    }

    setLoading(true);
    try {
      const assignment = await interactiveAssignmentService.create({
        title: 'Test Assignment',
        description: 'This is a test assignment for the interactive educational platform',
        type: 'MATCHING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        classId: 'CLS201', // Replace with an actual class ID
        subjectId: 'SUB201', // Replace with an actual subject ID
        audioInstructions: sampleAudioUrl,
        difficultyLevel: 'beginner',
        estimatedTimeMinutes: 10,
        hasAudioFeedback: true,
        hasCelebration: true,
        ageGroup: 'nursery',
        requiresParentHelp: false,
        questions: [
          {
            questionType: 'MATCHING',
            questionText: 'Match the animals with their sounds',
            questionData: {
              pairs: [
                { id: '1', left: 'Dog', right: 'Woof', leftType: 'text', rightType: 'text' },
                { id: '2', left: 'Cat', right: 'Meow', leftType: 'text', rightType: 'text' },
                { id: '3', left: 'Cow', right: 'Moo', leftType: 'text', rightType: 'text' }
              ]
            },
            order: 1
          }
        ]
      }, user.id);

      if (assignment) {
        setTestAssignmentId(assignment.id);
        toast.success('Test assignment created successfully');
      }
    } catch (error) {
      console.error('Error creating test assignment:', error);
      toast.error('Failed to create test assignment');
    } finally {
      setLoading(false);
    }
  };

  const generateShareableLink = async () => {
    if (!testAssignmentId) {
      toast.error('Create a test assignment first');
      return;
    }

    setLoading(true);
    try {
      const link = await interactiveAssignmentService.generateShareableLink(testAssignmentId);
      if (link) {
        setShareableLink(link);
        toast.success('Shareable link generated successfully');
      }
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast.error('Failed to generate shareable link');
    } finally {
      setLoading(false);
    }
  };

  const testProgressTracking = async () => {
    if (!testAssignmentId || !user) {
      toast.error('Create a test assignment first and ensure you are logged in');
      return;
    }

    setLoading(true);
    try {
      // Update student progress
      await progressTrackingService.updateStudentProgress({
        studentId: 'your-student-id', // Replace with an actual student ID
        assignmentId: testAssignmentId,
        status: 'COMPLETED',
        completedAt: new Date(),
        score: 90,
        timeSpent: 300, // 5 minutes in seconds
        attempts: 1
      });

      // Update analytics
      await progressTrackingService.updateStudentAnalytics(
        'your-student-id', // Replace with an actual student ID
        'MATCHING'
      );

      // Check for milestones
      await progressTrackingService.checkAndCreateMilestones(
        'your-student-id', // Replace with an actual student ID
        testAssignmentId,
        'MATCHING'
      );

      toast.success('Progress tracking test completed successfully');
      setShowCelebration(true);
    } catch (error) {
      console.error('Error testing progress tracking:', error);
      toast.error('Failed to test progress tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Interactive Assignment Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Click the button below to create a test assignment with sample data.</p>
          <Button
            onClick={createTestAssignment}
            disabled={loading || !!testAssignmentId}
          >
            Create Test Assignment
          </Button>

          {testAssignmentId && (
            <div className="p-2 bg-green-50 border border-green-200 rounded">
              <p>Test assignment created with ID: {testAssignmentId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Audio Instructions Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AudioInstructions
            audioUrl={sampleAudioUrl}
            label="Listen to the instructions"
            childFriendly={true}
            onComplete={() => toast.success('Audio completed!')}
          />

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Child-friendly version:</h3>
            <AudioInstructions
              audioUrl={sampleAudioUrl}
              label="Listen to the story"
              childFriendly={true}
              showControls={false}
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Shareable Link Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateShareableLink}
            disabled={loading || !testAssignmentId || !!shareableLink}
          >
            Generate Shareable Link
          </Button>

          {shareableLink && (
            <div className="mt-4">
              <ShareableLink
                link={shareableLink}
                title="Test Assignment Link"
                description="Share this link with students to access the test assignment"
                expiryDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              />

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Compact version:</h3>
                <ShareableLink
                  link={shareableLink}
                  compact={true}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Click the button below to test the progress tracking functionality.</p>
          <Button
            onClick={testProgressTracking}
            disabled={loading || !testAssignmentId}
          >
            Test Progress Tracking
          </Button>
        </CardContent>
      </Card>

      <CelebrationFeedback
        show={showCelebration}
        message="Great job!"
        subMessage="You've successfully tested the celebration component!"
        ageGroup="nursery"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}
