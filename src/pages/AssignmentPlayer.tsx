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
import { ExerciseScoreCard } from '@/components/ui/exercise-scorecard';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Clock, Award, XCircle } from 'lucide-react';
import { playSound, preloadSounds } from '@/utils/soundUtils';
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

  // Preload sounds when component mounts
  useEffect(() => {
    preloadSounds();
  }, []);

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
    // Play a subtle click sound when a response is updated
    playSound('click', 0.2);

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

    // Play navigation sound
    playSound('click');

    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, show completion options
      setShowCelebration(true);
      playSound('complete');
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Play navigation sound
      playSound('click');
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // State to track if detailed results are ready
  const [resultsReady, setResultsReady] = useState(false);

  // Submit assignment
  const handleSubmit = async () => {
    if (!assignment) return;

    try {
      setSubmitting(true);
      setResultsReady(false); // Reset results ready state

      // Play submission sound
      playSound('click');

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

          // Set results ready immediately
          setResultsReady(true);

          // Play celebration sound
          playSound('celebration');

          toast.success('Assignment submitted successfully!');

          // Scroll to detailed results after a short delay
          setTimeout(() => {
            const detailedResultsElement = document.getElementById('detailed-results');
            if (detailedResultsElement) {
              detailedResultsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      } else {
        // For anonymous users or play mode without login
        // Just mark as submitted locally without saving to server
        setSubmitted(true);

        // Evaluate responses locally for play mode
        const totalQuestions = assignment.questions?.length || 0;

        // Process each response to determine if it's correct
        const evaluatedResponses: Record<string, InteractiveResponse> = {};
        let correctCount = 0;

        assignment.questions?.forEach(question => {
          const response = responses[question.id];
          if (!response) return;

          // Evaluate correctness based on question type
          let isCorrect = false;

          switch (question.questionType) {
            case 'MATCHING':
              // For matching, check if all pairs match the correct pairs
              const userPairs = response.responseData?.pairs || [];
              const correctPairs = question.questionData?.correctPairs || [];

              // Simple check - count matching pairs
              const matchingPairs = userPairs.filter(userPair =>
                correctPairs.some(correctPair =>
                  correctPair.leftId === userPair.leftId &&
                  correctPair.rightId === userPair.rightId
                )
              );

              isCorrect = matchingPairs.length === correctPairs.length;
              break;

            case 'MULTIPLE_CHOICE':
              // For multiple choice, check if selected option is correct
              const selectedOption = response.responseData?.selectedOption;
              const correctOption = question.questionData?.choices?.find((c: any) => c.isCorrect)?.id;
              isCorrect = selectedOption === correctOption;
              break;

            case 'ORDERING':
              // For ordering, check if items are in correct order
              const userOrder = response.responseData?.order || [];
              const correctOrder = question.questionData?.correctOrder || [];

              // Check if arrays are same length and all items match
              isCorrect = userOrder.length === correctOrder.length &&
                userOrder.every((item: any, index: number) => item === correctOrder[index]);
              break;

            case 'COMPLETION':
              // For completion, check if all blanks are filled correctly
              const userAnswers = response.responseData?.answers || [];
              const correctAnswers = question.questionData?.blanks || [];

              // Check if all answers match
              isCorrect = userAnswers.every((answer: any) => {
                const correctBlank = correctAnswers.find((b: any) => b.id === answer.blankId);
                return correctBlank && answer.answer.toLowerCase() === correctBlank.answer.toLowerCase();
              });
              break;

            default:
              // For other types, assume correct if there's a response
              isCorrect = true;
          }

          // Update the response with correctness
          evaluatedResponses[question.id] = {
            ...response,
            isCorrect
          };

          if (isCorrect) correctCount++;
        });

        // Update responses with evaluated ones
        setResponses(evaluatedResponses);

        // Calculate score based on correct answers
        const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
        setScore(calculatedScore);

        // Set results ready immediately
        setResultsReady(true);

        // Play celebration sound
        playSound('celebration');

        toast.success('Great job completing the assignment!');

        // Scroll to detailed results after a short delay
        setTimeout(() => {
          const detailedResultsElement = document.getElementById('detailed-results');
          if (detailedResultsElement) {
            detailedResultsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);

      // Play error sound
      playSound('incorrect');

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
    // Calculate correct and incorrect answers
    const correctAnswers = Object.values(responses).filter(response => response.isCorrect === true).length;
    const incorrectAnswers = Object.values(responses).filter(response => response.isCorrect === false).length;
    const totalQuestions = assignment.questions?.length || 0;

    // Log responses for debugging
    console.log('Responses in completion screen:', responses);
    console.log('Correct answers:', correctAnswers);
    console.log('Incorrect answers:', incorrectAnswers);

    // Helper function to get question by ID
    const getQuestionById = (id: string) => {
      return assignment.questions?.find(q => q.id === id);
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">Assignment Completed!</h2>
            <p>Great job completing this interactive assignment</p>
          </div>

          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-4">
              {/* Use our new ExerciseScoreCard component */}
              <ExerciseScoreCard
                score={score || 0}
                totalQuestions={totalQuestions}
                correctAnswers={correctAnswers}
                incorrectAnswers={incorrectAnswers}
                skippedAnswers={totalQuestions - Object.keys(responses).length}
                onContinue={() => navigate('/')}
                onTryAgain={() => {
                  // Reset the state to try again
                  setSubmitted(false);
                  setResponses({});
                  setCurrentQuestionIndex(0);
                  setScore(null);
                  setResultsReady(false);
                  playSound('click');
                }}
                showConfetti={true}
                className="mb-6 max-w-2xl w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Assignment</h4>
                  <p>{assignment.title}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Assignment Type</h4>
                  <p>{assignment.type}</p>
                </div>
              </div>

              {/* Direct link to detailed results */}
              <div className="mt-6 w-full max-w-2xl">
                <a
                  href="#detailed-results"
                  className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Award className="mr-2 h-5 w-5" />
                  <span className="font-bold">View Detailed Results</span>
                </a>
              </div>

              {/* Scroll indicator */}
              <div className="flex items-center justify-center mt-6 animate-bounce">
                <a href="#detailed-results" className="text-blue-600 flex flex-col items-center no-underline hover:underline">
                  <p className="font-bold">Scroll down for detailed results</p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
              </div>

              {/* Detailed Results Section */}
              <div id="detailed-results" className="w-full max-w-2xl mt-8 border-2 border-blue-500 p-4 rounded-lg bg-blue-50">
                <h3 className="text-2xl font-bold mb-4 text-center text-blue-800 uppercase tracking-wide">Detailed Results</h3>
                <p className="text-center text-blue-600 mb-4">See how you did on each question</p>

                <div className="bg-white border rounded-lg shadow-md overflow-hidden">
                  {assignment.questions?.map((question, index) => {
                    const response = responses[question.id];
                    const isCorrect = response?.isCorrect;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 border-b ${
                          isCorrect === true ? 'bg-green-50' :
                          isCorrect === false ? 'bg-red-50' : 'bg-gray-50'
                        } ${index === assignment.questions!.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCorrect === true ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isCorrect === false ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium">
                              Question {index + 1}: {question.questionText}
                            </h4>

                            {/* Show response details based on question type */}
                            {response && (
                              <div className="mt-2 text-sm">
                                {isCorrect === true ? (
                                  <p className="text-green-600">Correct answer! Great job!</p>
                                ) : isCorrect === false ? (
                                  <div>
                                    <p className="text-red-600 mb-1">Incorrect answer</p>
                                    {question.questionType === 'MATCHING' && (
                                      <p className="text-gray-600">
                                        Some matches were incorrect. Review the correct pairs.
                                      </p>
                                    )}
                                    {question.questionType === 'MULTIPLE_CHOICE' && (
                                      <p className="text-gray-600">
                                        The correct answer was: {
                                          question.questionData?.choices?.find(
                                            (c: any) => c.isCorrect
                                          )?.text || 'Not available'
                                        }
                                      </p>
                                    )}
                                    {question.questionType === 'ORDERING' && (
                                      <p className="text-gray-600">
                                        The items were not in the correct order.
                                      </p>
                                    )}
                                    {question.questionType === 'COMPLETION' && (
                                      <p className="text-gray-600">
                                        Some of the filled blanks were incorrect.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-600">This question was skipped.</p>
                                )}
                              </div>
                            )}

                            {!response && (
                              <p className="mt-2 text-sm text-gray-600">
                                This question was not attempted.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    setResultsReady(false);
                    playSound('click');
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
          {submitted ? (
            // Show detailed results when assignment is submitted
            <div className="w-full">
              <div id="detailed-results" className="mb-6 border-2 border-blue-500 p-4 rounded-lg bg-blue-50">
                <h3 className="text-2xl font-bold mb-4 text-center text-blue-800 uppercase tracking-wide">Detailed Results</h3>
                <p className="text-center text-blue-600 mb-4">See how you did on each question</p>

                {/* Calculate correct and incorrect answers */}
                {(() => {
                  const correctAnswers = Object.values(responses).filter(response => response.isCorrect === true).length;
                  const incorrectAnswers = Object.values(responses).filter(response => response.isCorrect === false).length;
                  const totalQuestions = assignment.questions?.length || 0;

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Correct</p>
                          <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg text-center">
                          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Incorrect</p>
                          <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <Award className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="text-xl font-bold text-blue-600">{score || 0}%</p>
                        </div>
                      </div>

                      {/* Direct link to detailed results */}
                      <div className="mb-6">
                        <a
                          href="#detailed-results"
                          className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Award className="mr-2 h-5 w-5" />
                          <span className="font-bold">View Detailed Results</span>
                        </a>
                      </div>
                    </>
                  );
                })()}

                {/* List of questions with results */}
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  {assignment.questions?.map((question, index) => {
                    const response = responses[question.id];
                    const isCorrect = response?.isCorrect;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 border-b ${
                          isCorrect === true ? 'bg-green-50' :
                          isCorrect === false ? 'bg-red-50' : 'bg-gray-50'
                        } ${index === assignment.questions!.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCorrect === true ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isCorrect === false ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium">
                              Question {index + 1}: {question.questionText}
                            </h4>

                            {/* Show response details based on question type */}
                            {response && (
                              <div className="mt-2 text-sm">
                                {isCorrect === true ? (
                                  <p className="text-green-600">Correct answer! Great job!</p>
                                ) : isCorrect === false ? (
                                  <div>
                                    <p className="text-red-600 mb-1">Incorrect answer</p>
                                    {question.questionType === 'MATCHING' && (
                                      <p className="text-gray-600">
                                        Some matches were incorrect. Review the correct pairs.
                                      </p>
                                    )}
                                    {question.questionType === 'MULTIPLE_CHOICE' && (
                                      <p className="text-gray-600">
                                        The correct answer was: {
                                          question.questionData?.choices?.find(
                                            (c: any) => c.isCorrect
                                          )?.text || 'Not available'
                                        }
                                      </p>
                                    )}
                                    {question.questionType === 'ORDERING' && (
                                      <p className="text-gray-600">
                                        The items were not in the correct order.
                                      </p>
                                    )}
                                    {question.questionType === 'COMPLETION' && (
                                      <p className="text-gray-600">
                                        Some of the filled blanks were incorrect.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-600">This question was skipped.</p>
                                )}
                              </div>
                            )}

                            {!response && (
                              <p className="mt-2 text-sm text-gray-600">
                                This question was not attempted.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/interactive-assignments')}
                  className="mr-4"
                >
                  Back to Assignments
                </Button>
                <Button
                  onClick={() => {
                    // Reset the state to try again
                    setSubmitted(false);
                    setResponses({});
                    setCurrentQuestionIndex(0);
                    setScore(null);
                    setResultsReady(false);
                    playSound('click');
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            // Show the current question when not submitted
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  Question {currentQuestionIndex + 1} of {assignment.questions?.length || 0}
                </div>
              </div>

              {renderQuestion()}
            </>
          )}
        </CardContent>

        {!submitted && (
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
        )}
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
