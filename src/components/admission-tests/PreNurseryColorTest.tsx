import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TestComponentProps, TestResult } from './types';
import { ChevronRight, Volume2 } from 'lucide-react';

interface ColorQuestion {
  id: number;
  colorHex: string;
  colorName: string;
  emoji: string;
  options: string[];
}

const QUESTIONS: ColorQuestion[] = [
  { id: 1, colorHex: '#EF4444', colorName: 'Red', emoji: '🍎', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { id: 2, colorHex: '#3B82F6', colorName: 'Blue', emoji: '🌊', options: ['Green', 'Blue', 'Orange', 'Pink'] },
  { id: 3, colorHex: '#22C55E', colorName: 'Green', emoji: '🌿', options: ['Yellow', 'Red', 'Green', 'Purple'] },
  { id: 4, colorHex: '#EAB308', colorName: 'Yellow', emoji: '🌻', options: ['Orange', 'Yellow', 'Blue', 'Red'] },
  { id: 5, colorHex: '#F97316', colorName: 'Orange', emoji: '🍊', options: ['Orange', 'Pink', 'Yellow', 'Red'] },
  { id: 6, colorHex: '#EC4899', colorName: 'Pink', emoji: '🌸', options: ['Purple', 'Red', 'Pink', 'Orange'] },
  { id: 7, colorHex: '#8B5CF6', colorName: 'Purple', emoji: '🍇', options: ['Blue', 'Purple', 'Pink', 'Red'] },
  { id: 8, colorHex: '#FFFFFF', colorName: 'White', emoji: '☁️', options: ['White', 'Yellow', 'Gray', 'Blue'] },
  { id: 9, colorHex: '#000000', colorName: 'Black', emoji: '🖤', options: ['Brown', 'Gray', 'Blue', 'Black'] },
  { id: 10, colorHex: '#92400E', colorName: 'Brown', emoji: '🧸', options: ['Orange', 'Black', 'Brown', 'Red'] },
];

export function PreNurseryColorTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const startTime = useRef(Date.now());

  const question = QUESTIONS[currentQ];
  const isCorrect = selected === question.colorName;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleSelect = useCallback((option: string) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
  }, [showFeedback]);

  const handleNext = useCallback(() => {
    const newAnswers = [...answers, { questionId: question.id, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
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
  }, [answers, question, isCorrect, currentQ, onComplete]);

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
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
          <span>{studentName}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">What color is this?</p>
          <div className="text-7xl mb-3">{question.emoji}</div>
          <div
            className="w-24 h-24 rounded-2xl mx-auto shadow-lg border-4 border-white"
            style={{ backgroundColor: question.colorHex }}
          />
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Options grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => {
              const isSelected = selected === option;
              const isAnswer = option === question.colorName;

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={showFeedback}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center font-bold text-lg transition-all duration-200',
                    'active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-400',
                    colorOptionBg[option] || 'bg-gray-100 border-gray-300',
                    showFeedback && isAnswer && 'ring-4 ring-green-400 border-green-500 scale-105',
                    showFeedback && isSelected && !isAnswer && 'ring-4 ring-red-400 border-red-500 opacity-60',
                    !showFeedback && 'hover:scale-105 cursor-pointer'
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
                ? '✅ Great job! That\'s correct!'
                : `❌ Oops! The correct answer is ${question.colorName}`}
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <Button
              onClick={handleNext}
              className="w-full animate-in fade-in slide-in-from-bottom-2"
              size="lg"
            >
              {currentQ + 1 >= QUESTIONS.length ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
