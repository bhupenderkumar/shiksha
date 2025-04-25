import React, { useState } from 'react';
import { Copy, Share2, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ShareableLinkProps {
  link: string;
  title?: string;
  description?: string;
  expiryDate?: Date;
  onCopy?: () => void;
  onShare?: () => void;
  className?: string;
  compact?: boolean;
}

export function ShareableLink({
  link,
  title = 'Assignment Link',
  description = 'Share this link with students to access the assignment',
  expiryDate,
  onCopy,
  onShare,
  className,
  compact = false
}: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard');
      if (onCopy) onCopy();
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: link
        });
        
        if (onShare) onShare();
      } catch (err) {
        console.error('Failed to share link:', err);
      }
    } else {
      handleCopy();
    }
  };
  
  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Input
          value={link}
          readOnly
          className="flex-1 text-sm"
          onClick={e => (e.target as HTMLInputElement).select()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        {navigator.share && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Link className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="space-y-2">
          <Label htmlFor="assignment-link">Link</Label>
          <div className="flex space-x-2">
            <Input
              id="assignment-link"
              value={link}
              readOnly
              className="flex-1"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {navigator.share && (
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-shrink-0"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>
        
        {expiryDate && (
          <p className="text-xs text-muted-foreground">
            This link will expire on {expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
