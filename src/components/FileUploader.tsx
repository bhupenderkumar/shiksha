import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  homeworkId: string;
  onUploadComplete: () => void;
  existingFiles?: any[];
  onFileDelete: (fileId: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  homeworkId,
  onUploadComplete,
  existingFiles = [],
  onFileDelete
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, id: string) => {
    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('homework-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('homework-files')
        .getPublicUrl(filePath);

      // Save file reference to homework_files table
      const { error: dbError } = await supabase
        .from('homework_files')
        .insert([
          {
            homework_id: id,
            file_path: publicUrl,
            file_type: fileExt?.toLowerCase() === 'pdf' ? 'pdf' : 'image',
            file_name: file.name,
          },
        ]);

      if (dbError) throw dbError;

      toast.success('File uploaded successfully');
      onUploadComplete();

    } catch (error) {
      toast.error('Error uploading file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!onFileDelete) return;
    try {
      setUploading(true);
      await onFileDelete(fileId);
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Error deleting file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const uploadPromises = acceptedFiles.map(file => 
        uploadFile(file, homeworkId)
      );
      await Promise.all(uploadPromises);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [homeworkId, onUploadComplete]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed p-4 text-center">
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>
      
      {existingFiles && existingFiles.length > 0 && (
        <div className="mt-4">
          <h4>Attached Files:</h4>
          <ul>
            {existingFiles.map((file: any) => (
              <li key={file.id} className="flex items-center justify-between">
                <span>{file.file_name}</span>
                <button onClick={() => handleDelete(file.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
