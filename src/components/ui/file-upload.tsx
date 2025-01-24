import React, { useRef } from 'react';
import { Button } from './button';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  onUpload,
  loading = false,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSize && file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    await onUpload(file);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
        accept={accept}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        Upload
      </Button>
    </div>
  );
}
