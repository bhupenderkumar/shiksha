import { supabase } from '@/lib/api-client';

export const fileService = {
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('File')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  async downloadFile(filePath: string, fileName: string) {
    try {
      const { data, error } = await supabase.storage
        .from('File')
        .download(filePath);

      if (error) {
        throw error;
      }

      if (data) {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  getPublicUrl(filePath: string) {
    if (!filePath) return '';
    
    // Get the base URL from your Supabase configuration
    const { data } = supabase.storage
      .from('File')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) return '';

    // Transform URL to use direct download endpoint
    const url = new URL(data.publicUrl);
    url.searchParams.set('download', ''); // This forces download headers

    return url.toString();
  },

  async getViewUrl(filePath: string) {
    if (!filePath) return '';
    try {
      // Create a signed URL that expires in 1 hour
      const { data, error } = await supabase.storage
        .from('File')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (!data?.signedUrl) return '';

      // Transform the signed URL to ensure proper content-type headers
      const url = new URL(data.signedUrl);
      url.searchParams.delete('download'); // Remove download parameter if present
      
      return url.toString();
    } catch (error) {
      console.error('Error getting view URL:', error);
      return this.getPublicUrl(filePath); // Fallback to public URL
    }
  }
};
