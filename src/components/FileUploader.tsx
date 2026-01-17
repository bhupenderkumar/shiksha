import { useState, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

type FileUploaderProps = {
  onFilesSelected?: (files: File[]) => void;
  onFileDelete?: (fileId: string) => void;
  existingFiles?: Array<{ id: string; fileName: string; filePath: string }>;
  acceptedFileTypes?: string[];
};

export function FileUploader({
  onFilesSelected,
  onFileDelete,
  existingFiles = [],
  acceptedFileTypes = ['image/*'],
}: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    if (onFilesSelected) {
      onFilesSelected(fileArray);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      if (onFileDelete) {
        onFileDelete(fileId);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isImage = (fileName: string): boolean => {
    if (!fileName) return false;
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const handlePreview = (filePath: string) => {
    // Use the complete URL provided in filePath
    setPreviewImage(filePath);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <div 
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          role="button"
          tabIndex={0}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2" />
            <p className="mb-2 text-sm">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Accepted file types: {acceptedFileTypes.join(', ')}
            </p>
          </div>
          
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(',')}
            multiple
          />
        </div>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files:</h3>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id} // Use file.id as the unique key
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {isImage(file.fileName) ? (
                    <img
                      src={file.filePath}
                      alt={file.fileName}
                      className="w-8 h-8 object-cover cursor-pointer"
                      onClick={() => handlePreview(file.filePath)}
                    />
                  ) : (
                    <File className="w-8 h-8" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">
                    {file.fileName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={file.filePath} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Selected Files:</h3>
          {selectedFiles.map((file, index) => (
            <div
              key={file.name} // Use file.name or a unique identifier as key
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <File className="w-8 h-8" />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveSelected(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>Image Preview</DialogTitle>
          </VisuallyHidden.Root>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
