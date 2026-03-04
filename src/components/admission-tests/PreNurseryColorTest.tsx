import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TestComponentProps, TestResult } from './types';
import { useSoundEffects } from './useSoundEffects';

interface ColorQuestion {
  id: number;
  type: 'identify' | 'find-object';
  colorHex: string;
  colorName: string;
  emoji: string;
  prompt: string;
  options: string[];
  correctOption?: string; // for find-object type
}

const QUESTIONS: ColorQuestion[] = [
  // Basic color identification
  { id: 1, type: 'identify', colorHex: '#EF4444', colorName: 'Red', emoji: '🍎', prompt: 'What color is this apple?', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { id: 2, type: 'identify', colorHex: '#3B82F6', colorName: 'Blue', emoji: '🌊', prompt: 'What color is the ocean?', options: ['Green', 'Blue', 'Orange', 'Pink'] },
  { id: 3, type: 'identify', colorHex: '#22C55E', colorName: 'Green', emoji: '🌿', prompt: 'What color are the leaves?', options: ['Yellow', 'Red', 'Green', 'Purple'] },
  { id: 4, type: 'identify', colorHex: '#EAB308', colorName: 'Yellow', emoji: '🌻', prompt: 'What color is the sunflower?', options: ['Orange', 'Yellow', 'Blue', 'Red'] },
  // Find the object of this color
  { id: 5, type: 'find-object', colorHex: '#F97316', colorName: 'Orange', emoji: '🍊', prompt: 'Which one is ORANGE?', options: ['🍊 Orange', '🍎 Apple', '🍇 Grapes', '🍋 Lemon'], correctOption: '🍊 Orange' },
  { id: 6, type: 'find-object', colorHex: '#EC4899', colorName: 'Pink', emoji: '🌸', prompt: 'Which one is PINK?', options: ['🟣 Brinjal', '🔴 Tomato', '🌸 Flower', '🟠 Ball'], correctOption: '🌸 Flower' },
  // Harder colors
  { id: 7, type: 'identify', colorHex: '#8B5CF6', colorName: 'Purple', emoji: '🍇', prompt: 'What color are these grapes?', options: ['Blue', 'Purple', 'Pink', 'Red'] },
  { id: 8, type: 'identify', colorHex: '#000000', colorName: 'Black', emoji: '🐈‍⬛', prompt: 'What color is this cat?', options: ['Brown', 'Gray', 'Blue', 'Black'] },
  { id: 9, type: 'identify', colorHex: '#92400E', colorName: 'Brown', emoji: '🧸', prompt: 'What color is the teddy bear?', options: ['Orange', 'Black', 'Brown', 'Red'] },
  // Tricky mixed questions
  { id: 10, type: 'find-object', colorHex: '#FFFFFF', colorName: 'White', emoji: '☁️', prompt: 'Which one is WHITE?', options: ['☁️ Cloud', '🌙 Moon', '⭐ Star', '🌿 Leaf'], correctOption: '☁️ Cloud' },
  { id: 11, type: 'identify', colorHex: '#6B7280', colorName: 'Gray', emoji: '🐘', prompt: 'What color is the elephant?', options: ['White', 'Gray', 'Blue', 'Brown'] },
  { id: 12, type: 'find-object', colorHex: '#EAB308', colorName: 'Yellow', emoji: '⭐', prompt: 'Which one is YELLOW?', options: ['🍊 Orange', '🌟 Star', '🔴 Ball', '🍇 Grapes'], correctOption: '🌟 Star' },
];

// Confetti particles
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#EC4899'][i % 6],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-bounce"
          style={{
            left: `${p.x}%`,
            top: '-10%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

export function PreNurseryColorTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bounceEmoji, setBounceEmoji] = useState(false);
  const startTime = useRef(Date.now());
  const { playTap, playCelebration, playWhoosh, playApplause, playOhOh } = useSoundEffects();
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = QUESTIONS[currentQ];
  const correctAnswer = question.type === 'find-object'
    ? (question.correctOption || question.options[0])
    : question.colorName;
  const isCorrect = selected === correctAnswer;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  // Bounce emoji on question change
  useEffect(() => {
    setBounceEmoji(true);
    const t = setTimeout(() => setBounceEmoji(false), 600);
    return () => clearTimeout(t);
  }, [currentQ]);

  const handleSelect = useCallback((option: string) => {
    if (showFeedback) return;
    playTap();
    setSelected(option);
    setShowFeedback(true);

    const correct = option === (question.type === 'find-object'
      ? (question.correctOption || question.options[0])
      : question.colorName);

    if (correct) {
      setTimeout(() => playApplause(), 100);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    } else {
      setTimeout(() => playOhOh(), 100);
    }
  }, [showFeedback, playTap, playApplause, playOhOh, question]);

  // Auto-advance to next question after 2 seconds on correct answer
  useEffect(() => {
    if (showFeedback && isCorrect) {
      autoAdvanceTimer.current = setTimeout(() => {
        handleNext();
      }, 2000);
    }
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
    };
  }, [showFeedback, isCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    playWhoosh();
    const newAnswers = [...answers, { questionId: question.id, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      playCelebration();
      const result: TestResult = {
        classLevel: 'pre-nursery',
        totalQuestions: QUESTIONS.length,
        correctAnswers: newAnswers.filter(a => a.correct).length,
        timeTaken: Math.round((Date.now() - startTime.current) / 1000),
        answers: newAnswers,
      };
      onComplete(result);
      return;
    }

    setCurrentQ(prev => prev + 1);
    setSelected(null);
    setShowFeedback(false);
  }, [answers, question, isCorrect, currentQ, onComplete, playWhoosh, playCelebration]);

  const colorOptionBg: Record<string, string> = {
    Red: 'bg-red-100 border-red-300 hover:bg-red-200',
    Blue: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    Green: 'bg-green-100 border-green-300 hover:bg-green-200',
    Yellow: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    Orange: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    Pink: 'bg-pink-100 border-pink-300 hover:bg-pink-200',
    Purple: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    White: 'bg-white border-gray-300 hover:bg-gray-50',
    Black: 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700',
    Brown: 'bg-amber-100 border-amber-400 hover:bg-amber-200',
    Gray: 'bg-gray-200 border-gray-400 hover:bg-gray-300',
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress bar with star indicators */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <span className="text-base">📝</span>
            Question {currentQ + 1} of {QUESTIONS.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-base">👶</span>
            {studentName}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Star indicators for each question */}
        <div className="flex justify-center gap-0.5 flex-wrap">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="text-xs">
              {i < answers.length
                ? (answers[i].correct ? '⭐' : '⚪')
                : i === currentQ ? '🔵' : '⚪'}
            </div>
          ))}
        </div>
      </div>

      {/* Question card */}
      <Card className="overflow-hidden relative border-2 border-violet-200 shadow-lg">
        <ConfettiBurst active={showConfetti} />

        <div className="bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 p-6 text-center relative">
          {/* Decorative bubbles */}
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-yellow-200/50 animate-pulse" />
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-200/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-2 right-8 w-5 h-5 rounded-full bg-green-200/50 animate-pulse" style={{ animationDelay: '1s' }} />

          <p className="text-base font-bold text-violet-800 mb-3">{question.prompt}</p>
          <div className={cn(
            'text-8xl mb-3 transition-transform duration-500',
            bounceEmoji && 'animate-bounce'
          )}>
            {question.emoji}
          </div>
          {question.type === 'identify' && (
            <div
              className="w-28 h-28 rounded-3xl mx-auto shadow-xl border-4 border-white"
              style={{ backgroundColor: question.colorHex }}
            />
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Options grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => {
              const isSelected = selected === option;
              const isAnswer = option === correctAnswer;
              // For find-object type, use neutral background
              const bgClass = question.type === 'identify'
                ? (colorOptionBg[option] || 'bg-gray-100 border-gray-300')
                : 'bg-white border-gray-200 hover:bg-indigo-50';

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={showFeedback}
                  className={cn(
                    'p-4 rounded-2xl border-2 text-center font-bold text-lg transition-all duration-200',
                    'active:scale-90 focus:outline-none shadow-sm',
                    bgClass,
                    showFeedback && isAnswer && 'ring-4 ring-green-400 border-green-500 scale-110 shadow-lg shadow-green-200',
                    showFeedback && isSelected && !isAnswer && 'ring-4 ring-red-400 border-red-500 opacity-50 scale-95',
                    !showFeedback && 'hover:scale-105 hover:shadow-md cursor-pointer'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback with animation */}
          {showFeedback && (
            <div className={cn(
              'p-4 rounded-2xl text-center font-bold animate-in fade-in zoom-in-95 duration-300',
              isCorrect
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200'
                : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-2 border-red-200'
            )}>
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <span>Wonderful! That's correct!</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                </div>
              ) : (
                <div>
                  <span className="text-xl">😊</span>
                  <p>Good try! The answer is <strong>{correctAnswer}</strong></p>
                </div>
              )}
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <Button
              onClick={handleNext}
              className="w-full animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg rounded-2xl h-12 text-base font-bold"
              size="lg"
            >
              {currentQ + 1 >= QUESTIONS.length ? '🏆 See Results' : 'Next Question ➡️'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
