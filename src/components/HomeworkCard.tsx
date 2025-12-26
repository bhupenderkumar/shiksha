import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash, Paperclip, Download, File } from 'lucide-react';
import type { HomeworkType } from '@/services/homeworkService';
import { fileService } from '@/services/fileService';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useProfileAccess } from '@/services/profileService';

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

export function HomeworkCard({ homework, onEdit, onDelete, onView, isStudent, attachments }: HomeworkCardProps) {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const descriptionLineLimit = 3;
  const { isAdminOrTeacher } = useProfileAccess();

  useEffect(() => {
    const loadViewUrls = async () => {
      if (!attachments) return;
      
      const urlPromises = attachments
        .filter(att => isImage(att.fileName))
        .map(async (att) => {
          try {
            const viewUrl = await fileService.getSignedUrl(att.filePath);
            return [att.filePath, viewUrl] as [string, string];
          } catch (error) {
            console.error('Error getting view URL:', error);
            return [att.filePath, ''] as [string, string];
          }
        });

      const urls = Object.fromEntries(await Promise.all(urlPromises));
      setImageUrls(urls);
    };

    loadViewUrls();
  }, [attachments]);

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
      const viewUrl = await fileService.getSignedUrl(filePath);
      setPreviewImage(viewUrl);
    } catch (error) {
      console.error('Error getting view URL:', error);
      toast.error('Failed to load image preview');
    }
  };

  const isImage = (fileName: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'OVERDUE':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      case 'SUBMITTED':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate text-foreground" title={homework.title}>
              {homework.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate" title={`${homework.class?.name} - ${homework.class?.section}`}>
              {homework.class?.name} - {homework.class?.section}
            </p>
            <p className="text-sm text-muted-foreground">
              Due: {format(new Date(homework.dueDate), 'PPP')}
            </p>
            <Badge className={getStatusColor(homework.status)}>{homework.status}</Badge>
          </div>
         
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div
              className={`prose max-w-none text-sm ${
                !showFullDescription && 'line-clamp-3'
              }`}
            >
              {homework.description}
            </div>
            {homework.description.split('\n').length > descriptionLineLimit && (
              <Button
                variant="link"
                size="sm"
                onClick={toggleDescription}
                className="mt-1 h-auto p-0"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {attachments && attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <Paperclip className="h-4 w-4" />
                Attachments
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative group border rounded-lg p-2 hover:bg-gray-50"
                  >
                    {isImage(attachment.fileName) ? (
                      <div
                        className="cursor-pointer"
                        onClick={() => handleImageClick(attachment.filePath)}
                      >
                        <img
                          src={imageUrls[attachment.filePath]}
                          alt={attachment.fileName}
                          className="w-full h-24 object-cover rounded"
                        />
                        <p className="text-xs mt-1 truncate">{attachment.fileName}</p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <File className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{attachment.fileName}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs p-0 h-6"
                            onClick={() =>
                              handleDownload(attachment.filePath, attachment.fileName)
                            }
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
