import React from 'react';
import { Paperclip, Download } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AttachmentsListProps {
  attachments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType?: string;
    onDownload?: () => void;
  }>;
  title?: string;
  className?: string;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  title = 'Attachments',
  className
}) => {
  if (!attachments.length) return null;

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
        <Paperclip className="w-5 h-5 mr-2" />
        {title} ({attachments.length})
      </h3>
      <div className="grid gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-xl" role="img" aria-label="file icon">
                {getFileIcon(attachment.fileType)}
              </span>
              <span className="truncate text-sm font-medium text-gray-700">
                {attachment.fileName}
              </span>
            </div>
            {attachment.onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={attachment.onDownload}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download {attachment.fileName}</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
