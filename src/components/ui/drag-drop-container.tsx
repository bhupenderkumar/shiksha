import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DragDropContainerProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  className?: string;
  strategy?: 'translate' | 'transform';
  collisionDetection?: any;
}

export function DragDropContainer({
  children,
  onDragEnd,
  onDragStart,
  className,
  strategy = 'translate',
  collisionDetection
}: DragDropContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Configure sensors for both mouse/touch input
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay for touch devices
        tolerance: 8, // 8px of movement allowed during delay
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (onDragStart) onDragStart(event);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={{
        threshold: {
          x: 0.1,
          y: 0.25
        },
        acceleration: 10
      }}
      collisionDetection={collisionDetection}
    >
      <div className={cn("relative", className)}>
        {children}
      </div>
    </DndContext>
  );
}

// Draggable item component
interface DraggableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Draggable({ id, children, className, disabled = false }: DraggableProps) {
  return (
    <div
      data-draggable-id={id}
      className={cn(
        "cursor-grab active:cursor-grabbing touch-manipulation",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </div>
  );
}

// Droppable area component
interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isOver?: boolean;
  isActive?: boolean;
  disabled?: boolean;
}

export function Droppable({
  id,
  children,
  className,
  isOver = false,
  isActive = false,
  disabled = false
}: DroppableProps) {
  return (
    <div
      data-droppable-id={id}
      className={cn(
        "transition-colors duration-200",
        isOver && !disabled && "ring-2 ring-primary bg-primary-50",
        isActive && !disabled && "bg-primary-100",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </div>
  );
}
