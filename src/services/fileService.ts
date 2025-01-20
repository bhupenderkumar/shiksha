import { supabase } from '@/lib/api-client';

// Allowed file types and max size in bytes (5MB)
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const fileService = {
  validateFile(file: File): ValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX'
      };
    }

    return { isValid: true };
  },

  sanitizeFileName(fileName: string): string {
    // Remove any path traversal characters and potentially dangerous characters
    return fileName
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\.\./g, '-')
      .trim();
  },

  async uploadFile(file: File, filePath: string) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Remove any leading slashes and clean the path
      const cleanPath = filePath.replace(/^\/+/, '').trim();
      const timestamp = new Date().getTime();
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const uniquePath = `${cleanPath}/${timestamp}_${sanitizedFileName}`;

      const { data, error } = await supabase.storage
        .from('File')
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file';
      console.error('Error uploading file:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async downloadFile(filePath: string, fileName: string) {
    if (!filePath) {
      throw new Error('File path is required');
    }

    if (!fileName) {
      throw new Error('File name is required');
    }

    try {
      // Validate that the file exists before downloading
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('File')
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: filePath.split('/').pop()
        });

      if (checkError) throw checkError;
      if (!fileExists || fileExists.length === 0) {
        throw new Error('File not found');
      }

      // Get file metadata to check size before downloading
      const { data: metadata, error: metadataError } = await supabase.storage
        .from('File')
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: filePath.split('/').pop()
        });

      if (metadataError) throw metadataError;
      
      const fileMetadata = metadata?.[0];
      if (fileMetadata && fileMetadata.metadata?.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }

      const { data, error } = await supabase.storage
        .from('File')
        .download(filePath);

      if (error) throw error;
      if (!data) throw new Error('File data not found');

      // Create secure download using Blob
      const blob = new Blob([data], { type: data.type });
      const secureUrl = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = secureUrl;
      link.download = this.sanitizeFileName(fileName); // Sanitize the filename
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(secureUrl);
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error downloading file';
      console.error('Error downloading file:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async getViewUrl(filePath: string) {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      // Validate that the file exists before creating URL
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('File')
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: filePath.split('/').pop()
        });

      if (checkError) throw checkError;
      if (!fileExists || fileExists.length === 0) {
        throw new Error('File not found');
      }

      // Create a signed URL that expires in 1 hour
      const { data, error } = await supabase.storage
        .from('File')
        .createSignedUrl(filePath, 3600, {
          download: false // Prevent automatic download
        });

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to generate URL');

      // Transform the signed URL to ensure proper content-type headers
      const url = new URL(data.signedUrl);
      
      // Add security headers through search params
      url.searchParams.set('response-content-disposition', 'inline'); // Force inline display
      url.searchParams.delete('download'); // Remove download parameter if present
      
      return url.toString();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error accessing file';
      console.error('Error getting view URL:', errorMessage);
      throw new Error(errorMessage); // Throw error instead of falling back to public URL
    }
  },

  async getSignedUrl(filePath: string): Promise<string> {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      const { data, error } = await supabase.storage
        .from('File')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to generate signed URL');

      return data.signedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating signed URL';
      console.error('Error generating signed URL:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async getPublicUrl(filePath: string): Promise<string> {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      const { data } = supabase.storage
        .from('File')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) throw new Error('Failed to generate public URL');

      return data.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating public URL';
      console.error('Error generating public URL:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};
