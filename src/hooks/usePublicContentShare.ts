import { useState, useEffect, useCallback } from 'react';
import { shareableLinkService, contentQueryService, ShareableLink, ContentQuery } from '@/services/shareableLinkService';
import { homeworkService } from '@/services/homeworkService';
import { fetchClassworkDetails } from '@/services/classworkService';
import { fileTableService } from '@/services/fileTableService';
import { fileService } from '@/services/fileService';

export type ContentType = 'homework' | 'classwork';

export interface ContentData {
  id: string;
  title: string;
  description: string;
  date: Date; // dueDate for homework, date for classwork
  status?: string;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttachmentData {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  url?: string;
}

interface UsePublicContentShareResult {
  loading: boolean;
  error: string | null;
  content: ContentData | null;
  attachments: AttachmentData[];
  imageAttachments: AttachmentData[];
  otherAttachments: AttachmentData[];
  shareableLink: ShareableLink | null;
  queries: ContentQuery[];
  addQuery: (query: ContentQuery) => void;
  refetch: () => Promise<void>;
}

export function usePublicContentShare(
  token: string | undefined,
  contentType: ContentType
): UsePublicContentShareResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [queries, setQueries] = useState<ContentQuery[]>([]);

  // Filter attachments
  const imageAttachments = attachments.filter((att) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName)
  );
  const otherAttachments = attachments.filter(
    (att) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName)
  );

  const fetchData = useCallback(async () => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch shareable link
      const link = await shareableLinkService.getByToken(token);
      if (!link) {
        setError('This link has expired or is no longer valid');
        setLoading(false);
        return;
      }

      if (link.content_type !== contentType) {
        setError('Invalid link type');
        setLoading(false);
        return;
      }

      setShareableLink(link);

      // Increment view count (fire and forget)
      shareableLinkService.incrementViewCount(token);

      // Fetch content details based on type
      let contentData: ContentData;
      let files: AttachmentData[];

      if (contentType === 'homework') {
        const homeworkData = await homeworkService.getHomeworkDetails(link.content_id);
        contentData = {
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
        files = await fileTableService.getFilesByEntityId('homework', link.content_id);
      } else {
        const classworkData = await fetchClassworkDetails(link.content_id);
        contentData = {
          id: classworkData.id,
          title: classworkData.title,
          description: classworkData.description,
          date: classworkData.date,
          class: classworkData.class,
          // Note: classwork doesn't have a subject field like homework
          subject: undefined,
          createdAt: classworkData.createdAt,
          updatedAt: classworkData.updatedAt,
        };
        files = await fileTableService.getFilesByEntityId('classwork', link.content_id);
      }

      setContent(contentData);

      // Fetch attachment URLs
      const attachmentsWithUrls = await Promise.all(
        files.map(async (file) => {
          try {
            const url = await fileService.getSignedUrl(file.filePath);
            return { ...file, url };
          } catch {
            try {
              const url = await fileService.getPublicUrl(file.filePath);
              return { ...file, url };
            } catch {
              return { ...file, url: undefined };
            }
          }
        })
      );
      setAttachments(attachmentsWithUrls);

      // Fetch queries
      const queriesData = await contentQueryService.getQueriesForLink(link.id);
      setQueries(queriesData);
    } catch (err) {
      console.error(`Error fetching shared ${contentType}:`, err);
      setError(`Failed to load ${contentType}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, [token, contentType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addQuery = useCallback((query: ContentQuery) => {
    setQueries((prev) => [query, ...prev]);
  }, []);

  return {
    loading,
    error,
    content,
    attachments,
    imageAttachments,
    otherAttachments,
    shareableLink,
    queries,
    addQuery,
    refetch: fetchData,
  };
}

export default usePublicContentShare;
