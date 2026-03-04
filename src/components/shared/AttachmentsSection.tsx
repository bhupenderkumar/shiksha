import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ImageIcon, 
  Paperclip, 
  Download, 
  FileText, 
  File,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MobileImageViewer } from '@/components/ui/MobileImageViewer';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';

export interface AttachmentItem {
  id: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  url?: string;
}

interface AttachmentsSectionProps {
  attachments: AttachmentItem[];
  title?: string;
  theme?: 'light' | 'dark';
  className?: string;
  showCard?: boolean;
  onDownload?: (attachment: AttachmentItem) => Promise<void>;
}

// Helper to check if a file is an image
const isImageFile = (fileName: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
};

// Helper to get file extension
const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
};

/**
 * AttachmentsSection - A reusable component for displaying attachments
 * Separates images (with gallery view) from other files (with download)
 */
export function AttachmentsSection({
  attachments,
  title = 'Attachments',
  theme = 'light',
  className,
  showCard = true,
  onDownload,
}: AttachmentsSectionProps) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Separate images from other files
  const imageAttachments = attachments.filter((att) => isImageFile(att.fileName));
  const otherAttachments = attachments.filter((att) => !isImageFile(att.fileName));

  // Handle download
  const handleDownload = async (attachment: AttachmentItem) => {
    if (onDownload) {
      await onDownload(attachment);
      return;
    }

    try {
      await fileService.downloadFile(attachment.filePath, attachment.fileName);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle image click
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  if (attachments.length === 0) {
    return null;
  }

  const content = (
    <div className="space-y-6">
      {/* Image Gallery */}
      {imageAttachments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-pink-100"
            )}>
              <ImageIcon className={cn("w-4 h-4", "text-pink-600")} />
            </div>
            <span className={cn(
              "font-medium text-sm",
              "text-gray-900"
            )}>
              Images
            </span>
            <Badge variant="secondary" className="ml-auto">
              {imageAttachments.length}
            </Badge>
          </div>
          
          <p className={cn(
            "text-xs",
            "text-gray-400"
          )}>
            Tap to view full screen • Pinch to zoom
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imageAttachments.map((attachment, index) => (
              <button
                key={attachment.id}
                onClick={() => handleImageClick(index)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden group transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  "bg-gray-100 hover:ring-2 hover:ring-indigo-300"
                )}
              >
                {attachment.url ? (
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className={cn("w-8 h-8", "text-gray-300")} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <span className="text-white text-xs truncate block">{attachment.fileName}</span>
                </div>
                {/* View icon overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 rounded-full bg-black/50">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other Files */}
      {otherAttachments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-cyan-100"
            )}>
              <Paperclip className={cn("w-4 h-4", "text-cyan-600")} />
            </div>
            <span className={cn(
              "font-medium text-sm",
              "text-gray-900"
            )}>
              Files
            </span>
            <Badge variant="secondary" className="ml-auto">
              {otherAttachments.length}
            </Badge>
          </div>

          <div className="space-y-2">
            {otherAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    "bg-indigo-100"
                  )}>
                    <FileText className={cn("w-5 h-5", "text-indigo-600")} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      "text-gray-900"
                    )}>
                      {attachment.fileName}
                    </p>
                    <p className={cn(
                      "text-xs uppercase",
                      "text-gray-400"
                    )}>
                      {attachment.fileType || getFileExtension(attachment.fileName)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={"outline"}
                  onClick={() => handleDownload(attachment)}
                  className="flex-shrink-0 gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Image Viewer */}
      {imageViewerOpen && (
        <MobileImageViewer
          images={imageAttachments.map((att) => ({
            url: att.url || '',
            alt: att.fileName,
            fileName: att.fileName,
          }))}
          initialIndex={selectedImageIndex}
          onClose={() => setImageViewerOpen(false)}
          onDownload={(index) => handleDownload(imageAttachments[index])}
        />
      )}
    </div>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={cn(
      "border-0 shadow-xl",
      "bg-white",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg flex items-center gap-2",
          "text-gray-900"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-indigo-100"
          )}>
            <Paperclip className={cn("w-4 h-4", "text-indigo-600")} />
          </div>
          <span>{title}</span>
          <Badge variant="secondary" className="ml-auto">{attachments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

export default AttachmentsSection;
