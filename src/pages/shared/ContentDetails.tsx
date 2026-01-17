import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ImagePreviewDialog } from '@/components/ui/ImagePreviewDialog';
import { ImageGrid } from '@/components/ui/ImageGrid';
import { AttachmentsList } from '@/components/ui/AttachmentsList';
import { ShareLinkGenerator } from '@/components/ShareLinkGenerator';
import { TeacherQueryManager } from '@/components/TeacherQueryManager';
import { useAuth } from '@/lib/auth-provider';
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
  SendHorizonal,
} from 'lucide-react';
import { useContentDetails, ContentType } from '@/hooks/useContentDetails';
import { useEffect } from 'react';

// Config for different content types
const contentConfig = {
  homework: {
    label: 'Homework',
    dateLabel: 'Due',
    backLabel: 'Back to Homework',
    backPath: '/homework',
    errorTitle: 'Error Loading Homework',
    noAttachmentsTitle: 'No Attachments',
    noAttachmentsDescription: 'This homework has no attached files.',
  },
  classwork: {
    label: 'Classwork',
    dateLabel: 'Date',
    backLabel: 'Back to Classwork',
    backPath: '/classwork',
    errorTitle: 'Error Loading Classwork',
    noAttachmentsTitle: 'No Attachments',
    noAttachmentsDescription: 'This classwork has no attached files.',
  },
};

interface ContentDetailsPageProps {
  contentType: ContentType;
}

export const ContentDetailsPage = ({ contentType }: ContentDetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = contentConfig[contentType];

  const {
    loading,
    error,
    content,
    shareableLinks,
    imagePreview,
    handleLinkCreated,
    handleLinkDeleted,
    handleDownload,
  } = useContentDetails(id, contentType, user?.id);

  const {
    previewImage,
    isImage,
    handleImageClick,
    getPreviewImages,
    closePreview,
  } = imagePreview;

  // Set document title
  useEffect(() => {
    if (content) {
      const dateStr = format(content.date, 'MMM dd, yyyy');
      document.title = `${config.label} | ${content.class?.name || 'N/A'} | ${content.subject?.name || 'N/A'} | ${dateStr} | First Step Public School`;
    }
  }, [content, config.label]);

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

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title={config.errorTitle}
          description={error || `Failed to load ${contentType} details. Please try again.`}
          icon={<AlertCircle className="w-full h-full" />}
          action={
            <Button onClick={() => navigate(config.backPath)} variant="outline">
              Go back to {config.label}
            </Button>
          }
        />
      </div>
    );
  }

  const imageAttachments = content.attachments?.filter((att) => isImage(att.fileName)) || [];
  const otherAttachments = content.attachments?.filter((att) => !isImage(att.fileName)) || [];

  const renderContent = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(user ? config.backPath : '/')}
        className="mb-6 hover:bg-blue-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {user ? config.backLabel : 'Back to Home'}
      </Button>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <CardTitle className="text-2xl font-bold text-indigo-900">
              {content.title || `Untitled ${config.label}`}
            </CardTitle>
            {content.status && (
              <Badge
                variant="outline"
                className={`px-3 py-1 flex items-center gap-2 ${getStatusColor(content.status)}`}
              >
                {getStatusIcon(content.status)}
                <span className="capitalize">{content.status.toLowerCase()}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6 col-span-2">
              {/* Timing Details */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Timing Details</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                  <span>{config.dateLabel}: {format(content.date, 'MMM dd, yyyy, h:mm a')}</span>
                </div>
                {content.createdAt && (
                  <div className="flex items-center text-gray-700 mt-2">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>Created: {format(content.createdAt, 'MMM dd, yyyy, h:mm a')}</span>
                  </div>
                )}
              </div>

              {/* Class Details */}
              {content.class && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Class Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Users className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                      <span>Class: {content.class.name} {content.class.section}</span>
                    </div>
                    {content.class.roomNumber && (
                      <div className="flex items-center text-gray-700 ml-7">
                        <span>Room: {content.class.roomNumber}</span>
                      </div>
                    )}
                    {content.class.capacity && (
                      <div className="flex items-center text-gray-700 ml-7">
                        <span>Capacity: {content.class.capacity} students</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subject Details */}
              {content.subject && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Subject Details</h3>
                  <div className="flex items-center text-gray-700">
                    <Book className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                    <span>{content.subject.name} ({content.subject.code})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Status */}
              {content.status && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Status</h3>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 flex items-center gap-2 ${getStatusColor(content.status)}`}
                  >
                    {getStatusIcon(content.status)}
                    <span className="capitalize">{content.status.toLowerCase()}</span>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {content.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{content.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          {content.attachments && content.attachments.length > 0 ? (
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
                      images={imageAttachments.map((attachment) => ({
                        id: attachment.id,
                        url: attachment.url || '',
                        alt: attachment.fileName,
                        loadingText: 'Loading image...',
                      }))}
                      className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      onImageClick={(index: number) => {
                        const attachment = imageAttachments[index];
                        if (attachment) {
                          handleImageClick(attachment.url || '', attachment.id, index);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Other Attachments Section */}
              {otherAttachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 flex-shrink-0" />
                    Other Attachments
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <AttachmentsList
                      attachments={otherAttachments.map((attachment) => ({
                        ...attachment,
                        onDownload: () => handleDownload(attachment.filePath, attachment.fileName),
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={config.noAttachmentsTitle}
              description={config.noAttachmentsDescription}
              icon={<Paperclip className="w-full h-full" />}
              className="bg-white/50"
            />
          )}

          {/* Share with Parents Section - Only visible to authenticated teachers/admins */}
          {user && id && (
            <div className="mt-6">
              <ShareLinkGenerator
                contentType={contentType}
                contentId={id}
                title={content.title}
                date={format(content.date, 'MMM dd, yyyy')}
                className={content.class ? `${content.class.name} ${content.class.section}` : undefined}
                subjectName={content.subject?.name}
                existingLinks={shareableLinks}
                onLinkCreated={handleLinkCreated}
                onLinkDeleted={handleLinkDeleted}
              />
            </div>
          )}

          {/* Parent Questions Section - Only visible to authenticated teachers/admins */}
          {user && shareableLinks.length > 0 && (
            <div className="mt-6">
              {shareableLinks.map((link) => (
                <TeacherQueryManager
                  key={link.id}
                  shareableLinkId={link.id}
                  contentTitle={content.title}
                  className="mb-4"
                />
              ))}
            </div>
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

export default ContentDetailsPage;
