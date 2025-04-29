import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Lightbulb } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { playSound } from '@/lib/sound-effects';

interface HintButtonProps {
  hint: string;
  disabled?: boolean;
  soundsMuted?: boolean;
  onUseHint?: () => void;
  className?: string;
}

export function HintButton({
  hint,
  disabled = false,
  soundsMuted = false,
  onUseHint,
  className = '',
}: HintButtonProps) {
  const [hintUsed, setHintUsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleUseHint = () => {
    if (disabled) return;
    
    setHintUsed(true);
    setIsOpen(true);
    
    if (!soundsMuted) {
      playSound('CLICK');
    }
    
    if (onUseHint) {
      onUseHint();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseHint}
            disabled={disabled}
            className={`${className} ${hintUsed ? 'bg-amber-50 border-amber-200' : ''}`}
          >
            {hintUsed ? (
              <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
            ) : (
              <HelpCircle className="h-4 w-4 mr-1" />
            )}
            {hintUsed ? 'Hint Used' : 'Get Hint'}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-4 max-w-xs bg-amber-50 border-amber-200">
          <p className="text-amber-800">{hint}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HintButton;
