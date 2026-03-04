import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, Palette, Puzzle, Brain, Calculator, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import Layout from '@/components/Layout';
import PublicLayout from '@/components/PublicLayout';

import { ClassLevel, CLASS_LEVEL_LABELS, CLASS_LEVEL_DESCRIPTIONS, TestResult } from '@/components/admission-tests/types';
import { PreNurseryColorTest } from '@/components/admission-tests/PreNurseryColorTest';
import { NurseryMatchingTest } from '@/components/admission-tests/NurseryMatchingTest';
import { KGMatchingTest } from '@/components/admission-tests/KGMatchingTest';
import { Class1MathTest } from '@/components/admission-tests/Class1MathTest';
import { TestResultCard } from '@/components/admission-tests/TestResultCard';

const CLASS_LEVELS: { value: ClassLevel; icon: React.ElementType; color: string; bgGradient: string }[] = [
  { value: 'pre-nursery', icon: Palette, color: 'text-violet-600', bgGradient: 'from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 border-violet-200' },
  { value: 'nursery', icon: Puzzle, color: 'text-emerald-600', bgGradient: 'from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-200' },
  { value: 'kg', icon: Brain, color: 'text-orange-600', bgGradient: 'from-orange-50 to-rose-50 hover:from-orange-100 hover:to-rose-100 border-orange-200' },
  { value: 'class-1', icon: Calculator, color: 'text-blue-600', bgGradient: 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200' },
];

export default function AdmissionTest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialLevel = searchParams.get('level') as ClassLevel | null;
  const initialName = searchParams.get('name') || '';

  const [studentName, setStudentName] = useState(initialName);
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel | null>(initialLevel);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleStartTest = useCallback(() => {
    if (!studentName.trim() || !selectedLevel) return;
    setTestStarted(true);
    setTestResult(null);
  }, [studentName, selectedLevel]);

  const handleComplete = useCallback((result: TestResult) => {
    setTestResult(result);
    setTestStarted(false);
  }, []);

  const handleRetry = useCallback(() => {
    setTestResult(null);
    setTestStarted(true);
  }, []);

  const handleBack = useCallback(() => {
    setTestResult(null);
    setTestStarted(false);
    setSelectedLevel(null);
  }, []);

  const Wrapper = user ? Layout : PublicLayout;

  // Show result
  if (testResult) {
    return (
      <Wrapper>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 pt-6">
          <TestResultCard
            result={testResult}
            studentName={studentName}
            onRetry={handleRetry}
            onBack={handleBack}
          />
        </div>
      </Wrapper>
    );
  }

  // Show active test
  if (testStarted && selectedLevel) {
    return (
      <Wrapper>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 pt-6">
          <div className="max-w-md mx-auto mb-4">
            <Button variant="ghost" size="sm" onClick={() => setTestStarted(false)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Exit Test
            </Button>
          </div>
          {selectedLevel === 'pre-nursery' && (
            <PreNurseryColorTest onComplete={handleComplete} studentName={studentName} />
          )}
          {selectedLevel === 'nursery' && (
            <NurseryMatchingTest onComplete={handleComplete} studentName={studentName} />
          )}
          {selectedLevel === 'kg' && (
            <KGMatchingTest onComplete={handleComplete} studentName={studentName} />
          )}
          {selectedLevel === 'class-1' && (
            <Class1MathTest onComplete={handleComplete} studentName={studentName} />
          )}
        </div>
      </Wrapper>
    );
  }

  // Show test selection screen
  return (
    <Wrapper>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-100/60 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl" />
          </div>

          <div className="relative px-4 py-8 sm:py-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border shadow-sm mb-4">
              <GraduationCap className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">Admission Test</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Student Assessment
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              A quick interactive test to assess the student's readiness for admission
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-8 space-y-6">
          {/* Student Name */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Student Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  placeholder="Enter child's name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Class Level Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Class Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CLASS_LEVELS.map(({ value, icon: Icon, color, bgGradient }) => (
                <button
                  key={value}
                  onClick={() => setSelectedLevel(value)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    'flex items-center gap-4 focus:outline-none active:scale-[0.98]',
                    `bg-gradient-to-r ${bgGradient}`,
                    selectedLevel === value
                      ? 'ring-2 ring-offset-1 ring-violet-400 scale-[1.02] shadow-md'
                      : 'hover:scale-[1.01] hover:shadow-sm'
                  )}
                >
                  <div className={cn('p-2.5 rounded-lg bg-white/80 shadow-sm', color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{CLASS_LEVEL_LABELS[value]}</p>
                    <p className="text-xs text-muted-foreground">{CLASS_LEVEL_DESCRIPTIONS[value]}</p>
                  </div>
                  {selectedLevel === value && (
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Test details for selected level */}
          {selectedLevel && (
            <Card className="animate-in fade-in slide-in-from-bottom-2">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedLevel === 'pre-nursery' && '10 questions about identifying colors with pictures and colored shapes.'}
                    {selectedLevel === 'nursery' && '8 matching exercises: animals to sounds, fruits to colors, shapes and more.'}
                    {selectedLevel === 'kg' && '10 advanced matching exercises with 4 pairs each: letters, numbers, opposites and more.'}
                    {selectedLevel === 'class-1' && '12 math questions: addition, subtraction, comparison, counting and missing numbers.'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Takes approximately 5-10 minutes to complete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start button */}
          <Button
            onClick={handleStartTest}
            disabled={!studentName.trim() || !selectedLevel}
            className="w-full"
            size="lg"
          >
            Start Test
          </Button>
        </div>
      </div>
    </Wrapper>
  );
}
