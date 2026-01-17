import { useState, useEffect, useCallback } from 'react';
import { homeworkService } from '@/services/homeworkService';
import { fetchClassworkDetails } from '@/services/classworkService';
import { fileTableService } from '@/services/fileTableService';
import { fileService } from '@/services/fileService';
import { shareableLinkService, ShareableLink } from '@/services/shareableLinkService';
import { useImagePreview } from '@/hooks/use-image-preview';
import toast from 'react-hot-toast';

export type ContentType = 'homework' | 'classwork';

export interface AttachmentData {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  url?: string;
  feeId?: string | null;
  schoolId?: string | null;
  homeworkId?: string | null;
  uploadedAt?: string;
  uploadedBy?: string;
  classworkId?: string | null;
  grievanceId?: string | null;
  homeworkSubmissionId?: string | null;
}

export interface ContentDetailsData {
  id: string;
  title: string;
  description: string;
  date: Date;
  status?: string;
  attachments?: AttachmentData[];
  class?: {
    id: string;
    name: string;
    section: string;
    roomNumber?: string;
    capacity?: number;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface UseContentDetailsOptions {
  preloadCount?: number;
}

interface UseContentDetailsResult {
  loading: boolean;
  error: string | null;
  content: ContentDetailsData | null;
  shareableLinks: ShareableLink[];
  imagePreview: ReturnType<typeof useImagePreview>;
  handleLinkCreated: (link: ShareableLink) => void;
  handleLinkDeleted: (linkId: string) => void;
  handleDownload: (filePath: string, fileName: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useContentDetails(
  id: string | undefined,
  contentType: ContentType,
  userId: string | undefined,
  options: UseContentDetailsOptions = {}
): UseContentDetailsResult {
  const { preloadCount = 3 } = options;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentDetailsData | null>(null);
  const [shareableLinks, setShareableLinks] = useState<ShareableLink[]>([]);

  const imagePreview = useImagePreview(content?.attachments || [], { preloadCount });

  const fetchContent = useCallback(async () => {
    if (!id) {
      setError('Invalid content ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: ContentDetailsData;
      let files: AttachmentData[];

      if (contentType === 'homework') {
        const homeworkData = await homeworkService.getHomeworkDetails(id);
        files = await fileTableService.getFilesByEntityId('homework', id);
        
        data = {
          id: homeworkData.id,
          title: homeworkData.title,
          description: homeworkData.description,
          date: homeworkData.dueDate,
          status: homeworkData.status,
          class: homeworkData.class,
          subject: homeworkData.subject,
          createdAt: homeworkData.createdAt,
          updatedAt: homeworkData.updatedAt,
        };
      } else {
        const classworkData = await fetchClassworkDetails(id);
        files = await fileTableService.getFilesByEntityId('classwork', id);
        
        data = {
          id: classworkData.id,
          title: classworkData.title,
          description: classworkData.description,
          date: classworkData.date,
          class: classworkData.class,
          // Classwork doesn't have subject in the type, so we don't include it
          createdAt: classworkData.createdAt,
          updatedAt: classworkData.updatedAt,
        };
      }

      // Get signed URLs for all attachments
      const attachmentsWithUrls = await Promise.all(
        files.map(async (file) => {
          try {
            const url = await fileService.getSignedUrl(file.filePath);
            return { ...file, url };
          } catch {
            return { ...file, url: undefined };
          }
        })
      );

      setContent({
        ...data,
        attachments: attachmentsWithUrls,
      });
    } catch (err: any) {
      const errorMessage = err.message || `Failed to load ${contentType} details`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, contentType]);

  const fetchShareableLinks = useCallback(async () => {
    if (!id || !userId) return;
    try {
      const links = await shareableLinkService.getLinksForContent(contentType, id);
      setShareableLinks(links);
    } catch (err) {
      console.error('Error fetching shareable links:', err);
    }
  }, [id, userId, contentType]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    fetchShareableLinks();
  }, [fetchShareableLinks]);

  useEffect(() => {
    imagePreview.preloadAdjacentImages();
  }, [imagePreview.preloadAdjacentImages]);

  const handleLinkCreated = useCallback((link: ShareableLink) => {
    setShareableLinks((prev) => [link, ...prev]);
  }, []);

  const handleLinkDeleted = useCallback((linkId: string) => {
    setShareableLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, []);

  const handleDownload = useCallback(async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
      toast.success('File download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  }, []);

  return {
    loading,
    error,
    content,
    shareableLinks,
    imagePreview,
    handleLinkCreated,
    handleLinkDeleted,
    handleDownload,
    refetch: fetchContent,
  };
}

export default useContentDetails;
