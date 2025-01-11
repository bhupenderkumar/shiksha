import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClassworkDetails } from '@/services/classworkService';
import { fileTableService } from '@/services/fileTableService';
import { fileService } from '@/services/fileService';
import ImageGallery from '@/components/ui/ImageGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ClassworkDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
  }>;
}

const ClassworkDetail = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [classworkDetails, setClassworkDetails] = useState<ClassworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getClassworkDetails = async () => {
      try {
        const data = await fetchClassworkDetails(id);
        const files = await fileTableService.getFilesByClassworkId(id);
        
        // Map files to include proper URLs
        const attachments = files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType
        }));

        setClassworkDetails({ ...data, attachments });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getClassworkDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !classworkDetails) {
    return (
      <div className="p-4 text-red-500">
        Error: {error || 'Failed to load classwork details'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {classworkDetails.title}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {classworkDetails.description}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          <strong>Due Date:</strong> {new Date(classworkDetails.dueDate).toLocaleDateString()}
        </p>

        {classworkDetails.attachments && classworkDetails.attachments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Attachments</h2>
            <ImageGallery attachments={classworkDetails.attachments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassworkDetail;
