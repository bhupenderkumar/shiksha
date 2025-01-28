import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

type AttachmentProps = {
  attachment: {
    id: string;
    fileName: string;
    filePath: string;
  };
};

const imageCache: Record<string, string> = {}; // Cache for images

export const Attachment: React.FC<AttachmentProps> = ({ attachment }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleDownload = () => {
    // Check if the image URL is cached
    if (imageCache[attachment.filePath]) {
      window.open(imageCache[attachment.filePath], '_blank');
    } else {
      // Fetch the image URL and cache it
      const url = attachment.filePath;
      imageCache[attachment.filePath] = url; // Store in cache
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    // Optionally, load the image URL into state if needed
    setImageUrl(attachment.filePath);
  }, [attachment.filePath]);

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <span>{attachment?.fileName}</span>
      <button onClick={handleDownload} className="text-blue-500 hover:text-blue-700">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};
