import { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TestComponentProps, TestResult } from './types';
import { ChevronRight } from 'lucide-react';

type MathOp = '+' | '-' | '>' | '<' | '=';

interface MathQuestion {
  id: number;
  type: 'arithmetic' | 'comparison' | 'counting' | 'missing';
  display: string;
  options: (string | number)[];
  correctAnswer: string | number;
  emoji?: string;
}

function generateQuestions(): MathQuestion[] {
  const questions: MathQuestion[] = [
    // Addition
    {
      id: 1, type: 'arithmetic', display: '3 + 2 = ?',
      options: [4, 5, 6, 7], correctAnswer: 5, emoji: '➕',
    },
    {
      id: 2, type: 'arithmetic', display: '7 + 1 = ?',
      options: [7, 8, 9, 6], correctAnswer: 8, emoji: '➕',
    },
    {
      id: 3, type: 'arithmetic', display: '4 + 4 = ?',
      options: [6, 7, 8, 9], correctAnswer: 8, emoji: '➕',
    },
    // Subtraction
    {
      id: 4, type: 'arithmetic', display: '9 - 3 = ?',
      options: [5, 6, 7, 4], correctAnswer: 6, emoji: '➖',
    },
    {
      id: 5, type: 'arithmetic', display: '10 - 4 = ?',
      options: [5, 6, 7, 8], correctAnswer: 6, emoji: '➖',
    },
    // Comparison
    {
      id: 6, type: 'comparison', display: '8 __ 5',
      options: ['>', '<', '='], correctAnswer: '>', emoji: '⚖️',
    },
    {
      id: 7, type: 'comparison', display: '3 __ 7',
      options: ['>', '<', '='], correctAnswer: '<', emoji: '⚖️',
    },
    {
      id: 8, type: 'comparison', display: '6 __ 6',
      options: ['>', '<', '='], correctAnswer: '=', emoji: '⚖️',
    },
    // Counting objects
    {
      id: 9, type: 'counting', display: 'How many apples?',
      options: [5, 6, 7, 8], correctAnswer: 7, emoji: '🍎🍎🍎🍎🍎🍎🍎',
    },
    {
      id: 10, type: 'counting', display: 'How many stars?',
      options: [7, 8, 9, 10], correctAnswer: 9, emoji: '⭐⭐⭐⭐⭐⭐⭐⭐⭐',
    },
    // Missing number
    {
      id: 11, type: 'missing', display: '__ + 3 = 7',
      options: [3, 4, 5, 2], correctAnswer: 4, emoji: '🔢',
    },
    {
      id: 12, type: 'missing', display: '10 - __ = 6',
      options: [3, 4, 5, 2], correctAnswer: 4, emoji: '🔢',
    },
  ];

  return questions;
}

export function Class1MathTest({ onComplete, studentName }: TestComponentProps) {
  const questions = useMemo(() => generateQuestions(), []);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const startTime = useRef(Date.now());

  const question = questions[currentQ];
  const isCorrect = selected !== null && String(selected) === String(question.correctAnswer);
  const progress = ((currentQ) / questions.length) * 100;

  const handleSelect = useCallback((option: string | number) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
  }, [showFeedback]);

  const handleNext = useCallback(() => {
    const newAnswers = [...answers, { questionId: question.id, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      const result: TestResult = {
        classLevel: 'class-1',
        totalQuestions: questions.length,
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
  }, [answers, question, isCorrect, currentQ, questions.length, onComplete]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'arithmetic': return { label: 'Calculate', color: 'bg-blue-100 text-blue-700' };
      case 'comparison': return { label: 'Compare', color: 'bg-purple-100 text-purple-700' };
      case 'counting': return { label: 'Count', color: 'bg-green-100 text-green-700' };
      case 'missing': return { label: 'Find Missing', color: 'bg-orange-100 text-orange-700' };
      default: return { label: 'Math', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const badge = getTypeBadge(question.type);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{studentName}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
          <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-medium mb-3', badge.color)}>
            {badge.label}
          </span>

          {/* Emoji display for counting */}
          {question.type === 'counting' && question.emoji && (
            <div className="text-3xl mb-3 leading-relaxed tracking-widest">
              {question.emoji}
            </div>
          )}

          {/* Main question */}
          <div className="text-4xl font-bold text-gray-800 font-mono tracking-wider">
            {question.display}
          </div>

          {question.type !== 'counting' && question.emoji && (
            <div className="text-2xl mt-2">{question.emoji}</div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Options */}
          <div className={cn(
            'grid gap-3',
            question.options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'
          )}>
            {question.options.map((option) => {
              const isSelected = selected !== null && String(selected) === String(option);
              const isAnswer = String(option) === String(question.correctAnswer);

              return (
                <button
                  key={String(option)}
                  onClick={() => handleSelect(option)}
                  disabled={showFeedback}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center font-bold text-2xl font-mono transition-all duration-200',
                    'active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400',
                    'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                    showFeedback && isAnswer && 'ring-4 ring-green-400 border-green-500 bg-green-50 scale-105',
                    showFeedback && isSelected && !isAnswer && 'ring-4 ring-red-400 border-red-500 bg-red-50 opacity-70',
                    !showFeedback && 'cursor-pointer hover:scale-105'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={cn(
              'p-3 rounded-lg text-center text-sm font-medium animate-in fade-in slide-in-from-bottom-2',
              isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              {isCorrect
                ? '🎉 Correct! Well done!'
                : `❌ The correct answer is ${question.correctAnswer}`}
            </div>
          )}

          {/* Next */}
          {showFeedback && (
            <Button
              onClick={handleNext}
              className="w-full animate-in fade-in slide-in-from-bottom-2"
              size="lg"
            >
              {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
