import React, { useRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, ZoomIn, ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ImageGridProps {
  images: Array<{
    id: string;
    url: string | null;
    alt: string;
    isLoading?: boolean;
    loadingText?: string;
    errorText?: string;
  }>;
  onImageClick: (index: number) => void;
  className?: string;
}

const ImageGridItem = React.memo(({ 
  image, 
  index, 
  onClick 
}: { 
  image: ImageGridProps['images'][0]; 
  index: number;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  const renderPlaceholder = () => {
    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <span className="text-sm text-red-500 text-center px-4">
            {image.errorText || 'Failed to load image'}
          </span>
        </div>
      );
    }

    if (!isLoaded || image.isLoading || !image.url) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
          {image.isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-500">
            {image.loadingText || (image.isLoading ? 'Loading...' : 'Loading preview...')}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {inView && (
        <>
          {image.url && !error && (
            <img
              src={image.url}
              alt={image.alt}
              className={cn(
                "w-full h-full object-contain transition-all duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
                isHovered && "scale-[1.02]"
              )}
              onClick={onClick}
              onLoad={() => setIsLoaded(true)}
              onError={handleError}
              loading="lazy"
            />
          )}
          {renderPlaceholder()}
          {isLoaded && !error && (
            <>
              <div className={cn(
                "absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-black/20"
                  onClick={onClick}
                >
                  <ZoomIn className="h-8 w-8" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm truncate px-2">
                  {image.alt}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
});

ImageGridItem.displayName = 'ImageGridItem';

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, className }) => {
  if (!images.length) return null;

  const renderImage = useCallback((image: ImageGridProps['images'][0], index: number) => (
    <ImageGridItem
      key={image.id}
      image={image}
      index={index}
      onClick={() => onImageClick(index)}
    />
  ), [onImageClick]);

  return (
    <div className={cn("grid gap-4", className)}>
      {images.map((image, index) => renderImage(image, index))}
    </div>
  );
};