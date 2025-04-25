import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { studentProgressService } from '@/services/studentProgressService';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CelebrationAnimation } from '@/components/ui/celebration-animation';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Clock, Award } from 'lucide-react';
import {
  InteractiveAssignment,
  InteractiveQuestion,
  InteractiveResponse,
  InteractiveSubmission
} from '@/types/interactiveAssignment';

// Import simplified exercise renderer
import { SimplifiedExerciseRenderer } from '@/components/interactive/simplified-exercise-renderer';

interface AssignmentPlayerProps {
  assignmentId?: string;
  isPlayMode?: boolean;
}

export default function AssignmentPlayer({ assignmentId, isPlayMode = false }: AssignmentPlayerProps = {}) {
  const params = useParams<{ id: string }>();
  const id = assignmentId || params.id;
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [assignment, setAssignment] = useState<InteractiveAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, InteractiveResponse>>({});
  const [progressId, setProgressId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await interactiveAssignmentService.getById(id);

        if (!data) {
          toast.error('Assignment not found');
          isPlayMode ? navigate('/') : navigate('/interactive-assignments');
          return;
        }

        // Sort questions by order
        if (data.questions) {
          data.questions.sort((a, b) => a.order - b.order);
        }

        setAssignment(data);

        // Only track progress if user is logged in and not in play mode
        if (profile?.id && !isPlayMode) {
          // Check if student has already started this assignment
          if (profile?.role === 'STUDENT') {
            const progress = await studentProgressService.getByStudentAndAssignment(profile.id, id);

            if (progress) {
              setProgressId(progress.id);

              // If there are existing responses, load them
              if (progress.status === 'COMPLETED' || progress.status === 'GRADED') {
                const submission = await interactiveAssignmentService.getSubmissionByStudentAndAssignment(profile.id, id);

                if (submission && submission.responses) {
                  const responseMap: Record<string, InteractiveResponse> = {};
                  submission.responses.forEach(response => {
                    responseMap[response.questionId] = response;
                  });

                  setResponses(responseMap);
                  setSubmitted(true);
                  setScore(progress.score || null);
                }
              }
            } else {
              // Create new progress record
              const newProgress = await studentProgressService.create({
                studentId: profile.id,
                assignmentId: id,
                status: 'IN_PROGRESS'
              });

              if (newProgress) {
                setProgressId(newProgress.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
    setStartTime(new Date());
  }, [id, navigate, profile, isPlayMode]);

  // Handle response update
  const handleResponseUpdate = (questionId: string, responseData: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        id: '', // Will be set by the server
        submissionId: '', // Will be set by the server
        questionId,
        responseData,
        isCorrect: undefined // Will be evaluated on submission
      }
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (!assignment || !assignment.questions) return;

    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, show completion options
      setShowCelebration(true);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (!assignment) return;

    try {
      setSubmitting(true);

      // Calculate time spent
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds

      // Prepare responses array
      const responsesArray = Object.values(responses);

      // If user is logged in and has a profile, submit to the server
      if (profile?.id && progressId) {
        // Submit assignment
        const submission = await interactiveAssignmentService.createSubmission({
          assignmentId: assignment.id,
          studentId: profile.id,
          responses: responsesArray
        });

        if (submission) {
          // Update progress
          await studentProgressService.update(progressId, {
            completedAt: new Date(),
            timeSpent,
            status: 'COMPLETED',
            score: submission.score
          });

          setSubmitted(true);
          setScore(submission.score || null);
          toast.success('Assignment submitted successfully!');
        }
      } else {
        // For anonymous users or play mode without login
        // Just mark as submitted locally without saving to server
        setSubmitted(true);

        // Calculate a simple score based on the number of responses
        const totalQuestions = assignment.questions?.length || 0;
        const answeredQuestions = responsesArray.length;
        const calculatedScore = Math.round((answeredQuestions / totalQuestions) * 100);

        setScore(calculatedScore);
        toast.success('Great job completing the assignment!');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
      setShowCelebration(false);
    }
  };

  // Render current question
  const renderQuestion = () => {
    if (!assignment || !assignment.questions || assignment.questions.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500">No questions available for this assignment.</p>
          </CardContent>
        </Card>
      );
    }

    const question = assignment.questions[currentQuestionIndex];
    const response = responses[question.id];
    // In play mode, the assignment is never read-only unless submitted
    const isReadOnly = isPlayMode ? submitted : submitted;

    // Use the SimplifiedExerciseRenderer component to render the appropriate exercise type
    return (
      <SimplifiedExerciseRenderer
        question={question}
        initialResponse={response}
        readOnly={isReadOnly}
        showAnswers={submitted}
        onSave={(response) => handleResponseUpdate(question.id, response.responseData)}
      />
    );
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!assignment || !assignment.questions) return 0;
    return Math.round((currentQuestionIndex / assignment.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500">Assignment not found.</p>
            <Button
              className="mt-4"
              onClick={() => isPlayMode ? navigate('/') : navigate('/interactive-assignments')}
            >
              {isPlayMode ? 'Go to Home' : 'Back to Assignments'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render completion screen for play mode
  if (isPlayMode && submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">Assignment Completed!</h2>
            <p>Great job completing this interactive assignment</p>
          </div>

          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Award className="h-16 w-16 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold mb-2">Your Score: {score || 0}%</h3>
              <p className="text-gray-500 mb-6">You've successfully completed this assignment</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Assignment</h4>
                  <p>{assignment.title}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Questions Answered</h4>
                  <p>{Object.keys(responses).length} of {assignment.questions?.length || 0}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return Home
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Reset the state to try again
                    setSubmitted(false);
                    setResponses({});
                    setCurrentQuestionIndex(0);
                    setScore(null);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {isPlayMode && !submitted ? "Play: " : ""}{assignment.title}
              </CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
              {isPlayMode && !submitted && (
                <p className="mt-2 text-sm text-blue-600">
                  Complete this interactive assignment by answering all questions
                </p>
              )}
            </div>

            {submitted && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Completed</span>
                {score !== null && (
                  <span className="ml-2 bg-green-100 px-2 py-1 rounded-full text-sm">
                    Score: {score}%
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              Question {currentQuestionIndex + 1} of {assignment.questions?.length || 0}
            </div>
          </div>

          {renderQuestion()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0 || submitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {isPlayMode && !submitted && (
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Exit
              </Button>
            )}

            {currentQuestionIndex < (assignment.questions?.length || 0) - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={submitting}
                className={isPlayMode ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowCelebration(true)}
                disabled={submitting || submitted}
                className={isPlayMode ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isPlayMode ? "Complete" : "Finish"}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Celebration animation */}
      <CelebrationAnimation
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
        message={isPlayMode ? "Awesome Work!" : "Great Job!"}
        subMessage={isPlayMode
          ? "You've completed this interactive assignment. Submit to see your results!"
          : "You've completed all the questions. Ready to submit?"}
        actionLabel="Submit Assignment"
        onAction={handleSubmit}
        character={isPlayMode ? "student" : "teacher"}
      />
    </div>
  );
}
