import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';

interface FileUploaderProps {
  assignmentId?: string;
  feeId?: string;
  onUploadComplete: () => void;
  existingFiles?: Array<{id: string, file_name: string}>;
  onFileDelete?: (fileId: string) => void;
}

export const FileUploader = ({ assignmentId, feeId, onUploadComplete, existingFiles, onFileDelete }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const id = assignmentId || feeId;
  const bucketName = assignmentId ? 'assignment-files' : 'fee-files';

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Save file reference to assignment_files table
      const { error: dbError } = await supabase
        .from(assignmentId ? 'assignment_files' : 'fee_files')
        .insert([
          {
            [assignmentId ? 'assignment_id' : 'fee_id']: id,
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

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={uploadFile}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${id}`}
        />
        <label htmlFor={`file-upload-${id}`}>
          <Button asChild variant="outline">
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          </Button>
        </label>
      </div>

      {existingFiles && existingFiles.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-2">Existing Files:</h4>
          <ul className="space-y-2">
            {existingFiles.map((file) => (
              <li key={file.id} className="flex items-center justify-between">
                <span className="text-sm truncate">{file.file_name}</span>
                {onFileDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    Delete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
