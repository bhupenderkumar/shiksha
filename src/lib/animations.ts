import { cn } from "./utils";

// Animation class utilities
export const animations = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-700",
  fadeInSlow: "animate-in fade-in duration-1000",
  fadeInFast: "animate-in fade-in duration-500",
  fadeInUp: "animate-in fade-in slide-in-from-bottom duration-700",
  
  // Slide animations
  slideInFromBottom: "animate-in slide-in-from-bottom duration-700",
  slideInFromTop: "animate-in slide-in-from-top duration-700",
  slideInFromLeft: "animate-in slide-in-from-left duration-700",
  slideInFromRight: "animate-in slide-in-from-right duration-700",
  
  // Scale animations
  scaleIn: "animate-in zoom-in duration-700",
  scaleInFast: "animate-in zoom-in duration-500",
  
  // Combined effects
  heroReveal: "animate-in fade-in slide-in-from-bottom duration-1000",
  cardPopIn: "animate-in fade-in zoom-in duration-500",
  
  // Special effects
  glowPulse: "animate-pulse",
  shimmer: "animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent",
  float: "animate-float",
};

// Delay utilities
export const delays = {
  none: "",
  small: "delay-100",
  medium: "delay-200",
  large: "delay-300",
  xl: "delay-500",
  "2xl": "delay-700",
};

// Helper function to combine animations with delays
export function combineAnimations(
  animation: string,
  delay?: keyof typeof delays,
  className?: string
) {
  return cn(animation, delay && delays[delay], className);
}

// Animation variants for intersection observer based animations
export const scrollAnimationVariants = {
  fadeInUp: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
      },
    },
  },
  fadeIn: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  },
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  },
};

// Add tailwind animation keyframes
export const animationKeyframes = {
  float: {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
  shimmer: {
    '0%': {
      backgroundPosition: '-1000px 0',
    },
    '100%': {
      backgroundPosition: '1000px 0',
    },
  },
};