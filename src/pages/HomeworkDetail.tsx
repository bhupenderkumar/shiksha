import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHomeworkDetails } from '@/services/homeworkService';
import { fileTableService } from '@/services/fileTableService';
import { fileService } from '@/services/fileService';
import ImageGallery from '@/components/ui/ImageGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface HomeworkDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType?: string;
  }>;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

const HomeworkDetail = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [homeworkDetails, setHomeworkDetails] = useState<HomeworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHomeworkDetails = async () => {
      try {
        const data = await fetchHomeworkDetails(id);
        const files = await fileTableService.getFilesByHomeworkId(id);
        
        // Map files to include proper URLs
        const attachments = files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType
        }));

        setHomeworkDetails({ ...data, attachments });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getHomeworkDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !homeworkDetails) {
    return (
      <div className="p-4 text-red-500">
        Error: {error || 'Failed to load homework details'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/homework')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homework
      </Button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {homeworkDetails.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <p>
            <strong>Class:</strong> {homeworkDetails.class?.name} - {homeworkDetails.class?.section}
          </p>
          <p>
            <strong>Subject:</strong> {homeworkDetails.subject?.name}
          </p>
        </div>
        
        <p className="text-gray-600 mb-4">
          {homeworkDetails.description}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          <strong>Due Date:</strong> {new Date(homeworkDetails.dueDate).toLocaleDateString()}
        </p>

        {homeworkDetails.attachments && homeworkDetails.attachments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Attachments</h2>
            <ImageGallery attachments={homeworkDetails.attachments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkDetail;
