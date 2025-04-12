import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useTheme } from "@/lib/theme-provider";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
  borderGlow?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export function GlassmorphicCard({
  children,
  className,
  intensity = "medium",
  borderGlow = false,
  hoverEffect = false,
  onClick,
}: GlassmorphicCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Border glow effect
  const glowEffect = borderGlow
    ? isDark
      ? "border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
      : "border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
    : "";

  // Hover effects
  const hoverStyles = hoverEffect
    ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
    : "";

  return (
    <div
      className={cn(
        "rounded-xl border",
        intensityLevels[intensity].blur,
        intensityLevels[intensity].bg,
        intensityLevels[intensity].border,
        glowEffect,
        hoverStyles,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}