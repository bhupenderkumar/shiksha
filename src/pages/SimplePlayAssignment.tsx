import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { Award, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { SimplifiedExerciseRenderer } from '@/components/interactive/simplified-exercise-renderer';
import { Progress } from '@/components/ui/progress';
import { InteractiveQuestion, InteractiveResponse } from '@/types/interactiveAssignment';

export default function SimplePlayAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, InteractiveResponse>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      console.log('Fetching assignment with shared link ID:', id);

      try {
        // Clean the token - remove any path components or URL parts
        const token = id.split('/').pop() || id;
        console.log('Cleaned token for lookup:', token);

        // First try to directly decrypt the token
        const decrypted = interactiveAssignmentService.decryptAssignmentId(token);
        console.log('Decryption result:', decrypted);

        if (decrypted && !decrypted.expired) {
          // If we successfully decrypted the token, get the assignment by ID
          console.log('Getting assignment by ID:', decrypted.id);
          const assignmentData = await interactiveAssignmentService.getById(decrypted.id);

          if (assignmentData) {
            console.log('Assignment found by ID:', assignmentData);
            setAssignment(assignmentData);
            setLoading(false);
            return;
          }
        }

        // Fallback to the shareable link approach
        console.log('Attempting to get assignment with token:', token);
        const data = await interactiveAssignmentService.getByShareableLink(token);
        console.log('Response from getByShareableLink:', data);

        if (!data) {
          console.error('Assignment not found for token:', token);

          // If we haven't retried yet, try one more time after a short delay
          if (retryCount < 1) {
            console.log('Retrying after a short delay...');
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
            return;
          }

          setError('Assignment not found or link has expired');
          setLoading(false);
          return;
        }

        console.log('Assignment found:', data);
        setAssignment(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to load assignment');
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, navigate, retryCount]);

  // Handle response updates
  const handleResponseUpdate = (questionId: string, responseData: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        id: '',
        submissionId: '',
        questionId,
        responseData,
        isCorrect: true // We'll assume correct for now
      }
    }));
  };

  // Navigation functions
  const handleNextQuestion = () => {
    if (!assignment || !assignment.questions) return;

    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!assignment || !assignment.questions || assignment.questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / assignment.questions.length) * 100;
  };

  const handleComplete = () => {
    setSubmitting(true);

    // Calculate a score based on the number of responses
    const totalQuestions = assignment.questions?.length || 0;
    const answeredQuestions = Object.keys(responses).length;
    const calculatedScore = Math.round((answeredQuestions / totalQuestions) * 100);

    setScore(calculatedScore);
    setCompleted(true);
    setSubmitting(false);
    toast.success('Assignment completed successfully!');
  };

  const handleTryAgain = () => {
    setCompleted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setResponses({});
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
    const isReadOnly = completed;

    return (
      <SimplifiedExerciseRenderer
        question={question}
        initialResponse={response}
        readOnly={isReadOnly}
        showAnswers={completed}
        onSave={(response) => handleResponseUpdate(question.id, response.responseData)}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex flex-col space-y-4 items-center">
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/interactive-assignments')}>
                View All Assignments
              </Button>
              <p className="text-sm text-gray-400 mt-4">
                If you received this link from someone, please ask them to share it again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render completion screen
  if (completed) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="bg-blue-600 text-white p-2 text-center text-sm">
          You're playing an interactive assignment. Have fun!
        </div>
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
                    <h4 className="font-medium mb-2">Assignment Type</h4>
                    <p>{assignment.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the assignment
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="bg-blue-600 text-white p-2 text-center text-sm">
        You're playing an interactive assignment. Have fun!
      </div>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  Play: {assignment.title}
                </CardTitle>
                <CardDescription>{assignment.description}</CardDescription>
                <p className="mt-2 text-sm text-blue-600">
                  Complete this interactive assignment by answering all questions
                </p>
              </div>
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
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Exit
              </Button>

              {currentQuestionIndex < (assignment.questions?.length || 0) - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={submitting || completed}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
