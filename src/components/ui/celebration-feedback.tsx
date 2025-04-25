import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CelebrationFeedbackProps {
  show: boolean;
  message?: string;
  subMessage?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  confettiDuration?: number;
  className?: string;
  ageGroup?: 'nursery' | 'lkg' | 'ukg' | 'elementary';
}

export function CelebrationFeedback({
  show,
  message = 'Great job!',
  subMessage = 'You completed the assignment!',
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  confettiDuration = 3000,
  className,
  ageGroup = 'elementary'
}: CelebrationFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [audio] = useState<HTMLAudioElement | null>(
    typeof window !== 'undefined' ? new Audio('/sounds/celebration.mp3') : null
  );
  
  useEffect(() => {
    setIsVisible(show);
    
    if (show) {
      // Play sound
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error('Failed to play celebration sound:', error);
        });
      }
      
      // Launch confetti
      const end = Date.now() + confettiDuration;
      
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
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
      
      // Auto close if enabled
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, audio, autoClose, autoCloseDelay, confettiDuration, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  // Age-specific styling
  const getAgeSpecificStyles = () => {
    switch (ageGroup) {
      case 'nursery':
      case 'lkg':
        return {
          container: 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 border-4 border-yellow-300 rounded-3xl',
          title: 'text-3xl font-bold text-white drop-shadow-lg',
          subtitle: 'text-xl text-white',
          button: 'bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold rounded-full text-lg px-6 py-3'
        };
      case 'ukg':
        return {
          container: 'bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 border-4 border-orange-300 rounded-2xl',
          title: 'text-2xl font-bold text-white drop-shadow-md',
          subtitle: 'text-lg text-white',
          button: 'bg-orange-400 hover:bg-orange-500 text-blue-900 font-bold rounded-full text-base px-5 py-2'
        };
      case 'elementary':
      default:
        return {
          container: 'bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-200 rounded-xl',
          title: 'text-xl font-bold text-white',
          subtitle: 'text-base text-white',
          button: 'bg-white hover:bg-gray-100 text-purple-700 font-semibold rounded-lg'
        };
    }
  };
  
  const styles = getAgeSpecificStyles();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            className
          )}
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className={cn(
              'relative max-w-md w-full p-6 shadow-2xl',
              styles.container
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Animated stars or characters based on age group */}
              {(ageGroup === 'nursery' || ageGroup === 'lkg') && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-5xl mb-2"
                >
                  ⭐
                </motion.div>
              )}
              
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={styles.title}
              >
                {message}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={styles.subtitle}
              >
                {subMessage}
              </motion.p>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="mt-4"
              >
                <Button
                  onClick={handleClose}
                  className={styles.button}
                >
                  {ageGroup === 'nursery' || ageGroup === 'lkg' 
                    ? 'Yay!' 
                    : 'Continue'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
