import { supabase } from '@/lib/supabase';

export interface FileType {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}

export const uploadFile = async (
  file: File, 
  folderPath: string, 
  metadata: {
    homeworkId?: string;
    classworkId?: string;
    feeId?: string;
    grievanceId?: string;
    studentId?: string;
  }
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .insert([{
        fileName: file.name,
        fileType: file.type,
        filePath,
        uploadedAt: new Date(),
        ...metadata
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    const { data: file } = await supabase
      .schema('school')
      .from('File')
      .select('filePath')
      .eq('id', fileId)
      .single();

    if (file?.filePath) {
      await supabase.storage
        .from('files')
        .remove([file.filePath]);
    }

    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
