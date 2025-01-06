import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileUploader } from './FileUploader';
import { toast } from 'react-hot-toast';
import { deleteClasswork } from '../services/classworkService';

interface ClassworkCardProps {
  classwork: ClassworkType;
  onEdit?: (classwork: ClassworkType) => void;
  onDelete?: (id: string) => void;
  onFileUpload: () => void;
}

export const ClassworkCard: React.FC<ClassworkCardProps> = ({
  classwork,
  onEdit,
  onDelete,
  onFileUpload
}) => {
  const handleDelete = async () => {
    try {
      await deleteClasswork(classwork.id);
      toast.success('Classwork deleted successfully');
      if (onDelete) onDelete(classwork.id);
    } catch (error) {
      toast.error('Failed to delete classwork');
      console.error(error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('file')
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
      onFileUpload();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{classwork.title}</CardTitle>
        <div className="text-sm text-gray-500">
          Class: {classwork.class.name} {classwork.class.section}
        </div>
        <div className="text-sm text-gray-500">
          Date: {new Date(classwork.date).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{classwork.description}</p>
        
        <FileUploader
          homeworkId={classwork.id}
          onUploadComplete={onFileUpload}
          existingFiles={classwork.attachments}
          onFileDelete={handleFileDelete}
        />

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => onEdit && onEdit(classwork)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
