import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

export const fileService = {
  async uploadFile(file: File, path: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('File')
      .upload(filePath, file);

    if (error) throw error;

    return {
      id: data.path,
      fileName: file.name,
      filePath: data.path
    };
  },

  async deleteFile(filePath: string) {
    const { error } = await supabase.storage
      .from('File')
      .remove([filePath]);

    if (error) throw error;
  },

  async downloadFile(filePath: string, fileName: string) {
    const { data, error } = await supabase.storage
      .from('File')
      .download(filePath);

    if (error) throw error;

    // Create a download link
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getPublicUrl(filePath: string) {
    const { data } = supabase.storage
      .from('File')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
};
