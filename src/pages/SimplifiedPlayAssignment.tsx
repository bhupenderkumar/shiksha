import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { anonymousUserService } from '@/services/anonymousUserService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { Award, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { SimplifiedExerciseRenderer } from '@/components/interactive/simplified-exercise-renderer';
import { Progress } from '@/components/ui/progress';
import { InteractiveQuestion, InteractiveResponse } from '@/types/interactiveAssignment';
import { useAnonymousUser } from '@/contexts/AnonymousUserContext';
import UserRegistrationModal from '@/components/anonymous-user/UserRegistrationModal';
import UserProfileHeader from '@/components/anonymous-user/UserProfileHeader';
import CompletedAssignmentsSidebar from '@/components/anonymous-user/CompletedAssignmentsSidebar';

export default function SimplifiedPlayAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { anonymousUser, loading: userLoading } = useAnonymousUser();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
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

  // We'll only show registration modal when user tries to interact with the assignment
  // This allows viewing the assignment without registration

  // Start tracking progress when user and assignment are available
  useEffect(() => {
    const trackProgress = async () => {
      if (anonymousUser && assignment && assignment.id) {
        try {
          await anonymousUserService.startProgress(anonymousUser.id, assignment.id);
        } catch (error) {
          console.error('Error tracking progress:', error);
        }
      }
    };

    trackProgress();
  }, [anonymousUser, assignment]);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching assignment with ID/token:', id);

        // Clean the token - remove any path components or URL parts
        const token = id.split('/').pop() || id;
        console.log('Cleaned token:', token);

        // Use the public methods to get the assignment without requiring authentication
        console.log('Using public methods to get assignment with token:', token);
        const data = await interactiveAssignmentService.getPublicAssignmentByShareableLink(token);
        console.log('Public assignment result:', data);

        if (!data) {
          // Don't try to use the token directly as an ID - it's not a valid ID
          console.log('Assignment not found with token, checking if token is a numeric ID');

          // Only try direct ID lookup if the token is a valid numeric ID
          if (/^\d+$/.test(token)) {
            console.log('Token appears to be a numeric ID, trying direct lookup');
            const directTokenData = await interactiveAssignmentService.getPublicAssignmentById(token);
            console.log('Public direct token lookup result:', directTokenData);

            if (directTokenData) {
              setAssignment(directTokenData);
              setLoading(false);
              return;
            }
          }

          // If we haven't retried yet, try one more time after a short delay
          if (retryCount < 1) {
            console.log('Retrying after delay...');
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
            return;
          }

          setError('Assignment not found or link has expired');
          setLoading(false);
          return;
        }

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
    // If user is not logged in, show registration modal
    if (!anonymousUser && !userLoading) {
      setShowRegistrationModal(true);
      toast.info('Please register to save your progress', { duration: 3000 });
      return;
    }

    const updatedResponses = {
      ...responses,
      [questionId]: {
        id: '',
        submissionId: '',
        questionId,
        responseData,
        isCorrect: true // We'll assume correct for now
      }
    };

    setResponses(updatedResponses);

    // Save progress to database if user is logged in
    if (anonymousUser && assignment) {
      anonymousUserService.updateProgress(anonymousUser.id, assignment.id, updatedResponses);
    }

    // Show success message
    toast.success('Answer saved!', { duration: 1500 });
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!assignment || !assignment.questions || assignment.questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / assignment.questions.length) * 100;
  };

  const handleComplete = () => {
    // If user is not logged in, show registration modal
    if (!anonymousUser && !userLoading) {
      setShowRegistrationModal(true);
      toast.info('Please register to save your progress and complete the assignment', { duration: 3000 });
      return;
    }

    setSubmitting(true);

    // Calculate a score based on the number of responses
    const totalQuestions = assignment.questions?.length || 0;
    const answeredQuestions = Object.keys(responses).length;
    const calculatedScore = Math.round((answeredQuestions / totalQuestions) * 100);

    setScore(calculatedScore);
    setCompleted(true);
    setSubmitting(false);
    toast.success('Assignment completed successfully!');

    // Save completion to database if user is logged in
    if (anonymousUser && assignment) {
      anonymousUserService.completeProgress(
        anonymousUser.id,
        assignment.id,
        calculatedScore,
        responses
      );
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

  // Handle registration success
  const handleRegistrationSuccess = () => {
    // Continue with the assignment after registration
    console.log("Registration successful, continuing with assignment");

    // Force reload the assignment to ensure it loads with the new user session
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
          <span className="text-sm">Loading assignment...</span>
          <UserProfileHeader />
        </div>

        <div className="flex items-center justify-center min-h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>

        {/* User Registration Modal */}
        <UserRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
          includeMathExercise={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
          <span className="text-sm">Interactive Assignment</span>
          <UserProfileHeader />
        </div>
        <CompletedAssignmentsSidebar />

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

        {/* User Registration Modal */}
        <UserRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
          includeMathExercise={true}
        />
      </div>
    );
  }

  // Render completion screen
  if (completed) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
          <span className="text-sm">You've completed the assignment!</span>
          <UserProfileHeader />
        </div>
        <CompletedAssignmentsSidebar />

        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Great Job!</h2>
              <p>You've completed this interactive assignment</p>
            </div>

            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-6">
                  <Award className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>

                <h3 className="text-2xl font-bold mb-2">Your Score: {score || 0}%</h3>

                <div className="mt-8">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/')}
                  >
                    Continue
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
      <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
        <span className="text-sm">You're playing an interactive assignment. Have fun!</span>
        <UserProfileHeader />
      </div>
      <CompletedAssignmentsSidebar />

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {assignment.title}
                </CardTitle>
                <CardDescription>{assignment.description}</CardDescription>
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
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex < (assignment.questions?.length || 0) - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
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
          </CardFooter>
        </Card>
      </div>

      {/* User Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
        includeMathExercise={true}
      />
    </div>
  );
}
