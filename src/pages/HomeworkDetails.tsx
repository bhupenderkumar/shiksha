import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { homeworkService } from '@/services/homeworkService';
import { fileService } from '@/services/fileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Attachment } from '@/components/Attachment';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Book, 
  Users, 
  Paperclip, 
  Eye,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock4,
  XCircle,
  SendHorizonal
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface HomeworkDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
  }>;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const HomeworkDetails = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [homeworkDetails, setHomeworkDetails] = useState<HomeworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const getHomeworkDetails = async () => {
      try {
        const data = await homeworkService.getHomeworkDetails(id);
        setHomeworkDetails(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load homework details');
        toast.error('Failed to load homework details');
      } finally {
        setLoading(false);
      }
    };

    getHomeworkDetails();
  }, [id]);

  useEffect(() => {
    if (homeworkDetails) {
      document.title = `Homework | ${homeworkDetails.class?.name || 'N/A'} | ${homeworkDetails.subject?.name || 'N/A'} | ${format(new Date(homeworkDetails.dueDate), 'dd MMMM yyyy')} | First Step Public School | Saurabh Vihar`;
    }
  }, [homeworkDetails]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
      toast.success('File download started');
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock4 className="w-4 h-4 text-yellow-500" />;
      case 'OVERDUE':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SUBMITTED':
        return <SendHorizonal className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !homeworkDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Error Loading Homework"
          description={error || 'Failed to load homework details. Please try again.'}
          icon={<AlertCircle className="w-full h-full" />}
          action={
            <Button onClick={() => navigate('/homework')} variant="outline">
              Go back to Homework
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/homework')}
        className="mb-6 hover:bg-blue-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Homework
      </Button>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <CardTitle className="text-2xl font-bold text-indigo-900">
              {homeworkDetails.title || 'Untitled Homework'}
            </CardTitle>
            {homeworkDetails.status && (
              <Badge 
                variant="outline" 
                className={`px-3 py-1 flex items-center gap-2 ${getStatusColor(homeworkDetails.status)}`}
              >
                {getStatusIcon(homeworkDetails.status)}
                <span className="capitalize">{homeworkDetails.status.toLowerCase()}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                <span>Due: {formatDate(homeworkDetails.dueDate)}</span>
              </div>
              
              {homeworkDetails.class && (
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  <span>Class: {homeworkDetails.class.name} {homeworkDetails.class.section}</span>
                </div>
              )}
              
              {homeworkDetails.subject && (
                <div className="flex items-center text-gray-700">
                  <Book className="w-5 h-5 mr-2 text-indigo-600" />
                  <span>Subject: {homeworkDetails.subject.name} ({homeworkDetails.subject.code})</span>
                </div>
              )}

              {homeworkDetails.createdAt && (
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  <span>Created: {formatDateTime(homeworkDetails.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {homeworkDetails.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{homeworkDetails.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {homeworkDetails.attachments && homeworkDetails.attachments.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                <Paperclip className="w-5 h-5 mr-2" />
                Attachments ({homeworkDetails.attachments.length})
              </h3>
              <div className="grid gap-3">
                {homeworkDetails.attachments.map((attachment, index) => (
                  <div
                    key={attachment.id || index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Attachment
                      fileName={attachment.fileName}
                      fileType={attachment.fileType}
                      onDownload={() => handleDownload(attachment.filePath, attachment.fileName)}
                      className="flex-1"
                    />
                    {isImage(attachment.fileName) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImageClick(attachment.filePath)}
                        className="ml-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Attachments"
              description="This homework has no attached files."
              icon={<Paperclip className="w-full h-full" />}
              className="bg-white/50"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkDetails;
