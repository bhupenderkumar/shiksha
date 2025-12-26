import { useState, useMemo, useCallback, useEffect } from 'react';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
}

interface ImageAttachment {
  id: string;
  fileName: string;
  filePath: string;
  url: string | null;
  alt: string;
  isLoading?: boolean;
}

interface ImagePreviewOptions {
  preloadCount?: number;
}

export const useImagePreview = (
  attachments: Attachment[] = [],
  options: ImagePreviewOptions = { preloadCount: 2 }
) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [loadedUrls, setLoadedUrls] = useState<{ [key: string]: string }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [failedAttempts, setFailedAttempts] = useState<{ [key: string]: number }>({});
  const MAX_RETRY_ATTEMPTS = 2;

  const isImage = useCallback((fileName: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  }, []);

  const imageAttachments = useMemo(() => {
    return attachments
      .filter(attachment => isImage(attachment.fileName))
      .map(attachment => ({
        id: attachment.id,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        url: loadedUrls[attachment.id] || null,
        alt: attachment.fileName,
        isLoading: loadingStates[attachment.id] || false
      }));
  }, [attachments, loadedUrls, loadingStates, isImage]);

  const updateImageUrl = useCallback((id: string, url: string) => {
    setLoadedUrls(prev => ({
      ...prev,
      [id]: url
    }));
    setLoadingStates(prev => ({
      ...prev,
      [id]: false
    }));
  }, []);

  const loadImageUrl = useCallback(async (attachment: Attachment) => {
    if (loadedUrls[attachment.id]) return loadedUrls[attachment.id];
    if (failedAttempts[attachment.id] >= MAX_RETRY_ATTEMPTS) return null;
    
    try {
      setLoadingStates(prev => ({
        ...prev,
        [attachment.id]: true
      }));
      
      const viewUrl = await fileService.getViewUrl(attachment.filePath);
      updateImageUrl(attachment.id, viewUrl);
      return viewUrl;
    } catch (error) {
      console.error('Error getting view URL, trying public URL:', error);
      
      // Try to get public URL as fallback
      try {
        const publicUrl = await fileService.getPublicUrl(attachment.filePath);
        updateImageUrl(attachment.id, publicUrl);
        return publicUrl;
      } catch (publicError) {
        console.error('Error getting public URL:', publicError);
        
        // Increment failed attempts
        setFailedAttempts(prev => ({
          ...prev,
          [attachment.id]: (prev[attachment.id] || 0) + 1
        }));

        // Only show toast on first attempt
        if (!failedAttempts[attachment.id]) {
          toast.error('Some images failed to load', { id: 'image-load-error' });
        }

        setLoadingStates(prev => ({
          ...prev,
          [attachment.id]: false
        }));
        return null;
      }
    }
  }, [loadedUrls, updateImageUrl, failedAttempts]);

  const handleImageClick = useCallback(async (filePath: string, id: string, index: number) => {
    setSelectedImageIndex(index);
    const attachment = attachments.find(a => a.id === id);
    if (!attachment) return;

    if (loadedUrls[id]) {
      setPreviewImage(loadedUrls[id]);
    } else {
      const url = await loadImageUrl(attachment);
      if (url) setPreviewImage(url);
    }
  }, [attachments, loadedUrls, loadImageUrl, failedAttempts]);

  useEffect(() => {
    if (imageAttachments.length > 0) {
      const loadImages = async () => {
        // Load initial batch based on preloadCount option
        const initialBatchSize = Math.min(options.preloadCount || 2, imageAttachments.length);
        const loadBatch = async (start: number, end: number) => {
          for (let i = start; i < end; i++) {
            const img = imageAttachments[i];
            const attachment = attachments.find(a => a.id === img.id);
            
            if (attachment && !loadedUrls[attachment.id] && !loadingStates[attachment.id] &&
                (failedAttempts[attachment.id] || 0) < MAX_RETRY_ATTEMPTS) {
              if (i > start) {
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              
              // Attempt to load with exponential backoff between retries
              const currentAttempt = failedAttempts[attachment.id] || 0;
              loadImageUrl(attachment).catch(() => {
                if (currentAttempt < MAX_RETRY_ATTEMPTS - 1) {
                  const backoffDelay = Math.pow(2, currentAttempt) * 1000;
                  setTimeout(() => {
                    if (!loadedUrls[attachment.id]) {
                      loadImageUrl(attachment);
                    }
                  }, backoffDelay);
                }
              });
            }
          }
        };

        // Load initial batch
        await loadBatch(0, initialBatchSize);

        // Load remaining images in background
        if (imageAttachments.length > initialBatchSize) {
          setTimeout(() => {
            loadBatch(initialBatchSize, imageAttachments.length);
          }, 1000);
        }
      };

      loadImages();
    }
  }, [imageAttachments, attachments, loadedUrls, loadingStates, loadImageUrl, options.preloadCount]);

  const preloadAdjacentImages = useCallback(async () => {
    if (!previewImage || imageAttachments.length <= 1) return;

    const nextIndex = (selectedImageIndex + 1) % imageAttachments.length;
    const prevIndex = (selectedImageIndex - 1 + imageAttachments.length) % imageAttachments.length;

    [nextIndex, prevIndex].forEach(index => {
      const attachment = attachments.find(a => a.id === imageAttachments[index].id);
      if (attachment && !loadedUrls[attachment.id] && !loadingStates[attachment.id]) {
        loadImageUrl(attachment);
      }
    });
  }, [selectedImageIndex, previewImage, imageAttachments, attachments, loadedUrls, loadingStates, loadImageUrl]);

  const getPreviewImages = useCallback(() => {
    return imageAttachments
      .filter(img => img.url)
      .map(img => ({
        url: img.url as string,
        alt: img.fileName
      }));
  }, [imageAttachments]);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
    setSelectedImageIndex(0);
  }, []);

  return {
    previewImage,
    selectedImageIndex,
    imageAttachments,
    isImage,
    handleImageClick,
    preloadAdjacentImages,
    getPreviewImages,
    closePreview,
    isLoading: (id: string) => loadingStates[id] || false
  };
};