import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Download, File, ImageIcon } from 'lucide-react';
import type { HomeworkType } from '@/services/homeworkService';
import { fileService, signedUrlCache } from '@/services/fileService';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { LazyImage } from '@/components/ui/LazyImage';

export type AttachmentType = {
  id: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  uploadedAt: string;
};

type HomeworkCardProps = {
  homework: HomeworkType;
  onEdit?: (homework: HomeworkType) => void;
  onDelete?: (homework: HomeworkType) => void;
  onView?: (homework: HomeworkType) => void;
  isStudent?: boolean;
  attachments?: AttachmentType[];
};

const isImage = (fileName: string): boolean => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'OVERDUE': return 'bg-red-100 text-red-800';
    case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function HomeworkCard({ homework, attachments }: HomeworkCardProps) {
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
  const thumbnailCount = Math.min(imageAttachments.length, 4);
  const remainingCount = imageAttachments.length - thumbnailCount;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold truncate text-foreground" title={homework.title}>
            {homework.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate" title={`${homework.class?.name} - ${homework.class?.section}`}>
            {homework.class?.name} - {homework.class?.section}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              Due: {format(new Date(homework.dueDate), 'MMM dd, yyyy')}
            </p>
            <Badge className={`text-[10px] px-1.5 py-0 ${getStatusColor(homework.status)}`}>
              {homework.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0">
        <div className={showFullDescription ? '' : 'line-clamp-2'}>
          <p className="text-xs sm:text-sm text-muted-foreground">{homework.description}</p>
        </div>
        {homework.description && homework.description.length > 100 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-primary text-xs hover:underline focus:outline-none mt-1"
          >
            {showFullDescription ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Image thumbnails - lazy loaded */}
        {imageAttachments.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {imageAttachments.length} image{imageAttachments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {imageAttachments.slice(0, thumbnailCount).map((att, index) => (
                <div key={att.id} className="relative">
                  <LazyImage
                    filePath={att.filePath}
                    alt={att.fileName}
                    aspectRatio="aspect-square"
                    objectFit="cover"
                    className="cursor-pointer"
                    containerClassName="border border-gray-200 rounded-md"
                    rootMargin="200px 0px"
                    onClick={() => handleImageClick(att.filePath)}
                  />
                  {index === thumbnailCount - 1 && remainingCount > 0 && (
                    <div
                      className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center cursor-pointer"
                      onClick={() => handleImageClick(att.filePath)}
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
              {otherAttachments.slice(0, 3).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{att.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={() => handleDownload(att.filePath, att.fileName)}
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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl p-1 sm:p-2">
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
