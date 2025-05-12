import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, XCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { playSound } from '@/utils/soundUtils';

interface ExerciseScoreCardProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers?: number;
  onContinue?: () => void;
  onTryAgain?: () => void;
  showConfetti?: boolean;
  className?: string;
  childFriendly?: boolean;
}

export function ExerciseScoreCard({
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  skippedAnswers = 0,
  onContinue,
  onTryAgain,
  showConfetti = true,
  className,
  childFriendly = true
}: ExerciseScoreCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Determine feedback message based on score
  const getFeedbackMessage = () => {
    if (score >= 90) return 'Excellent job!';
    if (score >= 75) return 'Great work!';
    if (score >= 60) return 'Good effort!';
    if (score >= 40) return 'Nice try!';
    return 'Keep practicing!';
  };

  // Get star rating based on score (1-5 stars)
  const getStarRating = () => {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  // Animation and sound effects when component mounts
  useEffect(() => {
    setIsVisible(true);
    
    // Play celebration sound
    playSound('celebration', 0.7);
    
    // Launch confetti if score is good and showConfetti is true
    if (showConfetti && score >= 60) {
      const end = Date.now() + 2000;
      const colors = ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#1E90FF'];
      
      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [score, showConfetti]);

  // Calculate star rating
  const starRating = getStarRating();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "bg-white rounded-lg shadow-lg overflow-hidden",
            childFriendly ? "border-4 border-primary-300" : "border border-gray-200",
            className
          )}
        >
          {/* Header */}
          <div className={cn(
            "p-6 text-white text-center",
            score >= 75 ? "bg-green-500" : 
            score >= 60 ? "bg-blue-500" : 
            score >= 40 ? "bg-yellow-500" : "bg-red-500"
          )}>
            <h2 className="text-2xl font-bold mb-1">Your Score: {score}%</h2>
            <p className="text-lg">{getFeedbackMessage()}</p>
          </div>
          
          {/* Score details */}
          <div className="p-6">
            {/* Star rating */}
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-8 h-8 mx-1",
                    i < starRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="mb-6">
              <Progress value={score} className="h-3" />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Incorrect</p>
                <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Award className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{totalQuestions}</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center space-x-4">
              {onTryAgain && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    playSound('click');
                    onTryAgain();
                  }}
                >
                  Try Again
                </Button>
              )}
              
              {onContinue && (
                <Button 
                  onClick={() => {
                    playSound('click');
                    onContinue();
                  }}
                  className={cn(
                    score >= 75 ? "bg-green-600 hover:bg-green-700" : 
                    score >= 60 ? "bg-blue-600 hover:bg-blue-700" : 
                    "bg-primary"
                  )}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExerciseScoreCard;
