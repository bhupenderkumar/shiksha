import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  variant?: "fadeIn" | "slideUp" | "bounce";
}

export function AnimatedText({ text, className, variant = "fadeIn" }: AnimatedTextProps) {
  const animations = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 }
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.5, ease: "easeOut" }
    },
    bounce: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  const selectedAnimation = animations[variant];

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={selectedAnimation.transition}
    >
      {text}
    </motion.span>
  );
}
