import { cn } from "@/lib/utils";

interface LightingEffectProps {
  className?: string;
  variant?: "glow" | "beam" | "shimmer" | "pulse";
  color?: "primary" | "secondary" | "accent" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const variantStyles = {
  glow: "rounded-full blur-2xl opacity-20",
  beam: "rounded-full blur-3xl opacity-10 rotate-45",
  shimmer: "rounded-full blur-2xl opacity-30 animate-shimmer",
  pulse: "rounded-full blur-2xl opacity-25 animate-pulse",
};

const colorStyles = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  white: "bg-white",
};

const sizeStyles = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[32rem] h-[32rem]",
};

const intensityStyles = {
  low: "opacity-10",
  medium: "opacity-20",
  high: "opacity-30",
};

const positionStyles = {
  top: "-top-1/4 left-1/2 -translate-x-1/2",
  bottom: "-bottom-1/4 left-1/2 -translate-x-1/2",
  left: "-left-1/4 top-1/2 -translate-y-1/2",
  right: "-right-1/4 top-1/2 -translate-y-1/2",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

export function LightingEffect({
  className,
  variant = "glow",
  color = "primary",
  size = "lg",
  intensity = "medium",
  position = "center",
}: LightingEffectProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none mix-blend-soft-light transition-opacity duration-1000",
        variantStyles[variant],
        colorStyles[color],
        sizeStyles[size],
        intensityStyles[intensity],
        positionStyles[position],
        className
      )}
      aria-hidden="true"
    />
  );
}

// Container component that handles relative positioning for lighting effects
interface LightingContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function LightingContainer({ children, className }: LightingContainerProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
    </div>
  );
}