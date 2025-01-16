import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash } from 'lucide-react';
import { Attachment } from '@/components/Attachment';
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
};

export function HomeworkCard({ homework, onEdit, onDelete, onView, isStudent }: HomeworkCardProps) {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const descriptionLineLimit = 3;
  const { isAdminOrTeacher } = useProfileAccess();

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
    <Card onClick={() => onView?.(homework)} className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-2 text-indigo-900">
            {homework.title}
          </CardTitle>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Due: {format(new Date(homework.dueDate), 'MMM dd, yyyy')}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div>
            <p className={`text-gray-700 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {homework.description}
            </p>
            {homework.description.split('\n').length > descriptionLineLimit && (
              <button
                onClick={toggleDescription}
                className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 focus:outline-none"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {homework.attachments && homework.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                Attachments ({homework.attachments.length})
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {homework.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                    <Attachment
                      fileName={attachment.fileName}
                      fileType={attachment.fileType}
                      onDownload={() => handleDownload(attachment.filePath, attachment.fileName)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {homework.class && (
            <div className="text-sm text-gray-600">
              Class: {homework.class.name} {homework.class.section}
            </div>
          )}
          {homework.subject && (
            <div className="text-sm text-gray-600">
              Subject: {homework.subject.name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-end gap-2">
        <Badge className={`${getStatusColor(homework.status)} px-2 py-1 rounded-full text-xs font-medium`}>
          {homework.status}
        </Badge>
        {isAdminOrTeacher && (
          <>
            <Button onClick={() => onEdit?.(homework)} variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button onClick={() => onDelete?.(homework)} variant="ghost" size="icon" className="text-destructive">
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
