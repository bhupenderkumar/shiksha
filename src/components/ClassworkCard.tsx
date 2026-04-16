import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Download, File, ImageIcon, Mic, PenLine, Brain, CheckCircle2, Clock, CircleDashed, SkipForward, BookOpen } from 'lucide-react';
import type { ClassworkType } from '@/services/classworkService';
import { fileService } from '@/services/fileService';
import { signedUrlCache } from '@/services/fileService';
import { cn } from '@/lib/utils';
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

const getWorkTypeConfig = (workType?: string | null) => {
  if (workType === 'oral') return { icon: Mic, label: 'Oral', color: 'bg-purple-100 text-purple-700 border-purple-200' };
  if (workType === 'writing') return { icon: PenLine, label: 'Writing', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  return null;
};

const getStatusConfig = (status?: string | null) => {
  switch (status) {
    case 'done': return { icon: CheckCircle2, label: 'Done', color: 'bg-green-100 text-green-700' };
    case 'in_progress': return { icon: Clock, label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' };
    case 'planned': return { icon: CircleDashed, label: 'Planned', color: 'bg-gray-100 text-gray-600' };
    case 'skipped': return { icon: SkipForward, label: 'Skipped', color: 'bg-red-100 text-red-700' };
    default: return null;
  }
};

const getPhotoScore = (photoValidation?: Record<string, unknown> | null) => {
  if (!photoValidation || typeof photoValidation.matchScore !== 'number') return null;
  const score = photoValidation.matchScore as number;
  if (score >= 80) return { score, color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 50) return { score, color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { score, color: 'text-red-600', bg: 'bg-red-50' };
};

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
  const thumbnailCount = Math.min(imageAttachments.length, 4);
  const remainingCount = imageAttachments.length - thumbnailCount;

  const workTypeConfig = getWorkTypeConfig(classwork.workType);
  const statusConfig = getStatusConfig(classwork.completionStatus);
  const photoScore = getPhotoScore(classwork.photoValidation);
  const isAIPlanned = !!classwork.sourcePlanItemId;

  // Color accent on left border based on work type
  const borderColor = classwork.workType === 'oral' 
    ? 'border-l-purple-400' 
    : classwork.workType === 'writing' 
      ? 'border-l-blue-400' 
      : 'border-l-transparent';

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4",
      borderColor,
      isAIPlanned && "ring-1 ring-amber-200/50"
    )}>
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="space-y-1.5">
          {/* Top row: badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {workTypeConfig && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-1 font-medium", workTypeConfig.color)}>
                <workTypeConfig.icon className="w-3 h-3" />
                {workTypeConfig.label}
              </Badge>
            )}
            {isAIPlanned && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 font-medium bg-amber-50 text-amber-700 border-amber-200">
                <Brain className="w-3 h-3" />
                AI Plan
              </Badge>
            )}
            {statusConfig && (
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 gap-1 font-medium", statusConfig.color)}>
                <statusConfig.icon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            )}
            {photoScore && (
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 font-bold", photoScore.bg, photoScore.color)}>
                {photoScore.score}%
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold truncate text-foreground leading-tight" title={classwork.title}>
            {classwork.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{classwork.class?.name} - {classwork.class?.section}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{new Date(classwork.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>

          {/* Subject & Chapter */}
          {(classwork.subject?.name || classwork.chapterName) && (
            <div className="flex items-center gap-1.5 text-xs">
              <BookOpen className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-foreground/80 truncate">
                {classwork.subject?.name}{classwork.chapterName ? ` · ${classwork.chapterName}` : ''}
              </span>
            </div>
          )}
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

        {/* Image thumbnails */}
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
