import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestResult as TestResultType, CLASS_LEVEL_LABELS, CLASS_LEVEL_DESCRIPTIONS } from './types';
import { CheckCircle, XCircle, Clock, Trophy, Star, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResultProps {
  result: TestResultType;
  studentName: string;
  onRetry: () => void;
  onBack: () => void;
}

export function TestResultCard({ result, studentName, onRetry, onBack }: TestResultProps) {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent! ⭐', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { label: 'Very Good! 🌟', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 50) return { label: 'Good Job! 👍', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Keep Trying! 💪', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card className="overflow-hidden">
        <div className={cn('p-6 text-center', grade.bg)}>
          <Trophy className={cn('w-16 h-16 mx-auto mb-3', grade.color)} />
          <h2 className={cn('text-2xl font-bold', grade.color)}>{grade.label}</h2>
          <p className="text-muted-foreground mt-1">{studentName}</p>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {CLASS_LEVEL_LABELS[result.classLevel]} — {CLASS_LEVEL_DESCRIPTIONS[result.classLevel]}
            </p>
          </div>

          {/* Score circle */}
          <div className="flex justify-center">
            <div className={cn(
              'w-28 h-28 rounded-full flex flex-col items-center justify-center border-4',
              percentage >= 70 ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'
            )}>
              <span className="text-3xl font-bold">{percentage}%</span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-lg font-bold text-green-700">{result.correctAnswers}</p>
              <p className="text-xs text-green-600">Correct</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <p className="text-lg font-bold text-red-700">{result.totalQuestions - result.correctAnswers}</p>
              <p className="text-xs text-red-600">Wrong</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-blue-700">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              <p className="text-xs text-blue-600">Time</p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-6 h-6',
                  i < Math.ceil(percentage / 20)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200'
                )}
              />
            ))}
          </div>

          {/* Question breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Question Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {result.answers.map((ans, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    ans.correct
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button className="flex-1" onClick={onBack}>
              Back to Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
