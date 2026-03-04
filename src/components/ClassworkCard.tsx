import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Download, File, ImageIcon } from 'lucide-react';
import type { ClassworkType } from '@/services/classworkService';
import { fileService } from '@/services/fileService';
import { signedUrlCache } from '@/services/fileService';
import toast from 'react-hot-toast';
import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LazyImage } from '@/components/ui/LazyImage';

export type AttachmentType = {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
};

type ClassworkCardProps = {
  classwork: ClassworkType;
  onEdit?: (classwork: ClassworkType) => void;
  onDelete?: (classwork: ClassworkType) => void;
  isStudent?: boolean;
  attachments?: AttachmentType[];
};

const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

export function ClassworkCard({ classwork, isStudent, attachments }: ClassworkCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDownload = useCallback(async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  }, []);

  const handleImageClick = useCallback(async (filePath: string) => {
    try {
      const url = await signedUrlCache.getOrFetch(filePath);
      if (url) setPreviewImage(url);
    } catch {
      toast.error('Failed to load image preview');
    }
  }, []);

  const imageAttachments = attachments?.filter(att => isImage(att.fileName)) || [];
  const otherAttachments = attachments?.filter(att => !isImage(att.fileName)) || [];
  const thumbnailCount = Math.min(imageAttachments.length, 4); // Show max 4 thumbnails
  const remainingCount = imageAttachments.length - thumbnailCount;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold truncate text-foreground" title={classwork.title}>
            {classwork.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate" title={`${classwork.class?.name} - ${classwork.class?.section}`}>
            {classwork.class?.name} - {classwork.class?.section}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(classwork.date).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0">
        <div className={showFullDescription ? '' : 'line-clamp-2'}>
          <p className="text-xs sm:text-sm text-muted-foreground">{classwork.description}</p>
        </div>
        {classwork.description && classwork.description.length > 100 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-primary text-xs hover:underline focus:outline-none mt-1"
          >
            {showFullDescription ? 'Show Less' : 'Show More'}
          </button>
        )}

        {/* Image thumbnails - lazy loaded, mobile-first grid */}
        {imageAttachments.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {imageAttachments.length} image{imageAttachments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {imageAttachments.slice(0, thumbnailCount).map((file, index) => (
                <div key={file.id} className="relative">
                  <LazyImage
                    filePath={file.filePath}
                    alt={file.fileName}
                    aspectRatio="aspect-square"
                    objectFit="cover"
                    className="cursor-pointer"
                    containerClassName="border border-gray-200 rounded-md"
                    rootMargin="200px 0px"
                    onClick={() => handleImageClick(file.filePath)}
                  />
                  {/* Show +N overlay on the last thumbnail if there are more */}
                  {index === thumbnailCount - 1 && remainingCount > 0 && (
                    <div
                      className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center cursor-pointer"
                      onClick={() => handleImageClick(file.filePath)}
                    >
                      <span className="text-white text-lg font-bold">+{remainingCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-image attachments */}
        {otherAttachments.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {otherAttachments.length} file{otherAttachments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1.5">
              {otherAttachments.slice(0, 3).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{file.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={() => handleDownload(file.filePath, file.fileName)}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {otherAttachments.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{otherAttachments.length - 3} more files
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <p className="text-xs text-gray-400">
          Created {new Date(classwork.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-1 sm:p-2">
          {previewImage && (
            <div className="relative w-full flex items-center justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
