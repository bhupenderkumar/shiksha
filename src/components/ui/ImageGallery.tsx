import React, { useState, useEffect } from 'react';
import { X, Download, File } from 'lucide-react';
import { Dialog, DialogContent } from './dialog';
import { Button } from './button';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';

interface ImageGalleryProps {
  attachments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType?: string;
  }>;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadViewUrls = async () => {
      const urlPromises = attachments
        .filter(att => isImage(att.fileName))
        .map(async (att) => {
          const viewUrl = await fileService.getViewUrl(att.filePath);
          return [att.filePath, viewUrl] as [string, string];
        });

      const urls = Object.fromEntries(await Promise.all(urlPromises));
      setImageUrls(urls);
    };

    loadViewUrls();
  }, [attachments]);

  const isImage = (fileName: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleImageClick = async (filePath: string) => {
    try {
      const viewUrl = await fileService.getViewUrl(filePath);
      setSelectedImage(viewUrl);
      toast.success('Image loaded successfully!');
    } catch (error) {
      console.error('Error getting view URL:', error);
      toast.error('Failed to load image preview. Please try again later.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="relative group rounded-lg overflow-hidden border border-gray-200"
          >
            {isImage(attachment.fileName) ? (
              <div className="aspect-square">
                <img
                  src={imageUrls[attachment.filePath]}
                  alt={attachment.fileName}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleImageClick(attachment.filePath)}
                  onError={(e) => {
                    console.error('Image load error, falling back to public URL');
                    const img = e.target as HTMLImageElement;
                    img.src = fileService.getPublicUrl(attachment.filePath);
                  }}
                />
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-gray-50">
                <File className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-xs text-gray-500 text-center px-2 truncate max-w-full">
                  {attachment.fileName}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(attachment.filePath, attachment.fileName)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white/90 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black/5">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error('Preview load error, falling back to public URL');
                  const img = e.target as HTMLImageElement;
                  if (selectedImage) {
                    img.src = fileService.getPublicUrl(selectedImage);
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;
