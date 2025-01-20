import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryCarouselProps {
  images: Array<{
    url: string;
    alt: string;
  }>;
  onClose?: () => void;
  showControls?: boolean;
}

export const ImageGalleryCarousel: React.FC<ImageGalleryCarouselProps> = ({
  images,
  onClose,
  showControls = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  };

  const resetZoom = () => {
    setIsZoomed(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (isZoomed) {
      resetZoom();
    } else {
      setIsZoomed(true);
      setScale(2);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isZoomed) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPosition({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newX = clientX - startPosition.x;
    const newY = clientY - startPosition.y;

    // Add boundaries to prevent dragging outside image
    const container = containerRef.current;
    if (!container) return;

    const maxX = container.offsetWidth * (scale - 1) / 2;
    const maxY = container.offsetHeight * (scale - 1) / 2;

    setPosition({
      x: Math.max(Math.min(newX, maxX), -maxX),
      y: Math.max(Math.min(newY, maxY), -maxY),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') {
      if (isZoomed) resetZoom();
      else if (onClose) onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  return (
    <div className="relative w-full h-full bg-black/90" ref={containerRef}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Image container */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center overflow-hidden",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className={cn(
            "max-h-full max-w-full object-contain transition-transform duration-200",
            !isZoomed && "cursor-zoom-in hover:opacity-95"
          )}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          onClick={!isDragging ? toggleZoom : undefined}
          draggable={false}
        />
      </div>

      {/* Controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          onClick={() => {
            if (scale > 1) setScale(prev => Math.max(prev - 0.5, 1));
            if (scale === 1) resetZoom();
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          disabled={scale === 1}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setIsZoomed(true);
            setScale(prev => Math.min(prev + 0.5, 3));
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          disabled={scale === 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};