import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { AudioReadingQuestion } from '@/types/interactiveAssignment';
import { Play, Pause, RotateCcw, Check, Mic, Square, Volume2 } from 'lucide-react';

interface AudioReadingExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: AudioReadingQuestion;
  };
  readOnly?: boolean;
  initialResponse?: any;
  onSave?: (response: any) => void;
  showAnswers?: boolean;
}

export function AudioReadingExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: AudioReadingExerciseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState<number>(-1);
  const [words, setWords] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ id: string; answer: string }[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { text, audioUrl, highlightWords, comprehensionQuestions } = question.questionData;
  
  // Parse text into words
  useEffect(() => {
    if (text) {
      // Split text into words, preserving punctuation
      const parsedWords = text.match(/[\w']+|[.,!?;]/g) || [];
      setWords(parsedWords);
    }
  }, [text]);
  
  // Initialize answers from comprehension questions
  useEffect(() => {
    if (comprehensionQuestions) {
      const initialAnswers = comprehensionQuestions.map(q => ({
        id: q.id,
        answer: ''
      }));
      
      setAnswers(initialAnswers);
    }
    
    // Apply initial response if available
    if (initialResponse) {
      if (initialResponse.recordedAudio) {
        setRecordedAudio(initialResponse.recordedAudio);
      }
      
      if (initialResponse.answers) {
        setAnswers(initialResponse.answers);
      }
      
      if (initialResponse.completionPercentage) {
        setCompletionPercentage(initialResponse.completionPercentage);
      }
    }
  }, [comprehensionQuestions, initialResponse]);
  
  // Audio playback controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentWord(-1);
  };
  
  // Word highlighting during audio playback
  const handleTimeUpdate = () => {
    if (!audioRef.current || !highlightWords) return;
    
    const audio = audioRef.current;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    
    // Calculate which word to highlight based on current time
    // This is a simple implementation - in a real app, you'd need timestamps for each word
    const wordIndex = Math.floor((currentTime / duration) * words.length);
    setCurrentWord(wordIndex < words.length ? wordIndex : -1);
  };
  
  // Recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Set a default completion percentage since we can't actually analyze the audio
        setCompletionPercentage(100);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording saved');
    }
  };
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => 
      prev.map(a => a.id === questionId ? { ...a, answer: value } : a)
    );
  };
  
  const checkAnswers = () => {
    if (!comprehensionQuestions) return 0;
    
    let correctCount = 0;
    
    comprehensionQuestions.forEach(question => {
      const userAnswer = answers.find(a => a.id === question.id)?.answer || '';
      if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    
    return Math.round((correctCount / comprehensionQuestions.length) * 100);
  };
  
  const handleSave = () => {
    // Check if recording exists or comprehension questions are answered
    if (!recordedAudio && (!comprehensionQuestions || comprehensionQuestions.length === 0)) {
      toast.error('Please record your reading before saving');
      return;
    }
    
    // Check if all comprehension questions are answered
    if (comprehensionQuestions && comprehensionQuestions.length > 0) {
      const unansweredQuestions = answers.filter(a => !a.answer.trim());
      
      if (unansweredQuestions.length > 0 && !showAnswers) {
        toast.error('Please answer all comprehension questions');
        return;
      }
    }
    
    if (onSave) {
      onSave({
        recordedAudio,
        answers,
        completionPercentage: recordedAudio ? 100 : 0,
        comprehensionScore: checkAnswers()
      });
    }
  };
  
  const handleReset = () => {
    // Reset recording
    setRecordedAudio(null);
    
    // Reset answers
    if (comprehensionQuestions) {
      setAnswers(comprehensionQuestions.map(q => ({
        id: q.id,
        answer: ''
      })));
    }
    
    setCompletionPercentage(0);
  };
  
  // Render the text with highlighted words
  const renderText = () => {
    return (
      <div className="text-lg leading-relaxed p-4 bg-gray-50 rounded-md">
        {words.map((word, index) => (
          <span
            key={index}
            className={`
              ${currentWord === index ? 'bg-yellow-200' : ''}
              ${/[.,!?;]/.test(word) ? 'mr-0' : 'mr-1'}
            `}
          >
            {word}
          </span>
        ))}
      </div>
    );
  };
  
  // Render comprehension questions
  const renderComprehensionQuestions = () => {
    if (!comprehensionQuestions || comprehensionQuestions.length === 0) return null;
    
    return (
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3">Comprehension Questions</h4>
        
        <div className="space-y-4">
          {comprehensionQuestions.map((question, index) => {
            const answer = answers.find(a => a.id === question.id)?.answer || '';
            const isCorrect = showAnswers && answer.toLowerCase() === question.correctAnswer.toLowerCase();
            const isIncorrect = showAnswers && answer && answer.toLowerCase() !== question.correctAnswer.toLowerCase();
            
            return (
              <div key={question.id} className="border rounded-md p-4">
                <p className="font-medium mb-2">
                  {index + 1}. {question.question}
                </p>
                
                {question.options ? (
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question.id}-${optIndex}`}
                          name={question.id}
                          value={option}
                          checked={answer === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          disabled={readOnly}
                          className="mr-2"
                        />
                        <label htmlFor={`${question.id}-${optIndex}`}>
                          {option}
                        </label>
                        
                        {showAnswers && option.toLowerCase() === question.correctAnswer.toLowerCase() && (
                          <Check className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`
                    mt-2 border rounded p-2
                    ${isCorrect ? 'border-green-300 bg-green-50' : ''}
                    ${isIncorrect ? 'border-red-300 bg-red-50' : ''}
                  `}>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={readOnly}
                      placeholder="Type your answer here"
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                    
                    {showAnswers && (
                      <div className="mt-2 text-sm">
                        {isCorrect ? (
                          <span className="text-green-600">Correct!</span>
                        ) : (
                          <span className="text-red-600">
                            Correct answer: {question.correctAnswer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        {/* Audio player */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-medium">Listen to the passage:</h4>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex items-center"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </>
              )}
            </Button>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onTimeUpdate={handleTimeUpdate}
            className="w-full"
            controls={false}
          />
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Volume2 className="h-4 w-4 mr-1" />
            <span>Listen carefully and follow along with the highlighted text</span>
          </div>
        </div>
        
        {/* Reading text */}
        {renderText()}
        
        {/* Recording section */}
        {!readOnly && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Record your reading:</h4>
            
            <div className="flex items-center space-x-2">
              {!isRecording && !recordedAudio ? (
                <Button
                  onClick={startRecording}
                  className="flex items-center"
                >
                  <Mic className="h-4 w-4 mr-1" />
                  Start Recording
                </Button>
              ) : isRecording ? (
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                  className="flex items-center"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop Recording
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <audio src={recordedAudio || ''} controls className="max-w-md" />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecordedAudio(null)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Record Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Comprehension questions */}
        {renderComprehensionQuestions()}
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        {!readOnly && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default AudioReadingExercise;
