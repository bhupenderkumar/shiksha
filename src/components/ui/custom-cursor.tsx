import { useEffect, useState, useRef } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface TrailDot extends CursorPosition {
  id: string;
}

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [isPointer, setIsPointer] = useState(false);
  const idCounterRef = useRef(0);

  useEffect(() => {
    const MAX_TRAIL_LENGTH = 5;
    let timeoutId: number;

    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Add new dot to trail with a truly unique ID
      setTrail(prevTrail => {
        // Increment counter for each new dot to ensure uniqueness
        idCounterRef.current += 1;
        const newDot = {
          x: e.clientX,
          y: e.clientY,
          id: `dot-${Date.now()}-${idCounterRef.current}`
        };
        const updatedTrail = [...prevTrail, newDot].slice(-MAX_TRAIL_LENGTH);
        return updatedTrail;
      });

      // Check if cursor is over clickable element
      const target = e.target as HTMLElement;
      const isClickable = target.matches('a, button, input, textarea, [role="button"]');
      setIsPointer(isClickable);

      // Clear old trail dots
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setTrail([]);
      }, 100);
    };

    window.addEventListener('mousemove', updateCursorPosition);
    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        className="custom-cursor-outer"
        style={{
          transform: `translate(${position.x - 15}px, ${position.y - 15}px)`,
          scale: isPointer ? '1.5' : '1'
        }}
      />
      <div
        className="custom-cursor-inner"
        style={{
          transform: `translate(${position.x - 4}px, ${position.y - 4}px)`
        }}
      />

      {/* Cursor trail */}
      {trail.map((dot, index) => (
        <div
          key={dot.id}
          className="cursor-trail"
          style={{
            transform: `translate(${dot.x - 3}px, ${dot.y - 3}px)`,
            opacity: (index + 1) / trail.length * 0.5
          }}
        />
      ))}
    </>
  );
}
