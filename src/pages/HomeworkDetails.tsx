import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { homeworkService } from '@/services/homeworkService';
import { fileService } from '@/services/fileService';
import { fileTableService } from '@/services/fileTableService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Attachment } from '@/components/Attachment';
import { ImagePreviewDialog } from '@/components/ui/ImagePreviewDialog';
import { ImageGrid } from '@/components/ui/ImageGrid';
import { AttachmentsList } from '@/components/ui/AttachmentsList';
import { useImagePreview } from '@/hooks/use-image-preview';
import { useAuth } from '@/lib/auth-provider';
import Layout from '@/components/Layout';
import PublicLayout from '@/components/PublicLayout';
import { format } from 'date-fns';
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
import toast from 'react-hot-toast';

interface HomeworkDetails {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
    url?: string;
    feeId: string | null;
    schoolId: string | null;
    homeworkId: string | null;
    uploadedAt: string;
    uploadedBy: string;
    classworkId: string | null;
    grievanceId: string | null;
    homeworkSubmissionId: string | null;
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
  createdAt?: Date;
  updatedAt?: Date;
}

const HomeworkDetails = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeworkDetails, setHomeworkDetails] = useState<HomeworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    previewImage,
    isImage,
    handleImageClick,
    preloadAdjacentImages,
    getPreviewImages,
    closePreview
  } = useImagePreview(homeworkDetails?.attachments || []);

  useEffect(() => {
    const getHomeworkDetails = async () => {
      try {
        const data = await homeworkService.getHomeworkDetails(id);
        const files = await fileTableService.getFilesByHomeworkId(id);

        // Get signed URLs for all attachments
        const attachmentsWithUrls = await Promise.all(files.map(async (file) => {
          const url = await fileService.getSignedUrl(file.filePath);
          return {
            ...file,
            url
          };
        }));

        setHomeworkDetails({
          ...data,
          attachments: attachmentsWithUrls
        });
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
      document.title = `Homework | ${homeworkDetails.class?.name || 'N/A'} | ${homeworkDetails.subject?.name || 'N/A'} | ${format(homeworkDetails.dueDate, 'MMM dd, yyyy')} | First Step Public School | Saurabh Vihar`;
    }
  }, [homeworkDetails]);

  useEffect(() => {
    preloadAdjacentImages();
  }, [preloadAdjacentImages]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
      toast.success('File download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
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
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
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

  const renderContent = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(user ? '/homework' : '/')}
        className="mb-6 hover:bg-blue-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {user ? 'Back to Homework' : 'Back to Home'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6 col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Timing Details</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                  <span>Due: {format(homeworkDetails.dueDate, 'MMM dd, yyyy, h:mm a')}</span>
                </div>
                {homeworkDetails.createdAt && (
                  <div className="flex items-center text-gray-700 mt-2">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>Created: {format(homeworkDetails.createdAt, 'MMM dd, yyyy, h:mm a')}</span>
                  </div>
                )}
              </div>

              {homeworkDetails.class && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Class Details</h3>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>Class: {homeworkDetails.class.name} {homeworkDetails.class.section}</span>
                  </div>
                </div>
              )}

              {homeworkDetails.subject && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Subject Details</h3>
                  <div className="flex items-center text-gray-700">
                    <Book className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>{homeworkDetails.subject.name} ({homeworkDetails.subject.code})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {homeworkDetails.status && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Status</h3>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 flex items-center gap-2 ${getStatusColor(homeworkDetails.status)}`}
                  >
                    {getStatusIcon(homeworkDetails.status)}
                    <span className="capitalize">{homeworkDetails.status.toLowerCase()}</span>
                  </Badge>
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
            <div className="space-y-6">
              {/* Images Section */}
              {homeworkDetails.attachments.some(attachment => isImage(attachment.fileName)) && (
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 flex-shrink-0" />
                    Images ({homeworkDetails.attachments.filter(attachment => isImage(attachment.fileName)).length})
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <ImageGrid
                      images={homeworkDetails.attachments
                        ?.filter(attachment => isImage(attachment.fileName))
                        .map((attachment) => ({
                          id: attachment.id,
                          url: attachment.url || '',
                          alt: attachment.fileName,
                          loadingText: "Loading image..."
                        })) || []}
                      className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      onImageClick={(index: number) => {
                        const imageAttachments = homeworkDetails.attachments
                          ?.filter(a => isImage(a.fileName)) || [];
                        const attachment = imageAttachments[index];
                        if (attachment) {
                          const url = attachment.url;
                          handleImageClick(url, attachment.id, index);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Other Attachments Section */}
              {homeworkDetails.attachments.some(attachment => !isImage(attachment.fileName)) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 flex-shrink-0" />
                    Other Attachments
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <AttachmentsList
                      attachments={homeworkDetails.attachments
                        ?.filter(attachment => !isImage(attachment.fileName))
                        .map(attachment => ({
                          ...attachment,
                          onDownload: () => handleDownload(attachment.filePath, attachment.fileName)
                        })) || []}
                    />
                  </div>
                </div>
              )}
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

      <ImagePreviewDialog
        open={!!previewImage}
        images={getPreviewImages()}
        onClose={closePreview}
      />
    </div>
  );

  return <PublicLayout>{renderContent()}</PublicLayout>;
};

export default HomeworkDetails;
