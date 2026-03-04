import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signedUrlCache } from '@/services/fileService';

interface LazyImageProps {
  filePath: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  /** If true, resolve filePath to a signed URL via cache. If a direct URL is given, set false. */
  resolveUrl?: boolean;
  /** Placeholder to show while loading */
  placeholder?: React.ReactNode;
  /** Aspect ratio class, e.g. "aspect-square", "aspect-video" */
  aspectRatio?: string;
  /** Object fit */
  objectFit?: 'cover' | 'contain';
  /** Root margin for intersection observer (load before visible) */
  rootMargin?: string;
}

/**
 * LazyImage - A mobile-first, lazy-loaded image that only resolves signed URLs
 * and loads images when they scroll into view. Uses a global URL cache to avoid
 * duplicate network requests.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  filePath,
  alt,
  className,
  containerClassName,
  onClick,
  resolveUrl = true,
  placeholder,
  aspectRatio = 'aspect-square',
  objectFit = 'cover',
  rootMargin = '300px 0px',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    resolveUrl ? signedUrlCache.get(filePath) || null : filePath
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadingRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin,
  });

  // Resolve URL only when component enters viewport
  useEffect(() => {
    if (!inView || !resolveUrl || imageUrl || loadingRef.current || hasError) return;
    
    loadingRef.current = true;
    
    signedUrlCache.getOrFetch(filePath)
      .then((url) => {
        if (url) setImageUrl(url);
        else setHasError(true);
      })
      .catch(() => setHasError(true))
      .finally(() => { loadingRef.current = false; });
  }, [inView, filePath, resolveUrl, imageUrl, hasError]);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(aspectRatio, 'relative overflow-hidden bg-gray-100 rounded-lg', containerClassName)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Show image once URL is resolved and component is in view */}
      {inView && imageUrl && !hasError && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFit === 'cover' ? 'object-cover' : 'object-contain',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Placeholder / loading state */}
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {hasError ? (
            <>
              <ImageIcon className="w-6 h-6 text-gray-300" />
              <span className="text-xs text-gray-400">Failed to load</span>
            </>
          ) : inView && imageUrl ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            placeholder || <ImageIcon className="w-6 h-6 text-gray-300" />
          )}
        </div>
      )}
    </div>
  );
};

export default LazyImage;
