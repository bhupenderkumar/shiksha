import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
  borderGlow?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
  animated?: boolean;
  shimmer?: boolean;
}

export function GlassmorphicCard({
  children,
  className,
  intensity = "medium",
  borderGlow = false,
  hoverEffect = false,
  onClick,
  animated = false,
  shimmer = false,
}: GlassmorphicCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mouse hover state for enhanced effects
  const [isHovered, setIsHovered] = useState(false);

  // Intensity levels for backdrop blur and background opacity
  const intensityLevels = {
    low: {
      blur: "backdrop-blur-sm",
      bg: isDark ? "bg-black/10" : "bg-white/10",
      border: isDark ? "border-white/5" : "border-black/5",
    },
    medium: {
      blur: "backdrop-blur-md",
      bg: isDark ? "bg-black/20" : "bg-white/20",
      border: isDark ? "border-white/10" : "border-black/10",
    },
    high: {
      blur: "backdrop-blur-lg",
      bg: isDark ? "bg-black/30" : "bg-white/30",
      border: isDark ? "border-white/20" : "border-black/20",
    },
  };

  // Border glow effect - enhanced when hovered
  const glowEffect = borderGlow
    ? isDark
      ? isHovered
        ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.4)]"
        : "border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
      : isHovered
        ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        : "border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
    : "";

  // Hover effects - more pronounced
  const hoverStyles = hoverEffect
    ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 hover:backdrop-blur-xl"
    : "";

  // Shimmer effect
  const shimmerEffect = shimmer ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent" : "";

  // Wrapper component based on animation setting
  const Component = animated ? motion.div : "div";

  // Animation variants
  const animationProps = animated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    whileHover: hoverEffect ? { y: -5, scale: 1.02 } : undefined,
    whileTap: onClick ? { scale: 0.98 } : undefined
  } : {};

  return (
    <Component
      className={cn(
        "rounded-xl border",
        intensityLevels[intensity].blur,
        intensityLevels[intensity].bg,
        intensityLevels[intensity].border,
        glowEffect,
        hoverStyles,
        shimmerEffect,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...animationProps}
    >
      {children}
      {borderGlow && isHovered && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-primary/5 blur-xl" />
      )}
    </Component>
  );
}