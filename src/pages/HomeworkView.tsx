import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HomeworkType, homeworkService } from '@/services/homeworkService';
import { HomeworkForm } from '@/components/forms/homework-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function HomeworkView() {
  const { id } = useParams();
  const [homework, setHomework] = useState<HomeworkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        if (!id) {
          setError('Invalid homework ID');
          return;
        }
        
        const data = await homeworkService.getById(id);
        if (!data) {
          setError('Homework not found');
          return;
        }
        
        setHomework(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching homework:', error);
        setError('Failed to load homework');
        toast.error('Failed to load homework');
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !homework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-600">
            {error || 'Homework not found'}
          </h2>
          <p className="text-gray-500 mt-2">
            {error === 'Homework not found' 
              ? 'The homework you\'re looking for doesn\'t exist or has been removed.'
              : 'There was an error loading the homework. Please try again later.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">{homework.title}</h1>
        <HomeworkForm
          initialData={homework}
          files={homework.attachments}
          readOnly={true}
        />
      </Card>
    </div>
  );
}
