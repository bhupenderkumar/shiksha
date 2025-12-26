import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClassworkDetails } from '@/services/classworkService';
import { fileTableService } from '@/services/fileTableService';
import { fileService } from '@/services/fileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Attachment } from '@/components/Attachment';
import { ImagePreviewDialog } from '@/components/ui/ImagePreviewDialog';
import { ImageGrid } from '@/components/ui/ImageGrid';
import { AttachmentsList } from '@/components/ui/AttachmentsList';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Book, 
  Users, 
  Paperclip, 
  Eye,
  AlertCircle,
  FileText 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import PublicLayout from '@/components/PublicLayout';
import { useImagePreview } from '@/hooks/use-image-preview';
import { format } from 'date-fns';
import { ClassworkType } from '@/services/classworkService';

// Simple attachment type for display purposes
interface AttachmentDisplay {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
}

interface ImageAttachment {
  id: string;
  fileName: string;
  filePath: string;
  url: string | null;
  alt: string;
  isLoading?: boolean;
}

interface ClassworkDetails extends Omit<ClassworkType, 'date' | 'createdAt' | 'updatedAt' | 'attachments'> {
  date: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  attachments?: AttachmentDisplay[];
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

const ClassworkDetail = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classworkDetails, setClassworkDetails] = useState<ClassworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    previewImage,
    isImage,
    handleImageClick,
    preloadAdjacentImages,
    getPreviewImages,
    closePreview,
    imageAttachments,
    isLoading: imageLoading
  } = useImagePreview(classworkDetails?.attachments || [], {
    preloadCount: 5 // Preload more images initially
  });

  useEffect(() => {
    const getClassworkDetails = async () => {
      try {
        const data = await fetchClassworkDetails(id);
        const files = await fileTableService.getFilesByClassworkId(id);
        
        const attachments = files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType || file.fileName.split('.').pop() || ''
        }));

        // Convert Date objects to strings for display
        setClassworkDetails({ 
          ...data,
          date: data.date.toISOString(),
          createdAt: data.createdAt?.toISOString(),
          updatedAt: data.updatedAt?.toISOString(),
          attachments 
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load classwork details');
        toast.error('Failed to load classwork details');
      } finally {
        setLoading(false);
      }
    };

    getClassworkDetails();
  }, [id]);

  useEffect(() => {
    if (classworkDetails) {
      document.title = `Classwork | ${classworkDetails.class?.name || 'N/A'} | ${classworkDetails.subject?.name || 'N/A'} | ${classworkDetails?.date} | First Step Public School | Saurabh Vihar`;
    }
  }, [classworkDetails]);

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP'); // Will format as "Apr 29, 2023"
    } catch (error) {
      return dateString;
    }
  };

  const renderContent = () => (
    <div className="container">
      <Button
        variant="ghost"
        onClick={() => navigate(user ? '/classwork' : '/')}
        className="mb-6 hover:bg-blue-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {user ? 'Back to Classwork' : 'Back to Home'}
      </Button>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <CardTitle className="text-2xl font-bold text-indigo-900">
              {classworkDetails?.title || 'Untitled Classwork'}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6 col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Timing Details</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                  <span>Due: {classworkDetails?.date ? formatDate(classworkDetails.date) : 'N/A'}</span>
                </div>
                {classworkDetails?.createdAt && (
                  <div className="flex items-center text-gray-700 mt-2">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>Created: {formatDate(classworkDetails.createdAt)}</span>
                  </div>
                )}
              </div>

              {classworkDetails?.class && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Class Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Users className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                      <span>Class: {classworkDetails.class.name} {classworkDetails.class.section}</span>
                    </div>
                    {classworkDetails.class.roomNumber && (
                      <div className="flex items-center text-gray-700 ml-7">
                        <span>Room: {classworkDetails.class.roomNumber}</span>
                      </div>
                    )}
                    {classworkDetails.class.capacity && (
                      <div className="flex items-center text-gray-700 ml-7">
                        <span>Capacity: {classworkDetails.class.capacity} students</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {classworkDetails?.subject && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Subject Details</h3>
                  <div className="flex items-center text-gray-700">
                    <Book className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>{classworkDetails.subject.name} ({classworkDetails.subject.code})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {classworkDetails?.status && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-3">Status</h3>
                  <Badge className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {classworkDetails.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 flex-shrink-0" />
              Description
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {classworkDetails?.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{classworkDetails.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {classworkDetails?.attachments && classworkDetails.attachments.length > 0 ? (
            <div className="space-y-6">
              {/* Images Section */}
              {imageAttachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 flex-shrink-0" />
                    Images ({imageAttachments.length})
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <ImageGrid
                      images={imageAttachments.map((attachment: ImageAttachment) => ({
                        id: attachment.id,
                        url: attachment.url || '',
                        alt: attachment.fileName,
                        isLoading: attachment.isLoading,
                        loadingText: "Loading image..."
                      }))}
                      className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      onImageClick={(index: number) => {
                        const attachment = imageAttachments[index];
                        if (attachment && classworkDetails?.attachments) {
                          const attachmentIndex = classworkDetails.attachments.findIndex(
                            (a: { id: string }) => a.id === attachment.id
                          );
                          handleImageClick(attachment.filePath, attachment.id, attachmentIndex);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Other Attachments Section */}
              {classworkDetails.attachments.some(attachment => !isImage(attachment.fileName)) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 flex-shrink-0" />
                    Other Attachments
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <AttachmentsList
                      attachments={classworkDetails.attachments.filter(
                        (attachment: { fileName: string }) => !isImage(attachment.fileName)
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Attachments"
              description="This classwork has no attached files."
              icon={<Paperclip className="w-full h-full" />}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classworkDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Error Loading Classwork"
          description={error || 'Failed to load classwork details. Please try again.'}
          icon={<AlertCircle className="w-full h-full" />}
          action={
            <Button onClick={() => navigate('/classwork')} variant="outline">
              Go back to Classwork
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <PublicLayout>{renderContent()}</PublicLayout>
  );
};

export default ClassworkDetail;
