import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CelebrationAnimationProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  subMessage?: string;
  duration?: number;
  confetti?: boolean;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  character?: 'teacher' | 'student' | 'animal';
}

export function CelebrationAnimation({
  show,
  onComplete,
  message = 'Great Job!',
  subMessage = 'You completed the exercise!',
  duration = 5000,
  confetti = true,
  className,
  actionLabel = 'Continue',
  onAction,
  character = 'teacher'
}: CelebrationAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Set window dimensions for confetti
  useEffect(() => {
    const updateDimensions = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle visibility
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setShowConfetti(confetti);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setShowConfetti(false);
          
          // Give time for confetti to disappear before hiding the celebration
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 1000);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setShowConfetti(false);
      setIsVisible(false);
    }
  }, [show, confetti, duration, onComplete]);

  // Handle action button click
  const handleAction = () => {
    setShowConfetti(false);
    
    // Give time for confetti to disappear
    setTimeout(() => {
      setIsVisible(false);
      if (onAction) onAction();
      else if (onComplete) onComplete();
    }, 500);
  };

  // Get character image based on type
  const getCharacterImage = () => {
    switch (character) {
      case 'teacher':
        return '/assets/characters/teacher-celebrating.svg';
      case 'student':
        return '/assets/characters/student-celebrating.svg';
      case 'animal':
        return '/assets/characters/animal-celebrating.svg';
      default:
        return '/assets/characters/teacher-celebrating.svg';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
            className
          )}
        >
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
              colors={['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0']}
            />
          )}
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-4 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent/10" />
            
            {/* Character image */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="w-32 h-32 mx-auto mb-4"
            >
              <img
                src={getCharacterImage()}
                alt="Celebrating character"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFOUVDRUYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZDNzU3RCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q2hhcmFjdGVyPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </motion.div>
            
            {/* Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-primary mb-2"
            >
              {message}
            </motion.h2>
            
            {/* Sub-message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-gray-600 mb-6"
            >
              {subMessage}
            </motion.p>
            
            {/* Action button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={handleAction}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-full shadow-md"
              >
                {actionLabel}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
