import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-provider";

interface StudentCharacterProps {
  className?: string;
  direction?: "left" | "right";
  variant?: "walking" | "jumping" | "standing";
  delay?: number;
}

export function StudentCharacter({
  className = "",
  direction = "right",
  variant = "walking",
  delay = 0
}: StudentCharacterProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Character colors
  const colors = {
    skin: isDark ? "#e0b088" : "#ffcba4",
    shirt: isDark ? "#5e81ac" : "#4dabf7",
    pants: isDark ? "#2e3440" : "#495057",
    hair: isDark ? "#2e3440" : "#212529",
    shoes: isDark ? "#2e3440" : "#212529",
  };

  // Animation variants
  const walkingAnimation = {
    animate: {
      x: direction === "right" ? [0, 100, 0] : [0, -100, 0],
      transition: {
        x: {
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay,
        },
      }
    }
  };

  const jumpingAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        y: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }
    }
  };

  const standingAnimation = {
    animate: {
      y: [0, -5, 0],
      transition: {
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }
    }
  };

  // Select animation based on variant
  const animation = 
    variant === "walking" ? walkingAnimation :
    variant === "jumping" ? jumpingAnimation :
    standingAnimation;

  return (
    <motion.div 
      className={`relative ${className}`}
      variants={animation}
      animate="animate"
      style={{
        transform: direction === "left" ? "scaleX(-1)" : "none"
      }}
    >
      <svg
        width="60"
        height="100"
        viewBox="0 0 60 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="30" cy="20" r="15" fill={colors.skin} />
        
        {/* Hair */}
        <path
          d="M15 15C15 15 20 5 30 5C40 5 45 15 45 15V20C45 20 40 15 30 15C20 15 15 20 15 20V15Z"
          fill={colors.hair}
        />
        
        {/* Eyes */}
        <circle cx="25" cy="18" r="2" fill={isDark ? "#ffffff" : "#000000"} />
        <circle cx="35" cy="18" r="2" fill={isDark ? "#ffffff" : "#000000"} />
        
        {/* Smile */}
        <path
          d="M25 25C25 25 27 28 30 28C33 28 35 25 35 25"
          stroke={isDark ? "#ffffff" : "#000000"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Body */}
        <rect x="20" y="35" width="20" height="25" fill={colors.shirt} />
        
        {/* Arms */}
        <rect x="10" y="35" width="10" height="20" rx="5" fill={colors.shirt} />
        <rect x="40" y="35" width="10" height="20" rx="5" fill={colors.shirt} />
        
        {/* Legs */}
        <rect x="20" y="60" width="8" height="30" fill={colors.pants} />
        <rect x="32" y="60" width="8" height="30" fill={colors.pants} />
        
        {/* Shoes */}
        <rect x="18" y="90" width="12" height="5" rx="2.5" fill={colors.shoes} />
        <rect x="30" y="90" width="12" height="5" rx="2.5" fill={colors.shoes} />
        
        {/* Backpack */}
        <rect x="15" y="40" width="10" height="15" rx="2" fill={isDark ? "#bf616a" : "#ff6b6b"} />
      </svg>
    </motion.div>
  );
}