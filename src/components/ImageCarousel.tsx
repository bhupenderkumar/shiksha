import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

interface ImageCarouselProps {
  files: {
    id: string;
    file_path: string;
    file_type: 'image' | 'pdf';
    file_name: string;
  }[];
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ files }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const handleFileClick = async (file: typeof files[0]) => {
    const { data, error } = await supabase.storage
      .from('assignments')
      .createSignedUrl(file.file_path, 60);

    if (error) {
      console.error(error);
      return;
    }

    window.open(data.signedUrl, '_blank');
  };

  const currentFile = files[currentIndex];

  return (
    <div className="relative">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
        {currentFile.file_type === 'image' ? (
          <img
            src={`${supabase.storage.from('assignments').getPublicUrl(currentFile.file_path).data.publicUrl}`}
            alt={currentFile.file_name}
            className="object-contain w-full h-full cursor-pointer"
            onClick={() => handleFileClick(currentFile)}
          />
        ) : (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => handleFileClick(currentFile)}
          >
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500">{currentFile.file_name}</p>
            </div>
          </div>
        )}
      </div>

      {files.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};