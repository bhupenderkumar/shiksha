import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TestComponentProps, TestResult } from './types';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface MatchItem {
  id: string;
  emoji: string;
  label: string;
}

interface MatchQuestion {
  id: number;
  instruction: string;
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  correctPairs: Record<string, string>; // leftId -> rightId
}

const QUESTIONS: MatchQuestion[] = [
  {
    id: 1,
    instruction: 'Match the animal to its sound',
    leftItems: [
      { id: 'dog', emoji: '🐕', label: 'Dog' },
      { id: 'cat', emoji: '🐱', label: 'Cat' },
      { id: 'cow', emoji: '🐄', label: 'Cow' },
    ],
    rightItems: [
      { id: 'moo', emoji: '🔔', label: 'Moo' },
      { id: 'woof', emoji: '🔊', label: 'Woof' },
      { id: 'meow', emoji: '🎵', label: 'Meow' },
    ],
    correctPairs: { dog: 'woof', cat: 'meow', cow: 'moo' },
  },
  {
    id: 2,
    instruction: 'Match the fruit to its color',
    leftItems: [
      { id: 'banana', emoji: '🍌', label: 'Banana' },
      { id: 'apple', emoji: '🍎', label: 'Apple' },
      { id: 'grape', emoji: '🍇', label: 'Grapes' },
    ],
    rightItems: [
      { id: 'red', emoji: '🔴', label: 'Red' },
      { id: 'purple', emoji: '🟣', label: 'Purple' },
      { id: 'yellow', emoji: '🟡', label: 'Yellow' },
    ],
    correctPairs: { banana: 'yellow', apple: 'red', grape: 'purple' },
  },
  {
    id: 3,
    instruction: 'Match the shape to its name',
    leftItems: [
      { id: 'circle', emoji: '⭕', label: '?' },
      { id: 'square', emoji: '⬜', label: '?' },
      { id: 'triangle', emoji: '🔺', label: '?' },
    ],
    rightItems: [
      { id: 'tri', emoji: '📐', label: 'Triangle' },
      { id: 'cir', emoji: '🔵', label: 'Circle' },
      { id: 'sq', emoji: '🟩', label: 'Square' },
    ],
    correctPairs: { circle: 'cir', square: 'sq', triangle: 'tri' },
  },
  {
    id: 4,
    instruction: 'Match the baby animal to its parent',
    leftItems: [
      { id: 'puppy', emoji: '🐶', label: 'Puppy' },
      { id: 'kitten', emoji: '🐱', label: 'Kitten' },
      { id: 'chick', emoji: '🐥', label: 'Chick' },
    ],
    rightItems: [
      { id: 'hen', emoji: '🐔', label: 'Hen' },
      { id: 'dogm', emoji: '🐕', label: 'Dog' },
      { id: 'catm', emoji: '🐈', label: 'Cat' },
    ],
    correctPairs: { puppy: 'dogm', kitten: 'catm', chick: 'hen' },
  },
  {
    id: 5,
    instruction: 'Match the number to the count',
    leftItems: [
      { id: 'one', emoji: '1️⃣', label: '1' },
      { id: 'two', emoji: '2️⃣', label: '2' },
      { id: 'three', emoji: '3️⃣', label: '3' },
    ],
    rightItems: [
      { id: 'stars3', emoji: '⭐⭐⭐', label: 'Three stars' },
      { id: 'stars1', emoji: '⭐', label: 'One star' },
      { id: 'stars2', emoji: '⭐⭐', label: 'Two stars' },
    ],
    correctPairs: { one: 'stars1', two: 'stars2', three: 'stars3' },
  },
  {
    id: 6,
    instruction: 'Match the object to where it belongs',
    leftItems: [
      { id: 'fish', emoji: '🐟', label: 'Fish' },
      { id: 'bird', emoji: '🐦', label: 'Bird' },
      { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
    ],
    rightItems: [
      { id: 'land', emoji: '🌿', label: 'Land' },
      { id: 'water', emoji: '🌊', label: 'Water' },
      { id: 'sky', emoji: '☁️', label: 'Sky' },
    ],
    correctPairs: { fish: 'water', bird: 'sky', rabbit: 'land' },
  },
  {
    id: 7,
    instruction: 'Match the item to its use',
    leftItems: [
      { id: 'pencil', emoji: '✏️', label: 'Pencil' },
      { id: 'scissors', emoji: '✂️', label: 'Scissors' },
      { id: 'eraser', emoji: '🧹', label: 'Eraser' },
    ],
    rightItems: [
      { id: 'cut', emoji: '📰', label: 'Cutting' },
      { id: 'erase', emoji: '📝', label: 'Erasing' },
      { id: 'write', emoji: '✍️', label: 'Writing' },
    ],
    correctPairs: { pencil: 'write', scissors: 'cut', eraser: 'erase' },
  },
  {
    id: 8,
    instruction: 'Match the season to its weather',
    leftItems: [
      { id: 'summer', emoji: '☀️', label: 'Summer' },
      { id: 'rainy', emoji: '🌧️', label: 'Rainy' },
      { id: 'winter', emoji: '❄️', label: 'Winter' },
    ],
    rightItems: [
      { id: 'cold', emoji: '🧥', label: 'Very Cold' },
      { id: 'hot', emoji: '🥵', label: 'Very Hot' },
      { id: 'wet', emoji: '☂️', label: 'Wet & Rainy' },
    ],
    correctPairs: { summer: 'hot', rainy: 'wet', winter: 'cold' },
  },
];

export function NurseryMatchingTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const startTime = useRef(Date.now());

  const question = QUESTIONS[currentQ];
  const totalPairs = question.leftItems.length;
  const matchedCount = Object.keys(matchedPairs).length;
  const allMatched = matchedCount === totalPairs;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleLeftSelect = useCallback((id: string) => {
    if (matchedPairs[id] || showResult) return;
    setSelectedLeft(id);
    setWrongPair(null);
  }, [matchedPairs, showResult]);

  const handleRightSelect = useCallback((rightId: string) => {
    if (!selectedLeft || showResult) return;
    // Check if this right item is already matched
    if (Object.values(matchedPairs).includes(rightId)) return;

    if (question.correctPairs[selectedLeft] === rightId) {
      // Correct match
      setMatchedPairs(prev => ({ ...prev, [selectedLeft]: rightId }));
      setSelectedLeft(null);
      setWrongPair(null);
    } else {
      // Wrong match — flash red briefly
      setWrongPair({ left: selectedLeft, right: rightId });
      setTimeout(() => setWrongPair(null), 800);
    }
  }, [selectedLeft, matchedPairs, question, showResult]);

  const handleNext = useCallback(() => {
    // Count correct matches (all should be correct since we only allow correct pairs)
    const allCorrect = matchedCount === totalPairs;
    const newAnswers = [...answers, { questionId: question.id, correct: allCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      const result: TestResult = {
        classLevel: 'nursery',
        totalQuestions: QUESTIONS.length,
        correctAnswers: newAnswers.filter(a => a.correct).length,
        timeTaken: Math.round((Date.now() - startTime.current) / 1000),
        answers: newAnswers,
      };
      onComplete(result);
      return;
    }

    setCurrentQ(prev => prev + 1);
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongPair(null);
    setShowResult(false);
  }, [answers, question, matchedCount, totalPairs, currentQ, onComplete]);

  const handleReset = useCallback(() => {
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongPair(null);
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
          <span>{studentName}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
          <p className="text-sm font-medium text-emerald-700">{question.instruction}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap a left item, then tap its match on the right
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  i < matchedCount ? 'bg-emerald-400' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Matching area */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-2">
              {question.leftItems.map((item) => {
                const isMatched = !!matchedPairs[item.id];
                const isSelected = selectedLeft === item.id;
                const isWrong = wrongPair?.left === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLeftSelect(item.id)}
                    disabled={isMatched}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-95',
                      isMatched && 'bg-emerald-50 border-emerald-300 opacity-60',
                      isSelected && !isWrong && 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 scale-105',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isSelected && !isWrong && 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    <span className="text-2xl block">{item.emoji}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right column */}
            <div className="space-y-2">
              {question.rightItems.map((item) => {
                const isMatched = Object.values(matchedPairs).includes(item.id);
                const isWrong = wrongPair?.right === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleRightSelect(item.id)}
                    disabled={isMatched || !selectedLeft}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-95',
                      isMatched && 'bg-emerald-50 border-emerald-300 opacity-60',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isWrong && selectedLeft && 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer',
                      !isMatched && !isWrong && !selectedLeft && 'bg-gray-50 border-gray-200 opacity-70'
                    )}
                  >
                    <span className="text-2xl block">{item.emoji}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched lines indicator */}
          {matchedCount > 0 && !allMatched && (
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Matches
              </Button>
            </div>
          )}

          {/* All matched - success */}
          {allMatched && (
            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-3 rounded-lg bg-emerald-50 text-center text-sm font-medium text-emerald-700">
                ✅ All matched correctly! Well done!
              </div>
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentQ + 1 >= QUESTIONS.length ? 'See Results' : 'Next Question'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
