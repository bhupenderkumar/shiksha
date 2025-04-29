import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound } from '@/utils/soundUtils';

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  message?: string;
  autoHide?: boolean;
  hideDelay?: number;
  onHide?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  playSound?: boolean;
}

export function AnswerFeedback({
  isCorrect,
  message,
  autoHide = false,
  hideDelay = 2000,
  onHide,
  className,
  size = 'md',
  playSound: shouldPlaySound = true
}: AnswerFeedbackProps) {
  // Play sound effect when the component mounts
  useEffect(() => {
    if (shouldPlaySound) {
      if (isCorrect === true) {
        playSound('correct');
      } else if (isCorrect === false) {
        playSound('incorrect');
      }
    }
    
    // Auto-hide after delay if enabled
    if (autoHide && onHide) {
      const timer = setTimeout(() => {
        onHide();
      }, hideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isCorrect, autoHide, hideDelay, onHide, shouldPlaySound]);

  // If isCorrect is null, don't show anything
  if (isCorrect === null) return null;

  // Determine icon size based on the size prop
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  // Determine text size based on the size prop
  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center p-2 rounded-md",
          isCorrect ? "bg-green-50 text-green-700 border border-green-200" : 
                     "bg-red-50 text-red-700 border border-red-200",
          getTextSize(),
          className
        )}
      >
        {isCorrect ? (
          <CheckCircle className={cn("mr-2 text-green-600", getIconSize())} />
        ) : (
          <XCircle className={cn("mr-2 text-red-600", getIconSize())} />
        )}
        
        <span className="font-medium">
          {message || (isCorrect ? "Correct!" : "Incorrect!")}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

export default AnswerFeedback;
