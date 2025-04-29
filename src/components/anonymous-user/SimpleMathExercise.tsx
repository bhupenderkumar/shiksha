import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimpleMathExerciseProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (correct: boolean) => void;
  autoAdvance?: boolean;
}

export function SimpleMathExercise({
  difficulty = 'easy',
  onComplete
}: SimpleMathExerciseProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState<'+' | '-' | '*' | '/'>('*');
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Generate a new math problem
  const generateProblem = () => {
    let n1 = 0, n2 = 0, op: '+' | '-' | '*' | '/' = '+';

    switch (difficulty) {
      case 'easy':
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        op = Math.random() > 0.5 ? '+' : '-';
        // Ensure no negative results for subtraction
        if (op === '-' && n2 > n1) {
          [n1, n2] = [n2, n1];
        }
        break;
      case 'medium':
        n1 = Math.floor(Math.random() * 20) + 1; // 1-20
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        op = ['+', '-', '*'][Math.floor(Math.random() * 3)] as '+' | '-' | '*';
        // Ensure no negative results for subtraction
        if (op === '-' && n2 > n1) {
          [n1, n2] = [n2, n1];
        }
        break;
      case 'hard':
        n1 = Math.floor(Math.random() * 50) + 1; // 1-50
        n2 = Math.floor(Math.random() * 20) + 1; // 1-20
        op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)] as '+' | '-' | '*' | '/';
        // Ensure no negative results for subtraction
        if (op === '-' && n2 > n1) {
          [n1, n2] = [n2, n1];
        }
        // Ensure division results in a whole number
        if (op === '/') {
          n1 = n2 * (Math.floor(Math.random() * 10) + 1);
        }
        break;
    }

    setNum1(n1);
    setNum2(n2);
    setOperation(op);
    setAnswer('');
    setIsCorrect(null);
  };

  // Calculate the correct answer
  const calculateCorrectAnswer = (): number => {
    switch (operation) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '*': return num1 * num2;
      case '/': return num1 / num2;
      default: return 0;
    }
  };

  // Check the user's answer
  const checkAnswer = () => {
    const userAnswer = parseFloat(answer);
    const correctAnswer = calculateCorrectAnswer();

    if (isNaN(userAnswer)) {
      toast.error('Please enter a valid number');
      return;
    }

    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);
    setAttempts(prev => prev + 1);

    if (correct) {
      toast.success('Correct answer!');
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete?.(true);
    } else {
      toast.error('Try again!');
      onComplete?.(false);
    }
  };

  // Generate a new problem on initial render
  useEffect(() => {
    generateProblem();
  }, [difficulty]);

  // Get the operation symbol for display
  const getOperationSymbol = () => {
    switch (operation) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return '+';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Quick Math Exercise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold mb-6 flex items-center justify-center">
            <span>{num1}</span>
            <span className="mx-4">{getOperationSymbol()}</span>
            <span>{num2}</span>
            <span className="mx-4">=</span>
            <div className="relative">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={`w-24 text-center text-2xl ${
                  isCorrect === true ? 'border-green-500 bg-green-50' :
                  isCorrect === false ? 'border-red-500 bg-red-50' : ''
                }`}
                placeholder="?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    checkAnswer();
                  }
                }}
              />
              {isCorrect === true && (
                <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              )}
              {isCorrect === false && (
                <X className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
              )}
            </div>
          </div>

          {isCorrect === false && (
            <p className="text-red-500 mb-4">
              Try again! You can do it.
            </p>
          )}

          <div className="flex gap-4">
            <Button onClick={checkAnswer} disabled={!answer}>
              Check Answer
            </Button>
            <Button variant="outline" onClick={generateProblem}>
              New Problem
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </div>
        <div className="text-sm text-gray-500">
          Attempts: {attempts}
        </div>
      </CardFooter>
    </Card>
  );
}

export default SimpleMathExercise;
