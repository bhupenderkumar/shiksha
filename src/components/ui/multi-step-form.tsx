import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isOptional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onCancel?: () => void;
  initialStep?: number;
  className?: string;
  showStepIndicator?: boolean;
  allowSkipToStep?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  completeButtonText?: string;
  cancelButtonText?: string;
}

export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  initialStep = 0,
  className,
  showStepIndicator = true,
  allowSkipToStep = false,
  nextButtonText = 'Next',
  prevButtonText = 'Back',
  completeButtonText = 'Complete',
  cancelButtonText = 'Cancel'
}: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }
    
    setCompletedSteps(prev => [...prev, currentStep.id]);
    setCurrentStepIndex(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    setCurrentStepIndex(prev => prev - 1);
  };
  
  const handleStepClick = (index: number) => {
    if (!allowSkipToStep) return;
    
    // Only allow going to completed steps or the next step
    if (completedSteps.includes(steps[index].id) || index === currentStepIndex + 1) {
      setCurrentStepIndex(index);
    }
  };
  
  return (
    <div className={cn('space-y-8', className)}>
      {showStepIndicator && (
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStepIndex;
              
              return (
                <div 
                  key={step.id} 
                  className={cn(
                    'flex flex-col items-center space-y-2',
                    (allowSkipToStep && (isCompleted || index === currentStepIndex + 1)) && 'cursor-pointer'
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  <div 
                    className={cn(
                      'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                      isCompleted ? 'bg-primary border-primary text-white' : 
                      isCurrent ? 'bg-white border-primary text-primary' : 
                      'bg-white border-gray-300 text-gray-500'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-center max-w-[80px]">
                    {step.title}
                    {step.isOptional && <span className="text-gray-400 block">(Optional)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="p-4 border rounded-lg bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{currentStep.title}</h2>
          {currentStep.description && (
            <p className="text-gray-500 mt-1">{currentStep.description}</p>
          )}
        </div>
        
        <div className="mb-8">
          {currentStep.component}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                {cancelButtonText}
              </Button>
            )}
            
            {!isFirstStep && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {prevButtonText}
              </Button>
            )}
          </div>
          
          <Button onClick={handleNext}>
            {isLastStep ? (
              completeButtonText
            ) : (
              <>
                {nextButtonText}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
