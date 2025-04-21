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

// Import exercise components (we'll create these next)
import { MatchingExercise } from '@/components/assignment-player/MatchingExercise';
import { CompletionExercise } from '@/components/assignment-player/CompletionExercise';
import { SortingExercise } from '@/components/assignment-player/SortingExercise';
import { PuzzleExercise } from '@/components/assignment-player/PuzzleExercise';
import { IdentificationExercise } from '@/components/assignment-player/IdentificationExercise';
import { CountingExercise } from '@/components/assignment-player/CountingExercise';
import { TracingExercise } from '@/components/assignment-player/TracingExercise';
import { AudioReadingExercise } from '@/components/assignment-player/AudioReadingExercise';
import { DrawingExercise } from '@/components/assignment-player/DrawingExercise';
import { ColoringExercise } from '@/components/assignment-player/ColoringExercise';
import { MultipleChoiceExercise } from '@/components/assignment-player/MultipleChoiceExercise';
import { OrderingExercise } from '@/components/assignment-player/OrderingExercise';

export default function AssignmentPlayer() {
  const { id } = useParams<{ id: string }>();
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
          navigate('/assignments');
          return;
        }
        
        // Sort questions by order
        if (data.questions) {
          data.questions.sort((a, b) => a.order - b.order);
        }
        
        setAssignment(data);
        
        // Check if student has already started this assignment
        if (profile?.role === 'STUDENT' && profile.id) {
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
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignment();
    setStartTime(new Date());
  }, [id, navigate, profile]);
  
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
    if (!assignment || !profile?.id || !progressId) return;
    
    try {
      setSubmitting(true);
      
      // Calculate time spent
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
      
      // Prepare responses array
      const responsesArray = Object.values(responses);
      
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
    const isReadOnly = submitted;
    
    // Render different exercise types based on question type
    switch (question.questionType) {
      case 'MATCHING':
        return (
          <MatchingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'COMPLETION':
        return (
          <CompletionExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'SORTING':
      case 'ORDERING':
        return (
          <OrderingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'PUZZLE':
        return (
          <PuzzleExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'IDENTIFICATION':
        return (
          <IdentificationExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'COUNTING':
        return (
          <CountingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'TRACING':
        return (
          <TracingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'AUDIO_READING':
        return (
          <AudioReadingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'DRAWING':
        return (
          <DrawingExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'COLORING':
        return (
          <ColoringExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceExercise
            question={question}
            initialResponse={response}
            onResponseChange={(data) => handleResponseUpdate(question.id, data)}
            readOnly={isReadOnly}
          />
        );
      default:
        return (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-gray-500">Unsupported question type: {question.questionType}</p>
            </CardContent>
          </Card>
        );
    }
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
              onClick={() => navigate('/assignments')}
            >
              Back to Assignments
            </Button>
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
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
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
            {currentQuestionIndex < (assignment.questions?.length || 0) - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={submitting}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowCelebration(true)}
                disabled={submitting || submitted}
              >
                Finish
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
        message="Great Job!"
        subMessage="You've completed all the questions. Ready to submit?"
        actionLabel="Submit Assignment"
        onAction={handleSubmit}
        character="teacher"
      />
    </div>
  );
}
