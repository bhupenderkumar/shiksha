import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye, Paperclip } from 'lucide-react';
import { Attachment } from '@/components/Attachment';
import type { HomeworkType } from '@/services/homeworkService';
import { fileService } from '@/services/fileService';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

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
};

export function HomeworkCard({ homework, onEdit, onDelete, onView, isStudent }: HomeworkCardProps) {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const descriptionLineLimit = 3;

  useEffect(() => {
    const loadViewUrls = async () => {
      if (!homework.attachments) return;
      
      const urlPromises = homework.attachments
        .filter(att => isImage(att.fileName))
        .map(async (att) => {
          const viewUrl = await fileService.getViewUrl(att.filePath);
          return [att.filePath, viewUrl] as [string, string];
        });

      const urls = Object.fromEntries(await Promise.all(urlPromises));
      setImageUrls(urls);
    };

    loadViewUrls();
  }, [homework.attachments]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const isImage = (fileName: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const handleImageClick = async (filePath: string) => {
    try {
      const viewUrl = await fileService.getViewUrl(filePath);
      setPreviewImage(viewUrl);
    } catch (error) {
      console.error('Error getting view URL:', error);
      toast.error('Failed to load image preview');
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-2">
            {homework.title}
          </CardTitle>
          <Badge className={getStatusColor(homework.status)}>
            {homework.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <p className="text-gray-600 line-clamp-2">{homework.description}</p>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>Due Date:</span>
              <span className="font-medium">
                {format(new Date(homework.dueDate), 'PPP')}
              </span>
            </div>
            {homework.class && (
              <div className="flex items-center justify-between">
                <span>Class:</span>
                <span className="font-medium">
                  {homework.class.name} - {homework.class.section}
                </span>
              </div>
            )}
          </div>
          
          {homework.attachments && homework.attachments.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Paperclip className="w-4 h-4" />
                <span>Attachments ({homework.attachments.length})</span>
              </div>
              <div className="space-y-2">
                {homework.attachments.map((file) => (
                  <Attachment
                    key={file.id}
                    file={file}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView?.(homework)}
          className="text-blue-600 hover:text-blue-700"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        {!isStudent && (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(homework)}
                className="text-amber-600 hover:text-amber-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(homework)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </>
        )}
      </CardFooter>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {previewImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black/5">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error('Preview load error, falling back to public URL');
                  const img = e.target as HTMLImageElement;
                  if (previewImage) {
                    img.src = fileService.getPublicUrl(previewImage);
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
