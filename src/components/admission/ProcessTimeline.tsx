import React from 'react';
import { AdmissionTimelineStep } from '@/types/admission';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessTimelineProps {
  steps: AdmissionTimelineStep[];
  currentStep: number;
}

export function ProcessTimeline({ steps, currentStep }: ProcessTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Admission Process Timeline</h3>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-start mb-8 last:mb-0">
            {/* Timeline line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute w-0.5 h-full left-3 -translate-x-1/2 top-6",
                  step.completed ? "bg-primary" : "bg-muted"
                )}
              />
            )}

            {/* Step marker */}
            <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full">
              {step.completed ? (
                <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : step.current ? (
                <div className="flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full">
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-muted rounded-full" />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">{step.title}</h4>
                {step.label && (
                  <span className={cn(
                    "ml-2 px-2 py-0.5 text-xs rounded-full",
                    step.completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}