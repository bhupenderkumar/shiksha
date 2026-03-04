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
  correctPairs: Record<string, string>;
}

// KG has 4 items per question (harder than nursery's 3)
const QUESTIONS: MatchQuestion[] = [
  {
    id: 1,
    instruction: 'Match the letter to the picture',
    leftItems: [
      { id: 'a', emoji: '🔤', label: 'A' },
      { id: 'b', emoji: '🔤', label: 'B' },
      { id: 'c', emoji: '🔤', label: 'C' },
      { id: 'd', emoji: '🔤', label: 'D' },
    ],
    rightItems: [
      { id: 'cat', emoji: '🐱', label: 'Cat' },
      { id: 'dog', emoji: '🐶', label: 'Dog' },
      { id: 'apple', emoji: '🍎', label: 'Apple' },
      { id: 'ball', emoji: '⚽', label: 'Ball' },
    ],
    correctPairs: { a: 'apple', b: 'ball', c: 'cat', d: 'dog' },
  },
  {
    id: 2,
    instruction: 'Match the number to the group',
    leftItems: [
      { id: 'n2', emoji: '2️⃣', label: '2' },
      { id: 'n4', emoji: '4️⃣', label: '4' },
      { id: 'n5', emoji: '5️⃣', label: '5' },
      { id: 'n3', emoji: '3️⃣', label: '3' },
    ],
    rightItems: [
      { id: 'g3', emoji: '🌸🌸🌸', label: '3 flowers' },
      { id: 'g5', emoji: '🍎🍎🍎🍎🍎', label: '5 apples' },
      { id: 'g2', emoji: '🦋🦋', label: '2 butterflies' },
      { id: 'g4', emoji: '⭐⭐⭐⭐', label: '4 stars' },
    ],
    correctPairs: { n2: 'g2', n4: 'g4', n5: 'g5', n3: 'g3' },
  },
  {
    id: 3,
    instruction: 'Match the opposite words',
    leftItems: [
      { id: 'big', emoji: '🐘', label: 'Big' },
      { id: 'hot', emoji: '🔥', label: 'Hot' },
      { id: 'happy', emoji: '😊', label: 'Happy' },
      { id: 'day', emoji: '☀️', label: 'Day' },
    ],
    rightItems: [
      { id: 'night', emoji: '🌙', label: 'Night' },
      { id: 'small', emoji: '🐜', label: 'Small' },
      { id: 'sad', emoji: '😢', label: 'Sad' },
      { id: 'cold', emoji: '🧊', label: 'Cold' },
    ],
    correctPairs: { big: 'small', hot: 'cold', happy: 'sad', day: 'night' },
  },
  {
    id: 4,
    instruction: 'Match the animal to what it eats',
    leftItems: [
      { id: 'monkey', emoji: '🐒', label: 'Monkey' },
      { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
      { id: 'bear', emoji: '🐻', label: 'Bear' },
      { id: 'cow', emoji: '🐄', label: 'Cow' },
    ],
    rightItems: [
      { id: 'carrot', emoji: '🥕', label: 'Carrot' },
      { id: 'grass', emoji: '🌾', label: 'Grass' },
      { id: 'honey', emoji: '🍯', label: 'Honey' },
      { id: 'banana', emoji: '🍌', label: 'Banana' },
    ],
    correctPairs: { monkey: 'banana', rabbit: 'carrot', bear: 'honey', cow: 'grass' },
  },
  {
    id: 5,
    instruction: 'Match the shape to its sides',
    leftItems: [
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      { id: 'square', emoji: '🟧', label: 'Square' },
      { id: 'circle', emoji: '🔵', label: 'Circle' },
      { id: 'pentagon', emoji: '⬠', label: 'Pentagon' },
    ],
    rightItems: [
      { id: 's4', emoji: '4️⃣', label: '4 sides' },
      { id: 's0', emoji: '0️⃣', label: '0 sides' },
      { id: 's3', emoji: '3️⃣', label: '3 sides' },
      { id: 's5', emoji: '5️⃣', label: '5 sides' },
    ],
    correctPairs: { triangle: 's3', square: 's4', circle: 's0', pentagon: 's5' },
  },
  {
    id: 6,
    instruction: 'Match the vehicle to where it travels',
    leftItems: [
      { id: 'car', emoji: '🚗', label: 'Car' },
      { id: 'ship', emoji: '🚢', label: 'Ship' },
      { id: 'plane', emoji: '✈️', label: 'Plane' },
      { id: 'train', emoji: '🚂', label: 'Train' },
    ],
    rightItems: [
      { id: 'sky', emoji: '☁️', label: 'Sky' },
      { id: 'rail', emoji: '🛤️', label: 'Rails' },
      { id: 'road', emoji: '🛣️', label: 'Road' },
      { id: 'sea', emoji: '🌊', label: 'Sea' },
    ],
    correctPairs: { car: 'road', ship: 'sea', plane: 'sky', train: 'rail' },
  },
  {
    id: 7,
    instruction: 'Match the professional to their tool',
    leftItems: [
      { id: 'doctor', emoji: '👩‍⚕️', label: 'Doctor' },
      { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher' },
      { id: 'farmer', emoji: '👨‍🌾', label: 'Farmer' },
      { id: 'chef', emoji: '👨‍🍳', label: 'Chef' },
    ],
    rightItems: [
      { id: 'pan', emoji: '🍳', label: 'Pan' },
      { id: 'stetho', emoji: '🩺', label: 'Stethoscope' },
      { id: 'book', emoji: '📚', label: 'Book' },
      { id: 'tractor', emoji: '🚜', label: 'Tractor' },
    ],
    correctPairs: { doctor: 'stetho', teacher: 'book', farmer: 'tractor', chef: 'pan' },
  },
  {
    id: 8,
    instruction: 'Match the flag to the country',
    leftItems: [
      { id: 'india', emoji: '🇮🇳', label: 'India' },
      { id: 'usa', emoji: '🇺🇸', label: 'USA' },
      { id: 'japan', emoji: '🇯🇵', label: 'Japan' },
      { id: 'uk', emoji: '🇬🇧', label: 'UK' },
    ],
    rightItems: [
      { id: 'tokyo', emoji: '🗼', label: 'Tokyo Tower' },
      { id: 'tajmahal', emoji: '🕌', label: 'Taj Mahal' },
      { id: 'liberty', emoji: '🗽', label: 'Statue of Liberty' },
      { id: 'bigben', emoji: '🏰', label: 'Big Ben' },
    ],
    correctPairs: { india: 'tajmahal', usa: 'liberty', japan: 'tokyo', uk: 'bigben' },
  },
  {
    id: 9,
    instruction: 'Match the body part to its function',
    leftItems: [
      { id: 'eyes', emoji: '👀', label: 'Eyes' },
      { id: 'ears', emoji: '👂', label: 'Ears' },
      { id: 'nose', emoji: '👃', label: 'Nose' },
      { id: 'mouth', emoji: '👄', label: 'Mouth' },
    ],
    rightItems: [
      { id: 'smell', emoji: '🌹', label: 'Smelling' },
      { id: 'taste', emoji: '🍬', label: 'Tasting' },
      { id: 'see', emoji: '🌈', label: 'Seeing' },
      { id: 'hear', emoji: '🎶', label: 'Hearing' },
    ],
    correctPairs: { eyes: 'see', ears: 'hear', nose: 'smell', mouth: 'taste' },
  },
  {
    id: 10,
    instruction: 'Match the word to its first letter',
    leftItems: [
      { id: 'sun', emoji: '☀️', label: 'Sun' },
      { id: 'moon', emoji: '🌙', label: 'Moon' },
      { id: 'rain', emoji: '🌧️', label: 'Rain' },
      { id: 'wind', emoji: '💨', label: 'Wind' },
    ],
    rightItems: [
      { id: 'lw', emoji: '🔡', label: 'W' },
      { id: 'lr', emoji: '🔡', label: 'R' },
      { id: 'ls', emoji: '🔡', label: 'S' },
      { id: 'lm', emoji: '🔡', label: 'M' },
    ],
    correctPairs: { sun: 'ls', moon: 'lm', rain: 'lr', wind: 'lw' },
  },
];

export function KGMatchingTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const startTime = useRef(Date.now());

  const question = QUESTIONS[currentQ];
  const totalPairs = question.leftItems.length;
  const matchedCount = Object.keys(matchedPairs).length;
  const allMatched = matchedCount === totalPairs;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleLeftSelect = useCallback((id: string) => {
    if (matchedPairs[id]) return;
    setSelectedLeft(id);
    setWrongPair(null);
  }, [matchedPairs]);

  const handleRightSelect = useCallback((rightId: string) => {
    if (!selectedLeft) return;
    if (Object.values(matchedPairs).includes(rightId)) return;

    if (question.correctPairs[selectedLeft] === rightId) {
      setMatchedPairs(prev => ({ ...prev, [selectedLeft]: rightId }));
      setSelectedLeft(null);
      setWrongPair(null);
    } else {
      setAttempts(prev => prev + 1);
      setWrongPair({ left: selectedLeft, right: rightId });
      setTimeout(() => setWrongPair(null), 600);
    }
  }, [selectedLeft, matchedPairs, question]);

  const handleNext = useCallback(() => {
    // Mark correct only if completed with fewer than 3 wrong attempts per pair
    const maxWrongAllowed = totalPairs * 2;
    const isGood = attempts <= maxWrongAllowed;
    const newAnswers = [...answers, { questionId: question.id, correct: isGood }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      const result: TestResult = {
        classLevel: 'kg',
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
    setAttempts(0);
  }, [answers, question, totalPairs, attempts, currentQ, onComplete]);

  const handleReset = useCallback(() => {
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongPair(null);
    setAttempts(prev => prev + totalPairs); // Penalty for reset
  }, [totalPairs]);

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
            className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-4 text-center">
          <p className="text-sm font-medium text-orange-700">{question.instruction}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap left item → Tap its match on the right ({totalPairs} pairs)
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  i < matchedCount ? 'bg-orange-400' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-3">
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
                      'w-full p-2.5 rounded-xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-95',
                      isMatched && 'bg-orange-50 border-orange-300 opacity-50',
                      isSelected && !isWrong && 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 scale-105',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isSelected && !isWrong && 'bg-white border-gray-200 hover:border-blue-300'
                    )}
                  >
                    <span className="text-xl block">{item.emoji}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
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
                      'w-full p-2.5 rounded-xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-95',
                      isMatched && 'bg-orange-50 border-orange-300 opacity-50',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isWrong && selectedLeft && 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer',
                      !isMatched && !isWrong && !selectedLeft && 'bg-gray-50 border-gray-200 opacity-70'
                    )}
                  >
                    <span className="text-xl block">{item.emoji}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {matchedCount > 0 && !allMatched && (
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          )}

          {allMatched && (
            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-3 rounded-lg bg-orange-50 text-center text-sm font-medium text-orange-700">
                {attempts <= totalPairs
                  ? '🌟 Excellent! All matched perfectly!'
                  : '✅ All matched! Good effort!'}
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
