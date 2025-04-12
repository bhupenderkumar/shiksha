import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  as: Component = "div",
  maxWidth = "xl",
  padding = "md",
  centered = true,
}: ResponsiveContainerProps) {
  // Max width classes
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
    none: "",
  };

  // Padding classes
  const paddingClasses = {
    none: "px-0",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6 md:px-8",
    lg: "px-6 sm:px-8 md:px-12 lg:px-16",
  };

  return (
    <Component
      className={cn(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centered && "mx-auto",
        className
      )}
    >
      {children}
    </Component>
  );
}