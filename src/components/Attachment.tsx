import React from 'react';
import { Download } from 'lucide-react';

type AttachmentProps = {
  attachment: {
    id: string;
    fileName: string;
    filePath: string;
  };
};

export const Attachment: React.FC<AttachmentProps> = ({ attachment }) => {
  const handleDownload = () => {
    window.open(attachment.filePath, '_blank');
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <span>{attachment.fileName}</span>
      <button onClick={handleDownload} className="text-blue-500 hover:text-blue-700">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};
