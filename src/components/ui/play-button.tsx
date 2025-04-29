import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface PlayButtonProps {
  url: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  mobileHighlight?: boolean;
}

export function PlayButton({
  url,
  label = 'Play',
  className = '',
  variant = 'default',
  size = 'default',
  mobileHighlight = true
}: PlayButtonProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Apply special styling for mobile if mobileHighlight is true
  const mobileStyles = isMobile && mobileHighlight
    ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white play-button-mobile play-button-mobile-highlight'
    : '';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        mobileStyles,
        'transition-all duration-200',
        className
      )}
      title="Open in new window"
    >
      <Play className={cn(
        'h-4 w-4',
        isMobile && mobileHighlight ? 'animate-pulse' : '',
        label ? 'mr-2' : ''
      )} />
      {label}
    </Button>
  );
}

export default PlayButton;
