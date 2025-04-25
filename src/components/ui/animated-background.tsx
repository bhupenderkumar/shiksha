import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-provider";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  particleCount?: number;
  className?: string;
  interactive?: boolean;
}

export function AnimatedBackground({
  particleCount = 50,
  className = "",
  interactive = true,
}: AnimatedBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    opacity: number;
  }>>([]);

  // Mouse position tracking for interactive effects
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);
  
  // Generate particles
  useEffect(() => {
    const colors = isDark 
      ? ['#88c0d0', '#81a1c1', '#b48ead', '#ebcb8b', '#a3be8c']
      : ['#ff9b71', '#e84855', '#4e4187', '#2a9d8f', '#f9c74f'];
      
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.1
    }));
    
    setParticles(newParticles);
  }, [isDark, particleCount]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Floating particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            x: particle.x,
            y: particle.y,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          animate={{
            y: [particle.y, particle.y - 200, particle.y],
            x: [particle.x, particle.x + (Math.random() * 100 - 50), particle.x]
          }}
          transition={{
            duration: 15 / particle.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Interactive light effect that follows mouse */}
      {interactive && (
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl mix-blend-soft-light"
          style={{ 
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            background: `radial-gradient(circle at center, ${
              isDark ? 'rgba(136, 192, 208, 0.3)' : 'rgba(255, 155, 113, 0.3)'
            } 0%, transparent 70%)`,
            transition: 'left 0.3s ease-out, top 0.3s ease-out'
          }}
        />
      )}
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? '#ffffff10' : '#00000010'} 1px, transparent 1px),
                           linear-gradient(to bottom, ${isDark ? '#ffffff10' : '#00000010'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Radial gradient that follows mouse for interactive feel */}
      {interactive && (
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
              ${isDark ? 'rgba(136, 192, 208, 0.1)' : 'rgba(255, 155, 113, 0.1)'} 0%, 
              transparent 15%)`
          }}
        />
      )}
    </div>
  );
}
