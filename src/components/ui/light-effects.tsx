import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightSpot {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  intensity: number;
}

export function LightEffects() {
  const [lights, setLights] = useState<LightSpot[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLightOn, setIsLightOn] = useState(true);

  // Enhanced light colors with more intensity
  const lightColors = [
    'rgba(64, 156, 255, 0.4)',    // Bright Blue
    'rgba(255, 182, 64, 0.4)',    // Bright Yellow
    'rgba(138, 64, 255, 0.4)',    // Bright Purple
    'rgba(64, 255, 128, 0.4)',    // Bright Green
    'rgba(255, 64, 129, 0.4)',    // Bright Pink
  ];

  useEffect(() => {
    // Create initial light spots
    const initialLights = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 200 + Math.random() * 300,
      opacity: 0.4 + Math.random() * 0.4,
      color: lightColors[Math.floor(Math.random() * lightColors.length)],
      intensity: 0.8 + Math.random() * 0.4
    }));
    setLights(initialLights);

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Light pulsing effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsLightOn(prev => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(pulseInterval);
  }, []);

  // Animate lights with more dynamic movement
  useEffect(() => {
    const interval = setInterval(() => {
      setLights(prevLights =>
        prevLights.map(light => ({
          ...light,
          x: light.x + (Math.random() - 0.5) * 3,
          y: light.y + (Math.random() - 0.5) * 3,
          size: light.size + (Math.random() - 0.5) * 10,
          opacity: (0.4 + Math.random() * 0.4) * (isLightOn ? 1 : 0.3),
          intensity: (0.8 + Math.random() * 0.4) * (isLightOn ? 1 : 0.3)
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isLightOn]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Background light spots */}
      <AnimatePresence>
        {lights.map(light => (
          <motion.div
            key={light.id}
            className="absolute rounded-full"
            animate={{
              x: light.x,
              y: light.y,
              scale: light.size / 100,
              opacity: light.opacity * (isLightOn ? 1 : 0.3),
            }}
            transition={{
              duration: 3,
              ease: "easeInOut"
            }}
            style={{
              background: `radial-gradient(circle at center, ${light.color.replace(', 0.4)', `, ${light.intensity})`)} 0%, transparent 70%)`,
              width: '200px',
              height: '200px',
              filter: `blur(20px) brightness(${isLightOn ? 1.2 : 0.8})`,
              boxShadow: `0 0 ${light.size / 4}px ${light.color.replace(', 0.4)', ', 0.6)')}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Enhanced mouse follower light */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          x: mousePosition.x - 150,
          y: mousePosition.y - 150,
          opacity: isLightOn ? 0.6 : 0.2,
          scale: isLightOn ? 1.2 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(64, 156, 255, 0.6) 0%, transparent 70%)',
          width: '300px',
          height: '300px',
          filter: 'blur(20px)',
          boxShadow: '0 0 50px rgba(64, 156, 255, 0.4)',
        }}
      />

      {/* Dynamic shadow overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0, 0, 0, ${isLightOn ? 0.1 : 0.3}) 100%)`,
          opacity: isLightOn ? 0.7 : 1,
        }}
      />
    </div>
  );
}

// Enhanced gradient text component with light effect
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span 
      className={`relative bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-300% animate-gradient ${className}`}
      style={{
        filter: 'drop-shadow(0 0 10px rgba(var(--primary), 0.3))',
      }}
    >
      {children}
    </span>
  );
}
