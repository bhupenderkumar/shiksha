import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface FileUploaderProps {
  assignmentId: string;
  onUploadComplete: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ assignmentId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${assignmentId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to assignments bucket
    const { error: uploadError } = await supabase.storage
      .from('assignments') // Make sure this matches the bucket name
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Error uploading file');
      console.error(uploadError);
      return;
    }

    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

    const { error: dbError } = await supabase.from('assignment_files').insert([
      {
        assignment_id: assignmentId,
        file_path: filePath,
        file_type: fileType,
        file_name: file.name,
      },
    ]);

    if (dbError) throw dbError;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        await uploadFile(file);
      }

      toast.success('Files uploaded successfully');
      onUploadComplete();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
      {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
    </div>
  );
};