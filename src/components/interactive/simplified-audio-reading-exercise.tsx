import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { Play, Pause, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { AudioReadingQuestion, AudioReadingResponse } from '@/types/interactiveAssignment';

interface SimplifiedAudioReadingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: AudioReadingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: AudioReadingResponse;
  onSave?: (response: AudioReadingResponse) => void;
  showAnswers?: boolean;
}

export function SimplifiedAudioReadingExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false
}: SimplifiedAudioReadingExerciseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenedComplete, setListenedComplete] = useState(false);
  const [comprehensionAnswers, setComprehensionAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [currentWord, setCurrentWord] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const { text, audioUrl, highlightWords, comprehensionQuestions = [] } = question.questionData;
  
  // Initialize from initial response if available
  useEffect(() => {
    if (initialResponse) {
      setListenedComplete(initialResponse.listenedComplete || false);
      
      if (initialResponse.comprehensionAnswers) {
        setComprehensionAnswers(initialResponse.comprehensionAnswers);
      } else {
        setComprehensionAnswers(comprehensionQuestions.map(q => ({
          questionId: q.id,
          answer: ''
        })));
      }
    } else {
      // Initialize empty answers
      setComprehensionAnswers(comprehensionQuestions.map(q => ({
        questionId: q.id,
        answer: ''
      })));
    }
  }, [initialResponse, comprehensionQuestions]);
  
  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(audioUrl);
      
      // Set up audio events
      audioRef.current.addEventListener('ended', handleAudioEnded);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnded);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.pause();
        }
      };
    }
  }, [audioUrl]);
  
  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setListenedComplete(true);
    setCurrentWord(-1);
  };
  
  // Handle time update for word highlighting
  const handleTimeUpdate = () => {
    if (!highlightWords || !audioRef.current) return;
    
    // This is a simplified implementation
    // In a real implementation, you would have timestamps for each word
    // and highlight the current word based on the audio time
    
    const duration = audioRef.current.duration;
    const currentTime = audioRef.current.currentTime;
    
    if (duration > 0) {
      const words = text.split(' ');
      const wordIndex = Math.floor((currentTime / duration) * words.length);
      setCurrentWord(Math.min(wordIndex, words.length - 1));
    }
  };
  
  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast.error('Could not play audio. Please try again.');
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string) => {
    setComprehensionAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId ? { ...a, answer } : a
      )
    );
  };
  
  // Handle save
  const handleSave = () => {
    // Check if audio has been listened to
    if (!listenedComplete) {
      toast.error('Please listen to the audio before saving');
      return;
    }
    
    // Check if all questions have been answered
    const unansweredQuestions = comprehensionAnswers.filter(a => !a.answer);
    if (comprehensionQuestions.length > 0 && unansweredQuestions.length > 0) {
      toast.error('Please answer all questions before saving');
      return;
    }
    
    if (onSave) {
      onSave({
        listenedComplete,
        comprehensionAnswers
      });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setListenedComplete(false);
    setComprehensionAnswers(comprehensionQuestions.map(q => ({
      questionId: q.id,
      answer: ''
    })));
    setCurrentWord(-1);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsPlaying(false);
  };
  
  // Check if an answer is correct
  const isAnswerCorrect = (questionId: string, answer: string) => {
    const question = comprehensionQuestions.find(q => q.id === questionId);
    return question && question.correctAnswer === answer;
  };
  
  // Calculate score
  const calculateScore = () => {
    if (comprehensionQuestions.length === 0) return 100;
    
    const correctCount = comprehensionAnswers.filter(a => 
      isAnswerCorrect(a.questionId, a.answer)
    ).length;
    
    return Math.round((correctCount / comprehensionQuestions.length) * 100);
  };
  
  // Render text with highlighted words
  const renderText = () => {
    if (!highlightWords || currentWord === -1) {
      return <p className="leading-relaxed">{text}</p>;
    }
    
    const words = text.split(' ');
    
    return (
      <p className="leading-relaxed">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <span 
              className={index === currentWord ? 'bg-yellow-200 font-medium' : ''}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </p>
    );
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 mb-4">
        Listen to the audio and read along with the text.
        {comprehensionQuestions.length > 0 && ' Then answer the questions below.'}
      </p>
      
      {/* Score display when showing answers */}
      {showAnswers && comprehensionQuestions.length > 0 && (
        <Alert variant="info" className="mb-4">
          <p className="font-medium">
            Your score: {calculateScore()}%
          </p>
        </Alert>
      )}
      
      {/* Audio player */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-md">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant={isPlaying ? 'default' : 'outline'}
            onClick={togglePlayback}
            disabled={readOnly}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>
          
          {listenedComplete && (
            <div className="text-green-600 flex items-center">
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
          )}
        </div>
        
        {/* Text display */}
        <div 
          ref={textRef}
          className="p-4 bg-white border rounded-md"
        >
          {renderText()}
        </div>
      </div>
      
      {/* Comprehension questions */}
      {comprehensionQuestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3">Comprehension Questions</h4>
          
          <div className="space-y-6">
            {comprehensionQuestions.map((question, index) => {
              const answer = comprehensionAnswers.find(a => a.questionId === question.id)?.answer || '';
              const isCorrect = showAnswers && isAnswerCorrect(question.id, answer);
              const isIncorrect = showAnswers && answer && !isAnswerCorrect(question.id, answer);
              
              return (
                <div 
                  key={question.id}
                  className={`
                    p-4 border rounded-md
                    ${isCorrect ? 'bg-green-50 border-green-300' : ''}
                    ${isIncorrect ? 'bg-red-50 border-red-300' : ''}
                  `}
                >
                  <p className="font-medium mb-3">
                    {index + 1}. {question.question}
                  </p>
                  
                  <RadioGroup
                    value={answer}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                    disabled={readOnly}
                  >
                    <div className="space-y-2">
                      {question.options?.map(option => {
                        const isOptionCorrect = showAnswers && option === question.correctAnswer;
                        
                        return (
                          <div 
                            key={option}
                            className={`
                              flex items-start space-x-2 p-2 rounded
                              ${isOptionCorrect ? 'bg-green-100 dark:bg-green-900/40' : ''}
                            `}
                          >
                            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                            <div className="flex-1">
                              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                              
                              {isOptionCorrect && showAnswers && (
                                <span className="ml-2 text-xs text-green-600">
                                  (Correct answer)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Controls */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-2"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export default SimplifiedAudioReadingExercise;
