import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TestComponentProps, TestResult } from './types';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useSoundEffects } from './useSoundEffects';

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
    instruction: '🐾 Match the animal to its sound',
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
    instruction: '🍎 Match the fruit to its color',
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
    instruction: '🔷 Match the shape to its name',
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
    instruction: '👶 Match the baby animal to its parent',
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
    instruction: '🔢 Match the number to the count',
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
    instruction: '🌍 Match the object to where it belongs',
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
    instruction: '🛠️ Match the item to its use',
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
    instruction: '🌦️ Match the season to its weather',
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
  // New slightly harder questions
  {
    id: 9,
    instruction: '🎨 Match the thing to its color',
    leftItems: [
      { id: 'sky', emoji: '🌤️', label: 'Sky' },
      { id: 'grass', emoji: '🌱', label: 'Grass' },
      { id: 'sun', emoji: '☀️', label: 'Sun' },
    ],
    rightItems: [
      { id: 'green', emoji: '🟢', label: 'Green' },
      { id: 'yellow', emoji: '🟡', label: 'Yellow' },
      { id: 'blue', emoji: '🔵', label: 'Blue' },
    ],
    correctPairs: { sky: 'blue', grass: 'green', sun: 'yellow' },
  },
  {
    id: 10,
    instruction: '🍽️ Match the food to the meal',
    leftItems: [
      { id: 'cereal', emoji: '🥣', label: 'Cereal' },
      { id: 'rice', emoji: '🍚', label: 'Rice & Dal' },
      { id: 'milk', emoji: '🥛', label: 'Warm Milk' },
    ],
    rightItems: [
      { id: 'dinner', emoji: '🌙', label: 'Dinner' },
      { id: 'breakfast', emoji: '🌅', label: 'Breakfast' },
      { id: 'lunch', emoji: '☀️', label: 'Lunch' },
    ],
    correctPairs: { cereal: 'breakfast', rice: 'lunch', milk: 'dinner' },
  },
];

// Animated connection line between matched pairs
function MatchLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      <div className="w-12 h-0.5 bg-emerald-400 animate-ping opacity-60" />
    </div>
  );
}

export function NurseryMatchingTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const [showMatchFlash, setShowMatchFlash] = useState(false);
  const startTime = useRef(Date.now());
  const { playTap, playMatch, playCelebration, playWhoosh, playApplause, playOhOh } = useSoundEffects();

  const question = QUESTIONS[currentQ];
  const totalPairs = question.leftItems.length;
  const matchedCount = Object.keys(matchedPairs).length;
  const allMatched = matchedCount === totalPairs;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  // Play celebration when all matched + auto-advance after 2s
  useEffect(() => {
    if (allMatched && matchedCount > 0) {
      playApplause();
      const timer = setTimeout(() => {
        handleNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allMatched, matchedCount, playApplause]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeftSelect = useCallback((id: string) => {
    if (matchedPairs[id] || showResult) return;
    playTap();
    setSelectedLeft(id);
    setWrongPair(null);
  }, [matchedPairs, showResult, playTap]);

  const handleRightSelect = useCallback((rightId: string) => {
    if (!selectedLeft || showResult) return;
    if (Object.values(matchedPairs).includes(rightId)) return;

    if (question.correctPairs[selectedLeft] === rightId) {
      playMatch();
      setMatchedPairs(prev => ({ ...prev, [selectedLeft]: rightId }));
      setSelectedLeft(null);
      setWrongPair(null);
      setShowMatchFlash(true);
      setTimeout(() => setShowMatchFlash(false), 500);
    } else {
      playOhOh();
      setWrongPair({ left: selectedLeft, right: rightId });
      setTimeout(() => setWrongPair(null), 800);
    }
  }, [selectedLeft, matchedPairs, question, showResult, playMatch, playOhOh]);

  const handleNext = useCallback(() => {
    playWhoosh();
    const allCorrect = matchedCount === totalPairs;
    const newAnswers = [...answers, { questionId: question.id, correct: allCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      playCelebration();
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
  }, [answers, question, matchedCount, totalPairs, currentQ, onComplete, playWhoosh, playCelebration]);

  const handleReset = useCallback(() => {
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongPair(null);
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress with star indicators */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <span className="text-base">🧩</span>
            Round {currentQ + 1} of {QUESTIONS.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-base">👧</span>
            {studentName}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-center gap-0.5 flex-wrap">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="text-xs">
              {i < answers.length
                ? (answers[i].correct ? '⭐' : '⚪')
                : i === currentQ ? '🟢' : '⚪'}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-2 border-emerald-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 p-4 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-1 left-2 text-lg animate-pulse">✨</div>
          <div className="absolute top-1 right-2 text-lg animate-pulse" style={{ animationDelay: '0.7s' }}>✨</div>

          <p className="text-base font-bold text-emerald-800">{question.instruction}</p>
          <p className="text-xs text-emerald-600 mt-1">
            Tap left → then tap its match on right
          </p>
          {/* Match progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-4 h-4 rounded-full transition-all duration-300 border-2',
                  i < matchedCount
                    ? 'bg-emerald-400 border-emerald-500 scale-110 shadow-sm shadow-emerald-300'
                    : 'bg-white border-gray-300'
                )}
              >
                {i < matchedCount && <span className="text-[8px] flex items-center justify-center h-full">✓</span>}
              </div>
            ))}
          </div>
        </div>

        <CardContent className="p-4 relative">
          <MatchLine active={showMatchFlash} />

          {/* Matching area */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-2.5">
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
                      'w-full p-3 rounded-2xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-90 shadow-sm',
                      isMatched && 'bg-emerald-50 border-emerald-300 opacity-50 scale-95',
                      isSelected && !isWrong && 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 scale-105 shadow-md shadow-blue-200',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isSelected && !isWrong && 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                    )}
                  >
                    <span className={cn('text-3xl block', isMatched && 'opacity-50')}>{item.emoji}</span>
                    <span className="text-xs font-bold mt-1 block">{item.label}</span>
                    {isMatched && <span className="text-xs text-emerald-500">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Right column */}
            <div className="space-y-2.5">
              {question.rightItems.map((item) => {
                const isMatched = Object.values(matchedPairs).includes(item.id);
                const isWrong = wrongPair?.right === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleRightSelect(item.id)}
                    disabled={isMatched || !selectedLeft}
                    className={cn(
                      'w-full p-3 rounded-2xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-90 shadow-sm',
                      isMatched && 'bg-emerald-50 border-emerald-300 opacity-50 scale-95',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isWrong && selectedLeft && 'bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md cursor-pointer',
                      !isMatched && !isWrong && !selectedLeft && 'bg-gray-50 border-gray-200 opacity-60'
                    )}
                  >
                    <span className={cn('text-3xl block', isMatched && 'opacity-50')}>{item.emoji}</span>
                    <span className="text-xs font-bold mt-1 block">{item.label}</span>
                    {isMatched && <span className="text-xs text-emerald-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          {matchedCount > 0 && !allMatched && (
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          )}

          {/* All matched - celebration */}
          {allMatched && (
            <div className="mt-4 space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <span>All matched! Well done!</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</span>
                </div>
              </div>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg rounded-2xl h-12 text-base font-bold"
                size="lg"
              >
                {currentQ + 1 >= QUESTIONS.length ? '🏆 See Results' : 'Next Round ➡️'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
