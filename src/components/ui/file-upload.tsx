import React, { useState, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  loading?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({ 
  onUpload, 
  accept = '.pdf,.jpg,.jpeg,.png', 
  loading = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className 
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Check file type
    const fileType = selectedFile.type;
    const allowedTypes = accept.split(',').map(type => type.trim());
    if (!allowedTypes.some(type => fileType.includes(type.replace('.', '')))) {
      toast.error(`File type must be one of: ${accept}`);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await onUpload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors",
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={loading}
      />
      
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {file ? (
          <>
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="mt-2"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drop your file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: {accept}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSize / (1024 * 1024)}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}