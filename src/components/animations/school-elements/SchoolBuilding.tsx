import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-provider";

interface SchoolBuildingProps {
  className?: string;
}

export function SchoolBuilding({ className = "" }: SchoolBuildingProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Building colors
  const colors = {
    walls: isDark ? "#4c566a" : "#f8f9fa",
    roof: isDark ? "#bf616a" : "#fa5252",
    windows: isDark ? "#88c0d0" : "#74c0fc",
    door: isDark ? "#5e81ac" : "#4c6ef5",
    steps: isDark ? "#d8dee9" : "#ced4da",
    flag: isDark ? "#a3be8c" : "#51cf66",
    chimney: isDark ? "#4c566a" : "#adb5bd",
  };

  // Animation variants
  const buildingAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const windowLightAnimation = {
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const flagAnimation = {
    animate: {
      skewX: [0, 2, 0, -2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const smokeAnimation = {
    animate: {
      y: [-10, -30],
      opacity: [0.8, 0],
      scale: [1, 1.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      variants={buildingAnimation}
      initial="hidden"
      animate="visible"
    >
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Building */}
        <rect x="100" y="100" width="200" height="150" fill={colors.walls} />
        
        {/* Roof */}
        <path
          d="M80 100L200 30L320 100H80Z"
          fill={colors.roof}
        />
        
        {/* Chimney */}
        <rect x="280" y="50" width="20" height="40" fill={colors.chimney} />
        
        {/* Smoke from chimney */}
        <motion.circle
          cx="290"
          cy="40"
          r="5"
          fill={isDark ? "#d8dee9" : "#adb5bd"}
          variants={smokeAnimation}
          animate="animate"
        />
        <motion.circle
          cx="290"
          cy="30"
          r="4"
          fill={isDark ? "#d8dee9" : "#adb5bd"}
          variants={smokeAnimation}
          animate="animate"
          transition={{ delay: 0.5 }}
        />
        <motion.circle
          cx="290"
          cy="20"
          r="3"
          fill={isDark ? "#d8dee9" : "#adb5bd"}
          variants={smokeAnimation}
          animate="animate"
          transition={{ delay: 1 }}
        />
        
        {/* Windows - Top Row */}
        <motion.rect
          x="120"
          y="120"
          width="30"
          height="30"
          fill={colors.windows}
          variants={windowLightAnimation}
          animate="animate"
        />
        <motion.rect
          x="185"
          y="120"
          width="30"
          height="30"
          fill={colors.windows}
          variants={windowLightAnimation}
          animate="animate"
          transition={{ delay: 0.3 }}
        />
        <motion.rect
          x="250"
          y="120"
          width="30"
          height="30"
          fill={colors.windows}
          variants={windowLightAnimation}
          animate="animate"
          transition={{ delay: 0.6 }}
        />
        
        {/* Windows - Bottom Row */}
        <motion.rect
          x="120"
          y="170"
          width="30"
          height="30"
          fill={colors.windows}
          variants={windowLightAnimation}
          animate="animate"
          transition={{ delay: 0.9 }}
        />
        <motion.rect
          x="250"
          y="170"
          width="30"
          height="30"
          fill={colors.windows}
          variants={windowLightAnimation}
          animate="animate"
          transition={{ delay: 1.2 }}
        />
        
        {/* Door */}
        <rect x="185" y="170" width="30" height="80" fill={colors.door} />
        <circle cx="190" cy="210" r="2" fill={isDark ? "#d8dee9" : "#ced4da"} />
        
        {/* Steps */}
        <rect x="175" y="250" width="50" height="10" fill={colors.steps} />
        <rect x="170" y="260" width="60" height="10" fill={colors.steps} />
        <rect x="165" y="270" width="70" height="10" fill={colors.steps} />
        
        {/* Flag on top */}
        <rect x="200" y="30" width="2" height="30" fill={isDark ? "#d8dee9" : "#adb5bd"} />
        <motion.path
          d="M202 30L220 40L202 50V30Z"
          fill={colors.flag}
          variants={flagAnimation}
          animate="animate"
        />
        
        {/* School Sign */}
        <rect x="150" y="80" width="100" height="15" fill={isDark ? "#d8dee9" : "#ced4da"} />
        <text
          x="200"
          y="92"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={isDark ? "#2e3440" : "#212529"}
        >
          FIRST STEP SCHOOL
        </text>
        
        {/* Clock */}
        <circle cx="200" cy="60" r="10" fill={isDark ? "#d8dee9" : "#ffffff"} stroke={isDark ? "#2e3440" : "#212529"} />
        <line x1="200" y1="60" x2="200" y2="54" stroke={isDark ? "#2e3440" : "#212529"} strokeWidth="1" />
        <line x1="200" y1="60" x2="204" y2="60" stroke={isDark ? "#2e3440" : "#212529"} strokeWidth="1" />
      </svg>
    </motion.div>
  );
}