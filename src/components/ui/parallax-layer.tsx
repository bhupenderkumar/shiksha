import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ReactNode, useRef, useState, useEffect } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Negative values move faster, positive values move slower
  direction?: "vertical" | "horizontal";
  offset?: number; // Starting offset position
  mouseEffect?: boolean; // Whether to add mouse movement effect
  mouseIntensity?: number; // Intensity of mouse movement effect (0-1)
}

export function ParallaxLayer({
  children,
  className,
  speed = 0.5,
  direction = "vertical",
  offset = 0,
  mouseEffect = false,
  mouseIntensity = 0.05,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate transform based on scroll position and speed
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "vertical" ? [offset, offset + 100 * speed] : [offset, offset]
  );
  
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "horizontal" ? [offset, offset + 100 * speed] : [offset, offset]
  );

  // Mouse movement effect
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    if (!mouseEffect) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to the center of the screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Calculate distance from center (-1 to 1)
      const moveX = (e.clientX - centerX) / centerX;
      const moveY = (e.clientY - centerY) / centerY;
      
      // Apply intensity
      setMouseX(moveX * mouseIntensity * 100);
      setMouseY(moveY * mouseIntensity * 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseEffect, mouseIntensity]);

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      animate={{
        x: mouseEffect ? mouseX : 0,
        y: mouseEffect ? mouseY : 0,
      }}
      style={{
        translateX: x,
        translateY: y,
      }}
    >
      {children}
    </motion.div>
  );
}