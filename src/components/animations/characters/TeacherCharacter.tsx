import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-provider";

interface TeacherCharacterProps {
  className?: string;
  direction?: "left" | "right";
  variant?: "standing" | "pointing" | "walking";
  delay?: number;
}

export function TeacherCharacter({
  className = "",
  direction = "right",
  variant = "standing",
  delay = 0
}: TeacherCharacterProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Character colors
  const colors = {
    skin: isDark ? "#e0b088" : "#ffcba4",
    outfit: isDark ? "#5e81ac" : "#4c6ef5",
    hair: isDark ? "#d8dee9" : "#adb5bd",
    glasses: isDark ? "#eceff4" : "#dee2e6",
    book: isDark ? "#bf616a" : "#fa5252",
  };

  // Animation variants
  const walkingAnimation = {
    animate: {
      x: direction === "right" ? [0, 80, 0] : [0, -80, 0],
      transition: {
        x: {
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay,
        },
      }
    }
  };

  const pointingAnimation = {
    animate: {
      rotate: [0, 5, 0, -5, 0],
      transition: {
        rotate: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }
    }
  };

  const standingAnimation = {
    animate: {
      y: [0, -3, 0],
      transition: {
        y: {
          duration: 2.5,
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
    variant === "pointing" ? pointingAnimation :
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
        width="70"
        height="120"
        viewBox="0 0 70 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="35" cy="20" r="15" fill={colors.skin} />
        
        {/* Hair */}
        <path
          d="M20 15C20 15 25 5 35 5C45 5 50 15 50 15V20C50 20 45 15 35 15C25 15 20 20 20 20V15Z"
          fill={colors.hair}
        />
        
        {/* Glasses */}
        <rect x="25" y="17" width="8" height="5" rx="2.5" stroke={colors.glasses} strokeWidth="1.5" />
        <rect x="37" y="17" width="8" height="5" rx="2.5" stroke={colors.glasses} strokeWidth="1.5" />
        <line x1="33" y1="19.5" x2="37" y2="19.5" stroke={colors.glasses} strokeWidth="1.5" />
        
        {/* Eyes */}
        <circle cx="29" cy="19.5" r="1.5" fill={isDark ? "#ffffff" : "#000000"} />
        <circle cx="41" cy="19.5" r="1.5" fill={isDark ? "#ffffff" : "#000000"} />
        
        {/* Smile */}
        <path
          d="M30 25C30 25 32 28 35 28C38 28 40 25 40 25"
          stroke={isDark ? "#ffffff" : "#000000"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Body - Teacher's outfit */}
        <path
          d="M25 35L35 40L45 35V70H25V35Z"
          fill={colors.outfit}
        />
        
        {/* Arms */}
        <rect x="15" y="35" width="10" height="25" rx="5" fill={colors.outfit} />
        <rect x="45" y="35" width="10" height="25" rx="5" fill={colors.outfit} />
        
        {/* Book in hand */}
        <rect x="10" y="55" width="15" height="10" rx="2" fill={colors.book} />
        <line x1="15" y1="57" x2="20" y2="57" stroke={isDark ? "#eceff4" : "#ffffff"} strokeWidth="1" />
        <line x1="15" y1="60" x2="20" y2="60" stroke={isDark ? "#eceff4" : "#ffffff"} strokeWidth="1" />
        <line x1="15" y1="63" x2="20" y2="63" stroke={isDark ? "#eceff4" : "#ffffff"} strokeWidth="1" />
        
        {/* Legs */}
        <rect x="28" y="70" width="6" height="40" fill={isDark ? "#2e3440" : "#343a40"} />
        <rect x="36" y="70" width="6" height="40" fill={isDark ? "#2e3440" : "#343a40"} />
        
        {/* Shoes */}
        <rect x="26" y="110" width="10" height="5" rx="2.5" fill={isDark ? "#2e3440" : "#212529"} />
        <rect x="34" y="110" width="10" height="5" rx="2.5" fill={isDark ? "#2e3440" : "#212529"} />
      </svg>
    </motion.div>
  );
}