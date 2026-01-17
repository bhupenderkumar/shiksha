import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Download, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileImageViewerProps {
  images: Array<{
    url: string;
    alt: string;
    fileName?: string;
  }>;
  initialIndex?: number;
  onClose?: () => void;
  showControls?: boolean;
  onDownload?: (index: number) => void;
}

export const MobileImageViewer: React.FC<MobileImageViewerProps> = ({
  images,
  initialIndex = 0,
  onClose,
  showControls = true,
  onDownload,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when changing images
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetView();
  }, [images.length, resetView]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetView();
  }, [images.length, resetView]);

  // Handle double tap to zoom
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
      if (scale > 1) {
        resetView();
      } else {
        // Zoom to 2.5x centered on tap position
        const touch = e.touches[0] || e.changedTouches[0];
        if (touch && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = touch.clientX - rect.left - rect.width / 2;
          const y = touch.clientY - rect.top - rect.height / 2;
          setScale(2.5);
          setPosition({ x: -x * 1.5, y: -y * 1.5 });
        } else {
          setScale(2.5);
        }
      }
    }
    setLastTap(now);
  }, [lastTap, scale, resetView]);

  // Calculate distance between two touch points
  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point of two touches
  const getCenter = (touches: TouchList) => {
    if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // Touch start handler
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDoubleTap(e);

    if (e.touches.length === 2) {
      // Pinch zoom start
      setInitialDistance(getDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan start (only when zoomed)
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  // Touch move handler
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const newScale = Math.min(Math.max(initialScale * (currentDistance / initialDistance), 1), 5);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan (only when zoomed)
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      // Calculate bounds based on scale
      const container = containerRef.current;
      if (container) {
        const maxX = (container.offsetWidth * (scale - 1)) / 2;
        const maxY = (container.offsetHeight * (scale - 1)) / 2;
        setPosition({
          x: Math.max(Math.min(newX, maxX), -maxX),
          y: Math.max(Math.min(newY, maxY), -maxY),
        });
      }
    } else if (e.touches.length === 1 && scale === 1) {
      // Swipe detection for navigation (only when not zoomed)
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      
      if (!isDragging) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  // Touch end handler
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale === 1 && isDragging) {
      // Check for swipe
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - dragStart.x;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    }
    
    setIsDragging(false);
    
    // Snap back if scale is less than 1
    if (scale < 1) {
      resetView();
    }
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const container = containerRef.current;
    if (container) {
      const maxX = (container.offsetWidth * (scale - 1)) / 2;
      const maxY = (container.offsetHeight * (scale - 1)) / 2;
      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    const newScale = scale - 0.5;
    if (newScale <= 1) {
      resetView();
    } else {
      setScale(newScale);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          if (scale > 1) {
            resetView();
          } else if (onClose) {
            onClose();
          }
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, scale, resetView, onClose]);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col touch-none"
      ref={containerRef}
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <span className="text-white/90 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        
        <div className="flex items-center gap-2">
          {showControls && (
            <>
              <button
                onClick={zoomOut}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Rotate"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              {onDownload && (
                <button
                  onClick={() => onDownload(currentIndex)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Image container */}
      <div
        className={cn(
          "flex-1 flex items-center justify-center overflow-hidden",
          isDragging && scale > 1 && "cursor-grabbing"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.alt}
          className={cn(
            "max-h-full max-w-full object-contain select-none",
            scale === 1 && "cursor-zoom-in",
            scale > 1 && !isDragging && "cursor-grab"
          )}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
      </div>

      {/* Navigation buttons (visible on larger screens or when not zoomed) */}
      {images.length > 1 && scale === 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors sm:left-4"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors sm:right-4"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetView();
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* File name */}
      {currentImage.fileName && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="px-3 py-1 rounded-full bg-black/60 text-white/80 text-xs truncate max-w-[80%] inline-block">
            {currentImage.fileName}
          </span>
        </div>
      )}
    </div>
  );
};

export default MobileImageViewer;
