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
  correctPairs: Record<string, string>;
}

// KG has 4 items per question (harder than nursery's 3)
const QUESTIONS: MatchQuestion[] = [
  {
    id: 1,
    instruction: '🔤 Match the letter to the picture',
    leftItems: [
      { id: 'a', emoji: '🅰️', label: 'A' },
      { id: 'b', emoji: '🅱️', label: 'B' },
      { id: 'c', emoji: '©️', label: 'C' },
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
    instruction: '🔢 Match the number to the group',
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
    instruction: '↔️ Match the opposite words',
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
    instruction: '🍽️ Match the animal to what it eats',
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
    instruction: '📐 Match the shape to its sides',
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
    instruction: '🚗 Match the vehicle to where it travels',
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
    instruction: '👩‍⚕️ Match the professional to their tool',
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
    instruction: '🇮🇳 Match the flag to the landmark',
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
    instruction: '👀 Match the body part to its function',
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
    instruction: '🔡 Match the word to its first letter',
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
  // New harder questions
  {
    id: 11,
    instruction: '⏰ Match the time to the activity',
    leftItems: [
      { id: 'morning', emoji: '🌅', label: 'Morning' },
      { id: 'afternoon', emoji: '☀️', label: 'Afternoon' },
      { id: 'evening', emoji: '🌆', label: 'Evening' },
      { id: 'night', emoji: '🌙', label: 'Night' },
    ],
    rightItems: [
      { id: 'sleep', emoji: '😴', label: 'Sleeping' },
      { id: 'brush', emoji: '🪥', label: 'Brush Teeth' },
      { id: 'homework', emoji: '📖', label: 'Homework' },
      { id: 'play', emoji: '⚽', label: 'Play Outside' },
    ],
    correctPairs: { morning: 'brush', afternoon: 'play', evening: 'homework', night: 'sleep' },
  },
  {
    id: 12,
    instruction: '🔢 Which number comes next?',
    leftItems: [
      { id: 'after2', emoji: '2️⃣', label: 'After 2' },
      { id: 'after5', emoji: '5️⃣', label: 'After 5' },
      { id: 'after8', emoji: '8️⃣', label: 'After 8' },
      { id: 'after3', emoji: '3️⃣', label: 'After 3' },
    ],
    rightItems: [
      { id: 'n4', emoji: '4️⃣', label: '4' },
      { id: 'n9', emoji: '9️⃣', label: '9' },
      { id: 'n3', emoji: '3️⃣', label: '3' },
      { id: 'n6', emoji: '6️⃣', label: '6' },
    ],
    correctPairs: { after2: 'n3', after5: 'n6', after8: 'n9', after3: 'n4' },
  },
];

export function KGMatchingTest({ onComplete, studentName }: TestComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
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
    if (matchedPairs[id]) return;
    playTap();
    setSelectedLeft(id);
    setWrongPair(null);
  }, [matchedPairs, playTap]);

  const handleRightSelect = useCallback((rightId: string) => {
    if (!selectedLeft) return;
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
      setAttempts(prev => prev + 1);
      setWrongPair({ left: selectedLeft, right: rightId });
      setTimeout(() => setWrongPair(null), 600);
    }
  }, [selectedLeft, matchedPairs, question, playMatch, playOhOh]);

  const handleNext = useCallback(() => {
    playWhoosh();
    // Mark correct only if completed with fewer than 3 wrong attempts per pair
    const maxWrongAllowed = totalPairs * 2;
    const isGood = attempts <= maxWrongAllowed;
    const newAnswers = [...answers, { questionId: question.id, correct: isGood }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      playCelebration();
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
  }, [answers, question, totalPairs, attempts, currentQ, onComplete, playWhoosh, playCelebration]);

  const handleReset = useCallback(() => {
    setSelectedLeft(null);
    setMatchedPairs({});
    setWrongPair(null);
    setAttempts(prev => prev + totalPairs); // Penalty for reset
  }, [totalPairs]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress with star indicators */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <span className="text-base">🧠</span>
            Round {currentQ + 1} of {QUESTIONS.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-base">🎓</span>
            {studentName}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-center gap-0.5 flex-wrap">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="text-xs">
              {i < answers.length
                ? (answers[i].correct ? '⭐' : '⚪')
                : i === currentQ ? '🟠' : '⚪'}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-2 border-orange-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-orange-100 via-rose-50 to-pink-100 p-4 text-center relative">
          <div className="absolute top-1 left-2 text-lg animate-pulse">🌟</div>
          <div className="absolute top-1 right-2 text-lg animate-pulse" style={{ animationDelay: '0.7s' }}>🌟</div>

          <p className="text-base font-bold text-orange-800">{question.instruction}</p>
          <p className="text-xs text-orange-600 mt-1">
            Tap left → then tap its match on right ({totalPairs} pairs)
          </p>
          {/* Match progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-4 h-4 rounded-full transition-all duration-300 border-2',
                  i < matchedCount
                    ? 'bg-orange-400 border-orange-500 scale-110 shadow-sm shadow-orange-300'
                    : 'bg-white border-gray-300'
                )}
              >
                {i < matchedCount && <span className="text-[8px] flex items-center justify-center h-full text-white">✓</span>}
              </div>
            ))}
          </div>
        </div>

        <CardContent className="p-3 relative">
          {/* Flash effect on match */}
          {showMatchFlash && (
            <div className="absolute inset-0 bg-orange-100/50 animate-ping pointer-events-none z-10 rounded-lg" />
          )}

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
                      'w-full p-2.5 rounded-2xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-90 shadow-sm',
                      isMatched && 'bg-orange-50 border-orange-300 opacity-50 scale-95',
                      isSelected && !isWrong && 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 scale-105 shadow-md shadow-blue-200',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isSelected && !isWrong && 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    )}
                  >
                    <span className={cn('text-2xl block', isMatched && 'opacity-50')}>{item.emoji}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                    {isMatched && <span className="text-xs text-orange-500">✓</span>}
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
                      'w-full p-2.5 rounded-2xl border-2 transition-all duration-200 text-center',
                      'focus:outline-none active:scale-90 shadow-sm',
                      isMatched && 'bg-orange-50 border-orange-300 opacity-50 scale-95',
                      isWrong && 'bg-red-50 border-red-400 animate-pulse',
                      !isMatched && !isWrong && selectedLeft && 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md cursor-pointer',
                      !isMatched && !isWrong && !selectedLeft && 'bg-gray-50 border-gray-200 opacity-60'
                    )}
                  >
                    <span className={cn('text-2xl block', isMatched && 'opacity-50')}>{item.emoji}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                    {isMatched && <span className="text-xs text-orange-500">✓</span>}
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
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-700 font-bold">
                  {attempts <= totalPairs ? (
                    <>
                      <span className="text-2xl animate-bounce">🌟</span>
                      <span>Excellent! Perfect matching!</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">✅</span>
                      <span>All matched! Good effort!</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg rounded-2xl h-12 text-base font-bold"
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
