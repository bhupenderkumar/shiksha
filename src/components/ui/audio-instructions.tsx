import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioInstructionsProps {
  audioUrl: string;
  label?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  childFriendly?: boolean;
}

export function AudioInstructions({
  audioUrl,
  label = 'Listen to instructions',
  autoPlay = false,
  showControls = true,
  onComplete,
  className,
  size = 'md',
  variant = 'default',
  childFriendly = true
}: AudioInstructionsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setHasPlayed(true);
      if (onComplete) onComplete();
    });
    
    if (autoPlay) {
      audio.play().catch(error => {
        console.error('Auto-play failed:', error);
      });
      setIsPlaying(true);
    }
    
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [audioUrl, autoPlay, onComplete]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Play failed:', error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };
  
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-3 px-4'
  };
  
  // Child-friendly styles
  const childFriendlyClasses = childFriendly 
    ? 'rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-white' 
    : '';
  
  if (!showControls) {
    return (
      <Button
        onClick={togglePlay}
        className={cn(
          sizeClasses[size],
          childFriendly && childFriendlyClasses,
          className
        )}
        variant={variant}
      >
        {isPlaying ? (
          <Pause className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {label}
      </Button>
    );
  }
  
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Button
          onClick={togglePlay}
          variant={variant}
          size="sm"
          className={cn(
            childFriendly && 'rounded-full w-10 h-10 p-0 flex items-center justify-center',
            hasPlayed && 'bg-green-500'
          )}
        >
          {isPlaying ? (
            <Pause className={cn('h-4 w-4', childFriendly && 'h-5 w-5')} />
          ) : (
            <Play className={cn('h-4 w-4', childFriendly && 'h-5 w-5')} />
          )}
        </Button>
        
        <span className="text-sm font-medium">
          {label}
        </span>
        
        <div className="ml-auto flex items-center space-x-2">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <div className="w-20">
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-xs">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="flex-1"
        />
        <span className="text-xs">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
